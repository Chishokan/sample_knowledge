/**
 * chat.ts — チャネル非依存のチャット応答ロジック。
 *
 * Webでも後のLINE Messaging APIでも同じこの関数を呼べるように、
 * 入出力をチャネルから切り離している（HANDOFF.md「チャネル非依存」）。
 */
import { getAnthropic, CHAT_MODEL } from '@/lib/claude';
import { buildChatSystemPrompt } from '@/lib/prompts';
import { buildKnowledgeBase, type Region } from '@/lib/kb';
import { type Lang } from '@/lib/i18n';

export type Role = 'user' | 'assistant';

export interface ChatMessage {
  role: Role;
  content: string;
}

export interface GenerateReplyParams {
  /** 直近の会話履歴（末尾が最新のユーザー発話）。 */
  messages: ChatMessage[];
  /** 地域（佐世保/西海）。KBの切り替えに使う。 */
  region: Region;
  /** 返答言語。 */
  lang: Lang;
  /** 母国語＋日本語の併記モード（日本語選択時は無視）。 */
  bilingual?: boolean;
}

export interface GenerateReplyResult {
  reply: string;
}

const MAX_HISTORY = 20; // 直近の往復のみをモデルに渡す（コンテキスト節約）。

// 併記モード（母国語＋日本語）では出力が約2倍になるため、途中で切れないよう十分に確保する。
const MAX_TOKENS = 4096;

/** Claude へのリクエスト本体を組み立てる（create / stream で共用）。 */
function buildRequest(params: GenerateReplyParams) {
  const { messages, region, lang, bilingual } = params;

  const system = buildChatSystemPrompt({
    knowledgeBase: buildKnowledgeBase(region),
    lang,
    bilingual,
  });

  const trimmed = messages.slice(-MAX_HISTORY);

  return {
    model: CHAT_MODEL,
    max_tokens: MAX_TOKENS,
    // FAQ応答に深い思考は不要。思考をオフにして応答（特に最初のトークンまで）を速くする。
    thinking: { type: 'disabled' as const },
    system,
    messages: trimmed.map((m) => ({ role: m.role, content: m.content })),
  };
}

/**
 * KBグラウンディングされた応答をストリーミングで生成する（推奨）。
 * 返り値は Anthropic SDK の MessageStream。呼び出し側でテキストデルタを読み出す。
 */
export function streamReply(params: GenerateReplyParams) {
  return getAnthropic().messages.stream(buildRequest(params));
}

/**
 * KBグラウンディングされた応答を一括生成する（非ストリーミング）。
 * 会話ログの保存はこの関数の外側で行う想定。
 */
export async function generateReply(
  params: GenerateReplyParams
): Promise<GenerateReplyResult> {
  const response = await getAnthropic().messages.create(buildRequest(params));

  const reply = response.content
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('')
    .trim();

  return { reply };
}
