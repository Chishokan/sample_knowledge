/**
 * classify.ts — 会話ログ用のカテゴリ自動付与（軽量モデル）。
 *
 * 言語は利用者がUIで選ぶようになったため、ここでは分類しない。
 * カテゴリ（生活/手続き/学習/その他）のみを安価なモデルで推定する。
 * 失敗してもチャット本体は止めない（呼び出し側で握りつぶす）。
 */
import { getAnthropic, CLASSIFY_MODEL } from '@/lib/claude';
import { CATEGORIES, type FaqCategory } from '@/lib/kb';

const SYSTEM = `あなたは分類器です。次のユーザー発話を、最も近いカテゴリ1つに分類してください。
カテゴリ: 就業規則 / 安全衛生 / 作業基準 / 手続き
（就業規則=労働時間/休日/試用期間/手当/福利厚生/業務フローなど、安全衛生=保護具/高所・タンク内作業/KY活動/災害事例/標識/3Sなど、作業基準=玉掛け・クレーン・合図など、手続き=労災報告/各種申請など）
出力はカテゴリ名のみ（説明・記号・コードフェンスを付けない）。`;

/**
 * ユーザー発話のカテゴリを推定する。失敗時は '' を返す（例外は投げない）。
 */
export async function classifyCategory(userText: string): Promise<FaqCategory | ''> {
  try {
    const res = await getAnthropic().messages.create({
      model: CLASSIFY_MODEL,
      max_tokens: 16,
      system: SYSTEM,
      messages: [{ role: 'user', content: userText }],
    });

    const text = res.content
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('')
      .trim();

    const hit = CATEGORIES.find((c) => text.includes(c));
    return hit ?? '';
  } catch (err) {
    console.error('[classify] failed:', err instanceof Error ? err.message : err);
    return '';
  }
}
