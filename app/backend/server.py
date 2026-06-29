"""就業規則チャットボット（デモ）の FastAPI バックエンド。

- 起動時に corpus.json を読み込み、全規程をシステムプロンプトに載せる。
- Anthropic 公式 SDK で claude-opus-4-8（既定）を呼び出す。MODEL / MAX_TOKENS は環境変数で上書き可。
- システムプロンプトには prompt caching（cache_control: ephemeral）を付与する。
- /api/chat は SSE ストリーミング、/api/health はヘルスチェック、/ でフロントを配信する。
- 簡易パスワード（APP_PASSWORD）は任意。未設定なら誰でも利用可。

これは架空企業「サンプル株式会社」のサンプルデータによるデモです。
"""

from __future__ import annotations

import json
import os
from pathlib import Path

import anthropic
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel

load_dotenv()

# ---------------------------------------------------------------------------
# パス・設定
# ---------------------------------------------------------------------------
BACKEND_DIR = Path(__file__).resolve().parent
ROOT_DIR = BACKEND_DIR.parent.parent
CORPUS_PATH = BACKEND_DIR / "corpus.json"
FRONTEND_PATH = ROOT_DIR / "app" / "frontend" / "index.html"

# 環境変数で上書き可能。既定モデルは claude-opus-4-6。
MODEL = os.environ.get("MODEL", "claude-opus-4-6")
MAX_TOKENS = int(os.environ.get("MAX_TOKENS", "2048"))
APP_PASSWORD = os.environ.get("APP_PASSWORD", "").strip()

BRAND_NAME = "サンプル株式会社 就業規則アシスタント"


# ---------------------------------------------------------------------------
# corpus 読み込み・システムプロンプト構築
# ---------------------------------------------------------------------------
def load_corpus() -> dict:
    if not CORPUS_PATH.exists():
        raise RuntimeError(
            f"corpus.json が見つかりません: {CORPUS_PATH}\n"
            "先に `python app/backend/ingest.py` を実行してください。"
        )
    return json.loads(CORPUS_PATH.read_text(encoding="utf-8"))


def build_system_prompt(corpus: dict) -> str:
    """全規程本文を載せたシステムプロンプトを構築する。"""
    parts: list[str] = []
    parts.append(
        "あなたは「サンプル株式会社」の就業規則アシスタントです。"
        "以下に示す社内規程（すべて架空企業向けのサンプルデータ）のみを根拠として、"
        "従業員からの質問に回答してください。\n\n"
        "回答のルール:\n"
        "1. 必ず以下の規程本文を根拠にすること。一般論や推測で答えないこと。\n"
        "2. 回答には根拠となった規程名と条番号（例: 就業規則 第11条）を必ず明示すること。\n"
        "3. 規程に該当する記載が見つからない場合は、無理に推測せず正直に「規程には記載が"
        "見つからないため不明です」と答えること。\n"
        "4. これはサンプルデータによるデモであり、実際の判断は人事・専門家へ確認するよう"
        "必要に応じて促すこと。\n"
        "5. 出力言語は、別途与えられる「出力言語の指定」に従うこと。\n\n"
        "===== 社内規程（サンプルデータ）ここから =====\n"
    )

    for doc in corpus.get("documents", []):
        parts.append(
            f"\n----- {doc['title']}（種別: {doc['kind']} / 出典: {doc['source']}）-----\n"
            f"{doc['text']}\n"
        )

    parts.append("\n===== 社内規程（サンプルデータ）ここまで =====\n")
    return "".join(parts)


# 日本語を表す表記のゆれ（これらが指定された場合は日本語のみで回答する）
JAPANESE_ALIASES = {"日本語", "ja", "ja-jp", "japanese", "jp"}


def build_language_directive(language: str) -> str:
    """選択言語に応じた「出力言語の指定」を生成する。

    システムプロンプト本体（規程全文）はキャッシュを効かせるため固定し、
    言語ごとに変化するこの小さな指定だけを別ブロックとして付与する。
    """
    lang = (language or "").strip()
    if not lang or lang.lower() in JAPANESE_ALIASES:
        return "【出力言語の指定】\n回答は日本語で出力してください。"

    return (
        "【出力言語の指定】\n"
        f"今回の回答は、必ず「{lang}」と「日本語」の2言語で出力してください。\n"
        f"- まず {lang} で回答し、その後に「---」の区切り行に続けて日本語で回答してください。\n"
        "- どちらの言語の回答でも、根拠となる規程名・条番号を明示してください"
        "（規程名・条番号は原文の日本語表記のままで構いません）。\n"
        "- 規程に該当が見つからない場合は、両方の言語で正直に「不明」である旨を回答してください。"
    )


CORPUS = load_corpus()
SYSTEM_PROMPT = build_system_prompt(CORPUS)

# Anthropic クライアント（ANTHROPIC_API_KEY を環境から解決）
client = anthropic.Anthropic()

app = FastAPI(title=BRAND_NAME)


# ---------------------------------------------------------------------------
# 認証（簡易パスワード・任意）
# ---------------------------------------------------------------------------
def check_password(provided: str | None) -> None:
    """APP_PASSWORD が設定されている場合のみ照合する。未設定なら誰でも可。"""
    if not APP_PASSWORD:
        return
    if provided != APP_PASSWORD:
        raise HTTPException(status_code=401, detail="パスワードが正しくありません。")


# ---------------------------------------------------------------------------
# リクエストモデル
# ---------------------------------------------------------------------------
class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    # 出力言語。未指定または日本語系の場合は日本語のみで回答する。
    language: str = "日本語"


# ---------------------------------------------------------------------------
# エンドポイント
# ---------------------------------------------------------------------------
@app.get("/api/health")
def health() -> dict:
    """ヘルスチェック。規程の件数・総文字数を返す。"""
    return {
        "status": "ok",
        "company": CORPUS.get("company"),
        "is_sample_data": CORPUS.get("is_sample_data", True),
        "document_count": CORPUS.get("document_count", 0),
        "total_characters": CORPUS.get("total_characters", 0),
        "model": MODEL,
        "password_protected": bool(APP_PASSWORD),
        "documents": [
            {"id": d["id"], "title": d["title"], "kind": d["kind"]}
            for d in CORPUS.get("documents", [])
        ],
    }


@app.post("/api/chat")
def chat(req: ChatRequest, x_app_password: str | None = Header(default=None)):
    """SSE ストリーミングで回答を返す。"""
    check_password(x_app_password)

    if not req.messages:
        raise HTTPException(status_code=400, detail="messages が空です。")

    # Anthropic Messages 形式に変換（system はトップレベルで渡すため除外）
    api_messages = [
        {"role": m.role, "content": m.content}
        for m in req.messages
        if m.role in ("user", "assistant")
    ]
    if not api_messages or api_messages[-1]["role"] != "user":
        raise HTTPException(status_code=400, detail="最後のメッセージは user である必要があります。")

    language_directive = build_language_directive(req.language)

    def event_stream():
        try:
            with client.messages.stream(
                model=MODEL,
                max_tokens=MAX_TOKENS,
                # 規程全文の前置きはキャッシュ対象（安定）。言語指定は変化するため
                # キャッシュ区切りより後ろの別ブロックに置く。
                system=[
                    {
                        "type": "text",
                        "text": SYSTEM_PROMPT,
                        "cache_control": {"type": "ephemeral"},
                    },
                    {
                        "type": "text",
                        "text": language_directive,
                    },
                ],
                messages=api_messages,
            ) as stream:
                for text in stream.text_stream:
                    # SSE データ行。改行を含むため JSON でエンコードして 1 行に収める。
                    yield f"data: {json.dumps({'text': text}, ensure_ascii=False)}\n\n"
            yield f"data: {json.dumps({'done': True}, ensure_ascii=False)}\n\n"
        except Exception as exc:  # noqa: BLE001 - クライアントへエラーを通知する
            yield f"data: {json.dumps({'error': str(exc)}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/")
def index():
    """フロント（単一 HTML）を配信する。"""
    if not FRONTEND_PATH.exists():
        raise HTTPException(status_code=404, detail="フロントエンドが見つかりません。")
    return FileResponse(FRONTEND_PATH)
