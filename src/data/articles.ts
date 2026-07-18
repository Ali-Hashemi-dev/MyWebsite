import { articles as generatedArticles } from "./articles.generated";

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "quote"; lines: string[] }
  | { type: "poem"; lines: string[] };

export type Article = {
  id: string;
  file: string;
  title: string;
  subtitle: string;
  date: string;
  year: string;
  category: string;
  genre: string;
  themes: string[];
  readingTime: string;
  words: string;
  mood: string;
  href: string;
  pdf: string;
  summary: string;
  signal: string;
  body: ArticleBlock[];
};

export const articles: Article[] = generatedArticles;

export function articleByFile(file: string): Article | undefined {
  return articles.find((article) => article.file === file);
}

export const aboutParagraphs = [
  "علي هاشمي؛ كاتبٌ لبناني نسج عالَمه الخاص، وجعل من الكتابة متنفساً عميقاً متعدّد الأوجه. تتداخل في نصوصه مسارات متباينة؛ بين القصة والمقال، والشعر الحر، في مزيجٍ أدبي لا يلتزم بحدود بقدر ما ينحاز إلى التعبير الصادق.",
  "يكتب علي لتوثيق الإبداع في لحظاته الخام، حيث تتحول الفكرة إلى نص، والشعور إلى إبداع. في كتاباته حضورٌ دائم للخيال، مع ميلٍ إلى العمق البلاغي الذي يمنح القارئ متعة التخيل، تندثر بين جمله أبعاد تمنح القارئ فرصة التنقيب عنها.",
  "أنشأ علي هذا الموقع ليكون مساحته الشخصية التي يعرض فيها مغامرته المفتوحة ورحلته الأدبية، متيحاً للقارئ تجربة ممتعة في التنقل بين النصوص، وإعادة قراءتها من زوايا مختلفة، ومشاركته الآراء بحرية.",
  "علي لا يقدّم مجرد نصوص للاستمتاع، بل يروي حكاية حِيكتْ لتتغلغل في أعماقك، وتُعيد تشكيل نظرتك للواقع من حولك."
];
