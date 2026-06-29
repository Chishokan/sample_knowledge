/**
 * i18n.ts — UIラベル・言語定義（クライアント/サーバー共用の純データ）。
 *
 * UIラベルの多言語は ja/en/vi/id を用意。ne/my は en にフォールバック（要・母語話者確認）。
 * チャット応答は7言語すべて対応（返答言語の指示は lib/prompts.ts の LANG_REPLY）。
 */
import { getFaqs, type FaqCategory, type Faq } from '@/lib/kb';

export type Lang = 'ja' | 'ja-easy' | 'en' | 'vi' | 'ne' | 'my' | 'id';
export type Region = 'sasebo' | 'saikai';

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'ja', label: '日本語' },
  { code: 'ja-easy', label: 'やさしい日本語' },
  { code: 'en', label: 'English' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'ne', label: 'नेपाली' },
  { code: 'my', label: 'မြန်မာ' },
  { code: 'id', label: 'Bahasa Indonesia' },
];

export const REGIONS: { code: Region; label: string; short: string }[] = [
  { code: 'sasebo', label: '佐世保市', short: '佐世保' },
  { code: 'saikai', label: '西海市', short: '西海' },
];

export const regionName = (r: Region): string =>
  r === 'saikai' ? '西海市' : '佐世保市';

/** JPカテゴリ → UIラベルキー。 */
const CAT_LABEL_KEY: Record<FaqCategory, string> = {
  就業規則: 'rules',
  安全衛生: 'safety',
  作業基準: 'ops',
  手続き: 'proce',
};
export const categoryLabelKey = (c: FaqCategory): string => CAT_LABEL_KEY[c];

/** FAQ の質問を、指定言語のラベルで返す。 */
export function qLabel(faq: Faq, lang: Lang): string {
  if (lang === 'ja' || lang === 'ja-easy') return faq.question;
  const loc = faq.questionLoc || {};
  return loc[lang] || loc.en || faq.question;
}

/** FAQ をカテゴリ順にグルーピングして返す。 */
export function faqsByCategory(): { category: FaqCategory; items: Faq[] }[] {
  const cats: FaqCategory[] = ['就業規則', '安全衛生', '作業基準', '手続き'];
  return cats.map((category) => ({
    category,
    items: getFaqs().filter((f) => f.category === category),
  }));
}

type Dict = Record<string, string>;

export const T: Record<'ja' | 'en' | 'vi' | 'id' | 'ne' | 'my', Dict> = {
  ja: {
    chat: 'チャット', faq: 'しつもん', help: 'こまったとき', proc: 'てつづき', set: 'せってい',
    intro: '就業規則・安全衛生・作業・各種手続きのことを、あなたの言葉で聞いてください。', ph: 'メッセージを入力…', staff: 'スタッフに相談する',
    faqTitle: 'よくあるしつもん', faqHint: '質問をタップすると、選んだ言語で答えます', helpTitle: 'こまったとき・緊急', emerg: '緊急の電話番号', med: '事故・けがのとき', consult: '相談する',
    procTitle: 'てつづき・よてい', procSoon: '準備中：在留更新などの時期をお知らせする機能を予定しています。', setLang: '言語', setRegion: '地域', setAbout: 'このアプリは、会話の内容をよりよい支援のために記録することがあります。',
    life: '生活', proce: '手続き', work: '仕事', other: 'その他', rules: '就業規則', safety: '安全衛生', ops: '作業基準', switched: '地域を切り替えました', staffMsg: 'スタッフにおつなぎします。確認して、できるだけ早くお返事します。（プロトタイプ）', errNet: '接続に失敗しました。',
    bilingual: '日本語も併記（学習用）', bilingualHint: '日本語以外を選ぶと、回答に日本語訳を併記します。',
    lblAmb: '救急・消防', lblPol: '警察', lblSea: '海の事故',
    medSasebo: '佐世保市立急病診療所（高砂町5-1／0956-25-3352）。月〜土 20:00〜23:00、日祝 10:00〜18:00。保険証を持参、支払いは現金のみ。',
    medSaikai: '西海市は休日に「在宅当番医」（日替わり）。受診の前に当番医へ電話で確認してください。当番医は西海市のHPで確認できます。',
    consultBody: 'まずは画面の「スタッフに相談する」へ。職場の安全・けが・体調は、職長や安全衛生担当者に相談できます。労働条件・賃金など仕事の悩みは、労働基準監督署や外国人労働者向けの相談窓口（多言語）も利用できます。相談したことで不利に扱われることはありません。',
    firstAid: '①まず自分の安全を確保し、二次災害を防ぐ。②近くの監視員・職長・現場責任者にすぐ知らせる。③重いけが・急病・火災は119番。④軽いけがでも必ず報告する（労災の手続きのため）。タンク内・高所など危険な場所では、無理に助けに入らず応援を呼ぶ。',
  },
  en: {
    chat: 'Chat', faq: 'FAQ', help: 'Help', proc: 'To-Do', set: 'Settings',
    intro: 'Ask about work rules, safety, on-site work, or procedures — in your language.', ph: 'Type a message…', staff: 'Talk to staff',
    faqTitle: 'Frequently asked', faqHint: 'Tap a question to get the answer in your language', helpTitle: 'Help & Emergency', emerg: 'Emergency numbers', med: 'If an accident or injury happens', consult: 'Get help',
    procTitle: 'Procedures & reminders', procSoon: 'Coming soon: reminders for residence renewal and other deadlines.', setLang: 'Language', setRegion: 'Area', setAbout: 'This app may record conversations to provide better support.',
    life: 'Daily life', proce: 'Procedures', work: 'Work', other: 'Other', rules: 'Work Rules', safety: 'Safety', ops: 'Work Standards', switched: 'Area switched', staffMsg: 'Connecting you to staff. We will check and reply as soon as possible. (Prototype)', errNet: 'Connection failed.',
    bilingual: 'Show Japanese too (for learning)', bilingualHint: 'When a non-Japanese language is selected, replies also include a Japanese translation.',
    lblAmb: 'Ambulance & Fire', lblPol: 'Police', lblSea: 'Sea accidents',
    medSasebo: 'Sasebo City Emergency Clinic (Takasago-cho 5-1 / 0956-25-3352). Mon–Sat 20:00–23:00; Sun & holidays 10:00–18:00. Bring your insurance card; cash only.',
    medSaikai: "In Saikai City, on-call doctors (different each day) handle holiday emergencies. Call the on-call clinic before visiting. Check today's on-call doctor on the Saikai City website.",
    consultBody: 'Start with "Talk to staff" on screen. For workplace safety, injuries, or health, talk to your foreman or the safety & health officer. For work concerns like working conditions or wages, you can also use the Labor Standards Inspection Office or a multilingual consultation desk for foreign workers. You will not be treated unfairly for asking.',
    firstAid: '1) Secure your own safety first and prevent secondary accidents. 2) Immediately alert a nearby watch person, foreman, or site supervisor. 3) For serious injury, sudden illness, or fire, call 119. 4) Report even minor injuries (needed for work-accident insurance). In tanks or at height, do not rush in to help — call for backup.',
  },
  vi: {
    chat: 'Trò chuyện', faq: 'Câu hỏi', help: 'Trợ giúp', proc: 'Thủ tục', set: 'Cài đặt',
    intro: 'Hãy hỏi về nội quy lao động, an toàn, công việc tại hiện trường hoặc thủ tục bằng ngôn ngữ của bạn.', ph: 'Nhập tin nhắn…', staff: 'Nói chuyện với nhân viên',
    faqTitle: 'Câu hỏi thường gặp', faqHint: 'Chạm vào câu hỏi để nhận câu trả lời bằng ngôn ngữ của bạn', helpTitle: 'Trợ giúp & Khẩn cấp', emerg: 'Số điện thoại khẩn cấp', med: 'Khi có tai nạn hoặc bị thương', consult: 'Nhận trợ giúp',
    procTitle: 'Thủ tục & nhắc nhở', procSoon: 'Sắp ra mắt: nhắc nhở gia hạn tư cách lưu trú và các thời hạn khác.', setLang: 'Ngôn ngữ', setRegion: 'Khu vực', setAbout: 'Ứng dụng có thể ghi lại cuộc trò chuyện để hỗ trợ tốt hơn.',
    life: 'Đời sống', proce: 'Thủ tục', work: 'Công việc', other: 'Khác', rules: 'Nội quy lao động', safety: 'An toàn & vệ sinh', ops: 'Tiêu chuẩn làm việc', switched: 'Đã chuyển khu vực', staffMsg: 'Đang kết nối với nhân viên. Chúng tôi sẽ kiểm tra và trả lời sớm nhất có thể. (Bản thử nghiệm)', errNet: 'Kết nối thất bại.',
    bilingual: 'Hiển thị thêm tiếng Nhật (để học)', bilingualHint: 'Khi chọn ngôn ngữ khác tiếng Nhật, câu trả lời sẽ kèm bản dịch tiếng Nhật.',
    lblAmb: 'Cấp cứu & Cứu hỏa', lblPol: 'Cảnh sát', lblSea: 'Tai nạn trên biển',
    medSasebo: 'Phòng khám cấp cứu TP Sasebo (Takasago-cho 5-1 / 0956-25-3352). T2–T7 20:00–23:00; CN & ngày lễ 10:00–18:00. Mang thẻ bảo hiểm; chỉ tiền mặt.',
    medSaikai: 'Tại TP Saikai, bác sĩ trực luân phiên (thay đổi mỗi ngày) khám vào ngày lễ. Hãy gọi điện trước khi đến. Xem bác sĩ trực hôm nay trên trang web TP Saikai.',
    consultBody: 'Trước tiên hãy dùng "Nói chuyện với nhân viên" trên màn hình. Về an toàn, chấn thương hoặc sức khỏe tại nơi làm việc, hãy hỏi tổ trưởng hoặc cán bộ an toàn vệ sinh. Về điều kiện làm việc hoặc tiền lương, bạn cũng có thể dùng Cơ quan Thanh tra Lao động hoặc quầy tư vấn đa ngôn ngữ cho người lao động nước ngoài. Bạn sẽ không bị đối xử bất lợi vì đã hỏi.',
    firstAid: '1) Trước tiên bảo đảm an toàn cho bản thân, tránh tai nạn thứ cấp. 2) Báo ngay cho người giám sát, tổ trưởng hoặc người phụ trách hiện trường gần nhất. 3) Thương nặng, bệnh đột ngột hoặc cháy: gọi 119. 4) Vết thương nhẹ cũng phải báo cáo (để làm thủ tục tai nạn lao động). Ở trong bồn hoặc trên cao, đừng lao vào cứu — hãy gọi hỗ trợ.',
  },
  id: {
    chat: 'Obrolan', faq: 'Tanya Jawab', help: 'Bantuan', proc: 'Prosedur', set: 'Pengaturan',
    intro: 'Tanyakan tentang peraturan kerja, keselamatan, pekerjaan di lokasi, atau prosedur dalam bahasa Anda.', ph: 'Ketik pesan…', staff: 'Hubungi staf',
    faqTitle: 'Pertanyaan umum', faqHint: 'Ketuk pertanyaan untuk mendapat jawaban dalam bahasa Anda', helpTitle: 'Bantuan & Darurat', emerg: 'Nomor darurat', med: 'Saat terjadi kecelakaan atau cedera', consult: 'Minta bantuan',
    procTitle: 'Prosedur & pengingat', procSoon: 'Segera hadir: pengingat perpanjangan izin tinggal dan tenggat lainnya.', setLang: 'Bahasa', setRegion: 'Wilayah', setAbout: 'Aplikasi ini dapat merekam percakapan untuk dukungan yang lebih baik.',
    life: 'Kehidupan', proce: 'Prosedur', work: 'Pekerjaan', other: 'Lainnya', rules: 'Peraturan Kerja', safety: 'Keselamatan & Kesehatan', ops: 'Standar Kerja', switched: 'Wilayah diganti', staffMsg: 'Menghubungkan Anda ke staf. Kami akan memeriksa dan membalas secepatnya. (Prototipe)', errNet: 'Koneksi gagal.',
    bilingual: 'Tampilkan juga bahasa Jepang (untuk belajar)', bilingualHint: 'Saat memilih bahasa selain Jepang, jawaban juga menyertakan terjemahan bahasa Jepang.',
    lblAmb: 'Ambulans & Pemadam', lblPol: 'Polisi', lblSea: 'Kecelakaan laut',
    medSasebo: 'Klinik Darurat Kota Sasebo (Takasago-cho 5-1 / 0956-25-3352). Sen–Sab 20:00–23:00; Min & hari libur 10:00–18:00. Bawa kartu asuransi; hanya tunai.',
    medSaikai: 'Di Kota Saikai, dokter jaga (berbeda tiap hari) menangani keadaan darurat saat libur. Telepon klinik jaga sebelum datang. Cek dokter jaga hari ini di situs web Kota Saikai.',
    consultBody: 'Mulailah dengan "Hubungi staf" di layar. Untuk keselamatan kerja, cedera, atau kesehatan, bicaralah dengan mandor atau petugas K3. Untuk masalah kerja seperti kondisi kerja atau upah, Anda juga bisa menggunakan Kantor Pengawas Standar Ketenagakerjaan atau loket konsultasi multibahasa untuk pekerja asing. Anda tidak akan diperlakukan tidak adil karena bertanya.',
    firstAid: '1) Amankan diri Anda dahulu dan cegah kecelakaan susulan. 2) Segera beri tahu pengawas, mandor, atau penanggung jawab lokasi terdekat. 3) Untuk cedera berat, sakit mendadak, atau kebakaran, telepon 119. 4) Laporkan cedera ringan sekalipun (untuk asuransi kecelakaan kerja). Di tangki atau di ketinggian, jangan nekat menolong — panggil bantuan.',
  },
  ne: {
    chat: 'कुराकानी', faq: 'प्रश्नहरू', help: 'सहायता', proc: 'प्रक्रिया', set: 'सेटिङ',
    intro: 'कार्य नियम, सुरक्षा, कामकाज वा प्रक्रियाबारे आफ्नो भाषामा सोध्नुहोस्।', ph: 'सन्देश लेख्नुहोस्…', staff: 'कर्मचारीसँग कुरा गर्नुहोस्',
    faqTitle: 'प्रायः सोधिने प्रश्नहरू', faqHint: 'प्रश्नमा ट्याप गर्नुहोस्, तपाईंको भाषामा जवाफ आउँछ', helpTitle: 'सहायता र आपतकाल', emerg: 'आपतकालीन फोन नम्बर', med: 'दुर्घटना वा चोटपटक हुँदा', consult: 'सहयोग लिनुहोस्',
    procTitle: 'प्रक्रिया र रिमाइन्डर', procSoon: 'चाँडै आउँदै: बसाइँ अनुमति नवीकरण लगायत म्याद सम्झाउने सुविधा।', setLang: 'भाषा', setRegion: 'क्षेत्र', setAbout: 'राम्रो सहयोगका लागि यो एपले कुराकानी रेकर्ड गर्न सक्छ।',
    life: 'जीवन', proce: 'प्रक्रिया', work: 'काम', other: 'अन्य', rules: 'कार्य नियम', safety: 'सुरक्षा र स्वास्थ्य', ops: 'कार्य मापदण्ड', switched: 'क्षेत्र परिवर्तन भयो', staffMsg: 'कर्मचारीसँग जोड्दैछौं। जाँचेर सकेसम्म चाँडो जवाफ दिनेछौं। (प्रोटोटाइप)', errNet: 'जडान असफल भयो।',
    bilingual: 'जापानी पनि देखाउनुहोस् (सिक्नका लागि)', bilingualHint: 'जापानी बाहेकको भाषा छान्दा, जवाफमा जापानी अनुवाद पनि समावेश हुन्छ।',
    lblAmb: 'एम्बुलेन्स/अग्निशमन', lblPol: 'प्रहरी', lblSea: 'समुद्री दुर्घटना',
    medSasebo: 'सासेबो सिटी आकस्मिक क्लिनिक (Takasago-cho 5-1 / 0956-25-3352)। सोम–शनि 20:00–23:00; आइत/बिदा 10:00–18:00। बीमा कार्ड ल्याउनुहोस्; नगद मात्र।',
    medSaikai: 'साइकाई सिटीमा बिदाको दिन आकस्मिकका लागि पालैपालो डाक्टर (हरेक दिन फरक) हुन्छन्। जानुअघि फोन गर्नुहोस्। आजको डाक्टर साइकाई सिटीको वेबसाइटमा हेर्नुहोस्।',
    consultBody: 'पहिले स्क्रिनको "कर्मचारीसँग कुरा गर्नुहोस्" प्रयोग गर्नुहोस्। कार्यस्थलको सुरक्षा, चोट वा स्वास्थ्यबारे फोरम्यान वा सुरक्षा/स्वास्थ्य अधिकारीसँग कुरा गर्नुहोस्। कामका सर्त वा तलबजस्ता समस्यामा श्रम मापदण्ड निरीक्षण कार्यालय वा विदेशी श्रमिकका लागि बहुभाषिक परामर्श डेस्क पनि प्रयोग गर्न सकिन्छ। सोधेकै कारण प्रतिकूल व्यवहार गरिने छैन।',
    firstAid: '१) पहिले आफ्नो सुरक्षा सुनिश्चित गर्नुहोस् र दोस्रो दुर्घटना रोक्नुहोस्। २) नजिकैको निगरानीकर्ता, फोरम्यान वा साइट जिम्मेवारलाई तुरुन्तै खबर गर्नुहोस्। ३) गम्भीर चोट, अचानक बिरामी वा आगलागीमा 119 फोन गर्नुहोस्। ४) सानो चोट भए पनि अनिवार्य रिपोर्ट गर्नुहोस् (श्रम दुर्घटना प्रक्रियाका लागि)। ट्यांकभित्र वा अग्लो स्थानमा आफैं उद्धारमा नजानुहोस् — सहयोग बोलाउनुहोस्।',
  },
  my: {
    chat: 'စကားပြော', faq: 'မေးခွန်းများ', help: 'အကူအညီ', proc: 'လုပ်ငန်းစဉ်', set: 'ဆက်တင်',
    intro: 'အလုပ်စည်းမျဉ်း၊ ဘေးကင်းရေး၊ လုပ်ငန်းခွင်အလုပ်နှင့် လုပ်ထုံးလုပ်နည်းများကို သင့်ဘာသာစကားဖြင့် မေးပါ။', ph: 'စာရိုက်ပါ…', staff: 'ဝန်ထမ်းနှင့် ဆက်သွယ်ပါ',
    faqTitle: 'မကြာခဏ မေးသော မေးခွန်းများ', faqHint: 'မေးခွန်းကို နှိပ်ပါ၊ သင့်ဘာသာဖြင့် ဖြေပါမည်', helpTitle: 'အကူအညီနှင့် အရေးပေါ်', emerg: 'အရေးပေါ် ဖုန်းနံပါတ်များ', med: 'မတော်တဆမှု သို့မဟုတ် ဒဏ်ရာရချိန်', consult: 'အကူအညီ ရယူပါ',
    procTitle: 'လုပ်ငန်းစဉ်နှင့် သတိပေးချက်', procSoon: 'မကြာမီ: နေထိုင်ခွင့် သက်တမ်းတိုးခြင်းစသည့် သတိပေးချက်များ။', setLang: 'ဘာသာစကား', setRegion: 'ဒေသ', setAbout: 'ပိုမိုကောင်းမွန်သော ပံ့ပိုးမှုအတွက် ဤအက်ပ်သည် စကားဝိုင်းကို မှတ်တမ်းတင်နိုင်သည်။',
    life: 'နေ့စဉ်ဘဝ', proce: 'လုပ်ထုံးလုပ်နည်း', work: 'အလုပ်', other: 'အခြား', rules: 'အလုပ်စည်းမျဉ်း', safety: 'ဘေးကင်းရေးနှင့်ကျန်းမာရေး', ops: 'လုပ်ငန်းစံ', switched: 'ဒေသ ပြောင်းပြီး', staffMsg: 'ဝန်ထမ်းနှင့် ချိတ်ဆက်ပေးနေပါသည်။ စစ်ဆေးပြီး အမြန်ဆုံး ပြန်ဖြေပါမည်။ (ပုံစံငယ်)', errNet: 'ချိတ်ဆက်မှု မအောင်မြင်ပါ။',
    bilingual: 'ဂျပန်ဘာသာပါ ပြပါ (လေ့လာရန်)', bilingualHint: 'ဂျပန်မဟုတ်သော ဘာသာစကား ရွေးချယ်ပါက အဖြေတွင် ဂျပန်ဘာသာပြန်လည်း ပါဝင်ပါမည်။',
    lblAmb: 'အရေးပေါ်/မီးသတ်', lblPol: 'ရဲ', lblSea: 'ပင်လယ်ပြင် မတော်တဆမှု',
    medSasebo: 'Sasebo မြို့ အရေးပေါ်ဆေးခန်း (Takasago-cho 5-1 / 0956-25-3352)။ တနင်္လာ–စနေ 20:00–23:00; တနင်္ဂနွေ/ရုံးပိတ် 10:00–18:00။ အာမခံကတ် ယူဆောင်ပါ; ငွေသားသာ။',
    medSaikai: 'Saikai မြို့တွင် ရုံးပိတ်ရက် အရေးပေါ်အတွက် တာဝန်ကျဆရာဝန် (နေ့စဉ်ပြောင်း) ရှိသည်။ မလာမီ ဖုန်းခေါ်ပါ။ ယနေ့ ဆရာဝန်ကို Saikai မြို့ ဝက်ဘ်ဆိုက်တွင် ကြည့်ပါ။',
    consultBody: 'ပထမဦးစွာ မျက်နှာပြင်ရှိ "ဝန်ထမ်းနှင့် ဆက်သွယ်ပါ" ကို သုံးပါ။ လုပ်ငန်းခွင် ဘေးကင်းရေး၊ ဒဏ်ရာ သို့မဟုတ် ကျန်းမာရေးအတွက် လုပ်ငန်းခွဲ ခေါင်းဆောင် သို့မဟုတ် ဘေးကင်းရေး/ကျန်းမာရေး တာဝန်ခံနှင့် တိုင်ပင်ပါ။ အလုပ်အခြေအနေ သို့မဟုတ် လုပ်ခ ကိစ္စများအတွက် အလုပ်သမား စံချိန်စစ်ဆေးရေးရုံး သို့မဟုတ် နိုင်ငံခြားသား အလုပ်သမားများအတွက် ဘာသာစုံ တိုင်ပင်ရေးကောင်တာကိုလည်း သုံးနိုင်သည်။ မေးမြန်းသည့်အတွက် မတရား ဆက်ဆံခြင်း မရှိပါ။',
    firstAid: '၁) ဦးစွာ မိမိ၏ ဘေးကင်းရေးကို သေချာစေပြီး ဒုတိယ မတော်တဆမှုကို ကာကွယ်ပါ။ ၂) အနီးနားရှိ စောင့်ကြည့်သူ၊ လုပ်ငန်းခွဲ ခေါင်းဆောင် သို့မဟုတ် လုပ်ငန်းခွင် တာဝန်ခံကို ချက်ချင်း အကြောင်းကြားပါ။ ၃) ပြင်းထန်သော ဒဏ်ရာ၊ ရုတ်တရက် ဖျားနာမှု သို့မဟုတ် မီးလောင်မှုအတွက် 119 ကို ခေါ်ပါ။ ၄) သေးငယ်သော ဒဏ်ရာဖြစ်လည်း မဖြစ်မနေ အစီရင်ခံပါ (လုပ်ငန်းခွင် ထိခိုက်မှု အာမခံအတွက်)။ တင့်ကီအတွင်း သို့မဟုတ် မြင့်သောနေရာတွင် အတင်း မကယ်ဘဲ အကူအညီ ခေါ်ပါ။',
  },
};

/** UIラベル取得。ja-easy は ja を使用。未定義キーは en→ja でフォールバック。 */
export function tr(lang: Lang, key: string): string {
  const base = lang === 'ja-easy' ? 'ja' : lang;
  const dict = T[base as keyof typeof T];
  return (dict && dict[key]) || T.en[key] || T.ja[key];
}
