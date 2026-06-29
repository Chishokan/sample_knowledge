"""docs/ 以下の Markdown / テキストを読み込み、corpus.json を生成する取り込みスクリプト。

OS依存コマンド（textutil 等）は使用せず、標準ライブラリのみで完結する。
各規程を {id, title, kind, source, text} の配列に変換し、全文字数・件数も併せて出力する。
"""

from __future__ import annotations

import json
import re
from pathlib import Path

# プロジェクトルート（このファイルから 2 つ上）と docs / 出力先
BACKEND_DIR = Path(__file__).resolve().parent
ROOT_DIR = BACKEND_DIR.parent.parent
DOCS_DIR = ROOT_DIR / "docs"
OUTPUT_PATH = BACKEND_DIR / "corpus.json"

# ファイル名（接頭辞の連番を除いたもの）から規程の種別を推定するための対応表
KIND_BY_KEYWORD = {
    "employment": "就業規則",
    "salary": "給与規程",
    "leave": "休暇・休業規程",
    "harassment": "ハラスメント防止規程",
    "privacy": "個人情報取扱規程",
    "telework": "テレワーク規程",
    "side_business": "副業・兼業規程",
}


def extract_title(text: str, fallback: str) -> str:
    """Markdown 本文の最初の見出し（# ...）をタイトルとして抽出する。"""
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith("#"):
            # 先頭の # と空白を取り除く。括弧書きの補足は残す。
            return stripped.lstrip("#").strip()
    return fallback


def guess_kind(stem: str, title: str) -> str:
    """ファイル名のキーワードから種別を推定し、無ければタイトルを使う。"""
    lowered = stem.lower()
    for keyword, kind in KIND_BY_KEYWORD.items():
        if keyword in lowered:
            return kind
    return title


def build_corpus() -> dict:
    """docs/ を走査して corpus 辞書を構築する。"""
    if not DOCS_DIR.is_dir():
        raise FileNotFoundError(f"docs ディレクトリが見つかりません: {DOCS_DIR}")

    documents: list[dict] = []
    # .md / .txt を対象に、ファイル名順で安定的に取り込む
    paths = sorted(
        p for p in DOCS_DIR.iterdir()
        if p.is_file() and p.suffix.lower() in {".md", ".txt"}
    )

    for index, path in enumerate(paths, start=1):
        text = path.read_text(encoding="utf-8").strip()
        if not text:
            continue
        title = extract_title(text, fallback=path.stem)
        # タイトル末尾の「（サンプル株式会社）」等の括弧書きを ID 種別推定からは外す
        clean_title = re.sub(r"（.*?）\s*$", "", title).strip() or title
        kind = guess_kind(path.stem, clean_title)
        documents.append(
            {
                "id": f"doc-{index:02d}",
                "title": clean_title,
                "kind": kind,
                "source": path.name,
                "text": text,
            }
        )

    total_chars = sum(len(doc["text"]) for doc in documents)

    return {
        "company": "サンプル株式会社",
        "is_sample_data": True,
        "document_count": len(documents),
        "total_characters": total_chars,
        "documents": documents,
    }


def main() -> None:
    corpus = build_corpus()
    OUTPUT_PATH.write_text(
        json.dumps(corpus, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"corpus.json を生成しました: {OUTPUT_PATH}")
    print(f"  規程件数  : {corpus['document_count']} 件")
    print(f"  総文字数  : {corpus['total_characters']} 文字")
    for doc in corpus["documents"]:
        print(f"  - [{doc['id']}] {doc['title']}（{len(doc['text'])} 文字 / {doc['source']}）")


if __name__ == "__main__":
    main()
