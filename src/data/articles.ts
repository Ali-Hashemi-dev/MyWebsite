import { articles as generatedArticles } from "./articles.generated";

export type Article = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  year: string;
  category: string;
  genre: "قصة" | "مقال" | "شعر حر";
  themes: string[];
  readingTime: string;
  words: string;
  mood: string;
  href: string;
  pdf: string;
  summary: string;
  signal: string;
};

export const articles: Article[] = generatedArticles;

export const aboutParagraphs = [
  "علي هاشمي؛ كاتبٌ لبناني نسج عالَمه الخاص، وجعل من الكتابة متنفساً عميقاً متعدّد الأوجه. تتداخل في نصوصه مسارات متباينة؛ بين القصة والمقال، والشعر الحر، في مزيجٍ أدبي لا يلتزم بحدود بقدر ما ينحاز إلى التعبير الصادق.",
  "يكتب علي لتوثيق الإبداع في لحظاته الخام، حيث تتحول الفكرة إلى نص، والشعور إلى إبداع. في كتاباته حضورٌ دائم للخيال، مع ميلٍ إلى العمق البلاغي الذي يمنح القارئ متعة التخيل، تندثر بين جمله أبعاد تمنح القارئ فرصة التنقيب عنها.",
  "أنشأ علي هذا الموقع ليكون مساحته الشخصية التي يعرض فيها مغامرته المفتوحة ورحلته الأدبية، متيحاً للقارئ تجربة ممتعة في التنقل بين النصوص، وإعادة قراءتها من زوايا مختلفة، ومشاركته الآراء بحرية.",
  "علي لا يقدّم مجرد نصوص للاستمتاع، بل يروي حكاية حِيكتْ لتتغلغل في أعماقك، وتُعيد تشكيل نظرتك للواقع من حولك."
];

export const timeline = [
  {
    year: "2024",
    title: "تعانق الأرواح",
    text: "تثبيت نبرة عائلية حميمية تجعل العودة من الغربة حدثا شعوريا كاملا.",
    links: [{ label: "تعانق الأرواح", href: "/articles/article5.html" }]
  },
  {
    year: "2025",
    title: "الأرض والذاكرة",
    text: "انتقال السرد نحو البستان والقرية والنبات، حيث تصبح الطبيعة مرآة للهوية.",
    links: [
      { label: "لوحة المهيمن", href: "/articles/article2.html" },
      { label: "النباتات", href: "/articles/article4.html" }
    ]
  },
  {
    year: "2026",
    title: "نضج الخيال البلاغي",
    text: "توسع في الرسالة والمشهد الكابوسي والمساءلة الرمزية داخل سبعة نصوص مكتملة.",
    links: [
      { label: "منسوجات", href: "/articles/article1.html" },
      { label: "تلبد قاتم", href: "/articles/article3.html" },
      { label: "ياقوتة الصولجان", href: "/articles/article6.html" },
      { label: "مكان لا مكان له", href: "/articles/article7.html" }
    ]
  }
];

export const stats = [
  { value: 7, label: "نصوص محولة", suffix: "" },
  { value: 3, label: "أنماط كتابة", suffix: "" },
  { value: 2026, label: "آخر تحديث", suffix: "" },
  { value: 60, label: "إيقاع حركة مستهدف", suffix: " FPS" }
];
