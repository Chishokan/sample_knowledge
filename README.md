# サンプル株式会社 就業規則アシスタント（BtoB デモ）

> ⚠️ **これはサンプルデータによるデモです。**
> 本リポジトリで扱う規程はすべて、実在しない架空企業「**サンプル株式会社**」向けに作成した
> ダミーデータです。実在の企業・規程・人物とは一切関係ありません。回答は参考情報であり、
> 実際の判断は人事担当者・専門家へご確認ください。

社内規程（就業規則など）について自然言語で質問でき、**根拠となる規程名・条番号を明示して**
回答する就業規則チャットボットのデモです。Anthropic の Claude（既定 `claude-opus-4-8`）を
利用し、回答は必ず規程本文に基づきます。該当が無ければ正直に「不明」と答えます。

## 特長

- **根拠提示**: 回答に規程名・条番号（例: `就業規則 第11条`）を明示。
- **ハルシネーション抑制**: 規程に無い事項は推測せず「不明」と回答。
- **prompt caching**: 全規程を載せたシステムプロンプトに `cache_control: ephemeral` を付与し、
  繰り返し質問のコスト・レイテンシを低減。
- **SSE ストリーミング**: 回答をリアルタイムに表示。
- **依存なしの単一 HTML フロント**: IME 変換確定の Enter で誤送信しない実装（`isComposing` 判定）。

## ディレクトリ構成

```
.
├── docs/                       # ダミー規程（Markdown、条番号付き）7 本
│   ├── 01_employment_rules.md      就業規則
│   ├── 02_salary_rules.md          給与規程
│   ├── 03_leave_rules.md           休暇・休業規程
│   ├── 04_harassment_prevention.md ハラスメント防止規程
│   ├── 05_privacy_handling.md      個人情報取扱規程
│   ├── 06_telework_rules.md        テレワーク規程
│   └── 07_side_business_rules.md   副業・兼業規程
├── app/
│   ├── backend/
│   │   ├── ingest.py           docs/ を読み corpus.json を生成
│   │   ├── corpus.json         生成物（規程の配列・件数・全文字数）
│   │   └── server.py           FastAPI（/api/chat, /api/health, /）
│   └── frontend/
│       └── index.html          チャット UI（依存なし単一 HTML）
├── api/index.py                Vercel 用エントリポイント
├── vercel.json                 Vercel デプロイ設定
├── requirements.txt
├── .env.example
├── .gitignore
└── run.sh                      venv 作成→依存導入→ingest→起動
```

## 取り込み（ingest）

`docs/` 内の `.md` / `.txt` を読み込み、規程ごとに
`{id, title, kind, source, text}` の配列へ変換して `app/backend/corpus.json` を生成します
（全文字数・件数も出力）。OS 依存コマンド（`textutil` 等）は使用していません。

```bash
python app/backend/ingest.py
```

## ローカル起動

### かんたん起動（推奨）

```bash
./run.sh
```

`run.sh` は venv 作成 → 依存インストール → ingest → uvicorn 起動を一括で行います。
初回は `.env` が無ければ `.env.example` がコピーされるので、`ANTHROPIC_API_KEY` を設定してください。

### 手動起動

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env        # ANTHROPIC_API_KEY を設定
python app/backend/ingest.py
uvicorn app.backend.server:app --reload --port 8000
```

ブラウザで http://127.0.0.1:8000 を開きます。

### 動作確認

規程の件数が返ることを確認します。

```bash
curl -s http://127.0.0.1:8000/api/health
# => {"status":"ok","document_count":7,"total_characters":9588, ...}
```

## 環境変数

| 変数 | 必須 | 既定 | 説明 |
|------|------|------|------|
| `ANTHROPIC_API_KEY` | ○ | — | Anthropic の API キー |
| `APP_PASSWORD` | — | （空） | 簡易パスワード。未設定なら誰でも利用可 |
| `MODEL` | — | `claude-opus-4-8` | 使用モデル |
| `MAX_TOKENS` | — | `2048` | 1 回の応答の最大トークン数 |

`APP_PASSWORD` を設定すると、画面下部にパスワード入力欄が表示され、`/api/chat` 呼び出し時に
`X-App-Password` ヘッダで照合します。

## デモの見せ方

1. 画面上部の「**DEMO / サンプルデータ**」バッジで、サンプルデータであることを明示。
2. 例質問ボタンから代表的な質問をワンクリックで投入できます。
   - 「有給休暇は入社後いつから何日もらえますか？」→ 休暇・休業規程 第4条 を根拠に回答
   - 「定年は何歳ですか？」→ 就業規則 第11条 を根拠に回答
   - 「副業は認められていますか？」→ 副業・兼業規程 を根拠に回答
3. 規程に無い質問（例: 「社員食堂のメニューは？」）を投げると、推測せず「不明」と回答することを
   示せます。これがハルシネーション抑制の訴求ポイントです。
4. 回答に**規程名・条番号**が付くため、根拠の追跡性（監査対応）をアピールできます。

## Vercel へのデプロイ

`@vercel/python` を用いて `api/index.py` で FastAPI アプリを公開します。
`vercel.json` の `includeFiles: app/**` により規程・フロントを同梱します。

1. このリポジトリを Vercel に接続。
2. Environment Variables に `ANTHROPIC_API_KEY`（必要なら `APP_PASSWORD` / `MODEL` / `MAX_TOKENS`）を設定。
3. デプロイ。`corpus.json` が無い場合は起動時に自動生成されます。

## ライセンス / 注意

本デモのサンプル規程は一般的・無難な内容のダミーであり、法的助言ではありません。
実際の就業規則の整備・運用は、必ず専門家にご相談ください。
