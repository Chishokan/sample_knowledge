"""Vercel（@vercel/python）用エントリポイント。

app/backend/server.py の FastAPI アプリ（app）をそのまま公開する。
Vercel 上では corpus.json が含まれている前提のため、無ければ起動時に生成する。
"""

import sys
from pathlib import Path

# プロジェクトルートを import パスに追加（app パッケージを解決するため）
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

# corpus.json が無ければ ingest を実行して生成しておく
CORPUS_PATH = ROOT_DIR / "app" / "backend" / "corpus.json"
if not CORPUS_PATH.exists():
    from app.backend import ingest

    ingest.main()

from app.backend.server import app  # noqa: E402  (パス設定後に import する)

# Vercel の Python ランタイムは ASGI アプリ `app` を検出して公開する
__all__ = ["app"]
