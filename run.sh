#!/usr/bin/env bash
# ローカル起動スクリプト:
#   1) venv を作成（無ければ）
#   2) 依存をインストール
#   3) ingest を実行して corpus.json を生成
#   4) uvicorn でサーバを起動
set -euo pipefail

cd "$(dirname "$0")"

# 1) venv 作成
if [ ! -d ".venv" ]; then
  echo "==> 仮想環境 .venv を作成します"
  python3 -m venv .venv
fi

# shellcheck disable=SC1091
source .venv/bin/activate

# 2) 依存インストール
echo "==> 依存パッケージをインストールします"
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

# 3) 取り込み（corpus.json 生成）
echo "==> docs/ を取り込み corpus.json を生成します"
python app/backend/ingest.py

# .env が無ければ .env.example をコピー（ANTHROPIC_API_KEY の設定を促す）
if [ ! -f ".env" ]; then
  echo "==> .env が見つからないため .env.example をコピーします（ANTHROPIC_API_KEY を設定してください）"
  cp .env.example .env
fi

# 4) サーバ起動
echo "==> サーバを起動します: http://127.0.0.1:8000"
exec uvicorn app.backend.server:app --reload --host 0.0.0.0 --port 8000
