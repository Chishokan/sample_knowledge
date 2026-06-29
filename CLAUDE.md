# CLAUDE.md — 造船業 就業規則・安全衛生サポート（多言語Q&Aチャット）

このファイルは Claude Code が毎セッション最初に読む永続ガイドです。プロジェクトの全体背景・仕様の詳細は **docs/HANDOFF.md** を必ず参照してください。

## これは何か

造船会社で働く従業員（外国人就業者を含む）を支える多言語Q&Aチャット。AIが、版管理されたFAQ知識ベース（架空の「サンプル造船株式会社」の就業規則・安全衛生・作業基準・手続き）に基づいて、利用者の言語で質問に答える。会話ログを定期的にAIが解析し、職員へ状況レポートを出す。

## いま作る範囲

- **Phase 1（実装済み）**: 多言語Q&Aチャット（KBグラウンディング／7言語の言語選択＋やさしい日本語／母国語＋日本語の併記モード（学習用・設定でON/OFF）／地域切替 佐世保・西海でKB切替／5タブUI チャット・FAQ・こまったとき・てつづき・設定／スタッフ誘導の座席）。DBは使わず /data/faq.json を直接KBソースとして利用。会話ログ（スプレッドシート・任意）あり。
- **今後の方針（ユーザー合意）**: 営業資料・開発仕様書 第2案に沿い、**B2Bマルチテナント中心**へ拡張。確定スタック＝**Next.js + Supabase(PostgreSQL+RLS+Auth+pgvector) + Vercel + Anthropic Claude + RAG**。セキュリティは「テナント隔離(RLS)＋機密はリンク案内のみ（本文保存しない）＋エスカレーション」。詳細は docs/SPEC_V2.md（正）／差分整理は docs/ROADMAP_B2B.md。
- **Phase 2（後）**: 会話ログ保存／カテゴリ自動分類／日次AIレポート（運営サマリー＋要フォロー抽出）／職員向け一覧。
- **後フェーズ**: 機能①AI学習（既存eラーニングとの棲み分け方針が未確定）／メンタル深刻検知のリアルタイム自動介入／LINEチャネル配信。

## 技術スタック

既存資産（学生管理アプリの Next.js 15 / React 19 / Prisma / PostgreSQL 移行）と揃える前提：

- **Next.js (App Router) + TypeScript / React**
- **Vercel デプロイ（git push 連携）＋ Vercel Cron（日次レポートは Phase 2）**
- LLM: **Anthropic Claude API**（サーバー側のみ。キーはクライアントに出さない）
- Phase 2 で **Prisma + PostgreSQL** を追加。

> 注: 当初 GitHub Pages 公開の案があったが、静的サイトではAPIキーを秘匿できず、DB/Cronも使えないため、HANDOFF.md「未決事項#1」に従い **Next.js + Vercel** で進めることをユーザーと合意済み。GAS版プロトタイプ（参考）は使わない。

## リポジトリ構成

```
/app                  Next.js ルート
/app/page.tsx         チャットUI（クライアント）
/app/api/chat         チャット応答（Claude呼び出し・KB注入）。Phase 2でログ保存を追加
/app/api/cron/report  日次レポート生成（Phase 2・未実装）
/lib                  prompts.ts / claude.ts / chat.ts / kb.ts
/data/faq.json        FAQ知識ベース（リポジトリ内の正本。26項目／就業規則・安全衛生・作業基準・手続き）
/docs/HANDOFF.md      引き継ぎ・全仕様
```

## コマンド

- 開発: `npm run dev`
- ビルド: `npm run build`
- Lint/型: `npm run lint` / `npm run typecheck`
- デプロイ: `git push`（Vercel が自動デプロイ）

## 環境変数（.env・Vercel に設定。リポジトリにコミットしない）

- `ANTHROPIC_API_KEY` — Claude APIキー（サーバー専用）
- `ANTHROPIC_CHAT_MODEL` — （任意）チャット用モデルID。未設定時はコードの既定値。
- `ANTHROPIC_CLASSIFY_MODEL` — （任意）ログ分類用の軽量モデルID。未設定時はコードの既定値。
- `SHEETS_WEBAPP_URL` / `SHEETS_WEBAPP_TOKEN` — （任意）スプレッドシート会話ログ（GAS Web App）。両方設定でログON。手順は docs/SHEETS_LOGGING.md。
- （Phase 2のDB/レポート）`DATABASE_URL` / `CRON_SECRET` / 任意の `LINEWORKS_*`

## 守るべき原則（非交渉）

1. **KBグラウンディング**: 回答はFAQ知識ベースに基づく。KBに無い内容は断定せず「スタッフ（安全衛生担当など）に確認を」へ誘導。金額・日程など変わる情報は「最新の社内規程や現場の担当者で確認」を添える。
2. **在留資格・ビザの法的判断はしない**: 一般的な流れ説明に留め、判断は専門窓口/スタッフへ。
3. **秘密情報をクライアントに出さない**: APIキー等は必ずサーバー側。
4. **プライバシー**: レポートは氏名でなくセッションIDで扱う（ログに氏名を保存しない）。閲覧権限を絞る。
5. **安全**: レポートは職員の気づきを助ける「補助」で診断ではない。ボットは常に緊急番号・相談窓口を案内する。
6. **多言語**: 利用者の入力言語で返す。KBの正本は日本語、出力時にLLMが言語変換。「やさしい日本語」モードあり。
7. **モバイル前提**: 主な利用者はスマホ。回答は要点を先に短く。

## FAQ知識ベース

- 正本は /data/faq.json。26項目（造船業向けサンプル：就業規則・安全衛生・作業基準・手続き）。
- フィールド: id, category(就業規則/安全衛生/作業基準/手続き), status(確認済/ドラフト可/要確認), question, questionLoc(en/vi/id の質問ラベル), answer。
- 「安全衛生」「作業基準」カテゴリ（保護具・高所/タンク内作業・KY活動・玉掛けなど）は安全に直結するため正確に伝え、資格・免許が必要な作業は有資格者以外が行わないよう必ず注意する。
- answer は文字列（本サンプルは社内共通で地域差なし）。KB文字列は lib/kb.ts の buildKnowledgeBase が組み立てる。地域(region)切替UIは残っているが、現ナレッジでは回答に影響しない。
- status は内部管理用（KB文字列には出さない）。status: 要確認 の項目（高所作業手当・社員寮の金額など）は変わりやすく、公開前に最新の社内規程で要確認。質問ラベルは en/vi/id を用意（ne/my は en にフォールバック・要確認）。

## プロンプト

/lib/prompts.ts に集約する。原文は docs/HANDOFF.md の「7. プロンプト」に記載。
