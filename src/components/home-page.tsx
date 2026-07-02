"use client";

import {
  ArrowUpLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Feather,
  Flame,
  Star,
  Zap
} from "lucide-react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { AmbientBackground, CursorGlow, ScrollProgress } from "@/components/ambient-background";
import { MagneticLink } from "@/components/magnetic-link";
import { aboutParagraphs, articles, stats, timeline } from "@/data/articles";

const navItems = [
  { href: "#archive", label: "الأرشيف" },
  { href: "#about", label: "عن الكاتب" },
  { href: "#process", label: "الرحلة" },
  { href: "#faq", label: "الأسئلة" },
  { href: "#pricing", label: "الدعم" }
];

const plans = [
  {
    title: "قارئ",
    price: "مجاني",
    text: "دخول كامل إلى النصوص السبعة ونسخ PDF الأصلية.",
    items: ["قراءة HTML", "تحميل PDF", "تنقل سريع"]
  },
  {
    title: "قارئ عميق",
    price: "$4",
    text: "مسار دعم رمزي لملاحظات نقدية وقراءات مستقبلية.",
    items: ["تعليقات تحريرية", "أولوية للنصوص الجديدة", "رسالة شهرية"]
  },
  {
    title: "راع أدبي",
    price: "$12",
    text: "دعم مباشر لتطوير الأرشيف وإضافة تجارب تفاعلية جديدة.",
    items: ["ذكر في صفحة الداعمين", "جلسة قراءة فصلية", "أولوية اقتراحات"]
  }
];

const faqs = [
  {
    q: "هل المقالات المعروضة هي نفسها الموجودة في ملفات PDF؟",
    a: "نعم. تم تحويل الملفات إلى HTML قابل للقراءة، مع الاحتفاظ بالنسخ الأصلية داخل قسم PDF لكل مقال."
  },
  {
    q: "لماذا الموقع داكن افتراضيا؟",
    a: "الخلفية الداكنة ترفع تركيز النص وتمنح البرتقالي مساحة ضوئية واضحة بدون إرهاق بصري."
  },
  {
    q: "هل يمكن قراءة الموقع من الهاتف؟",
    a: "نعم. الواجهة مصممة Mobile-first وتتكيف مع الشاشات الصغيرة مع تقليل الحركة عند تفعيل خيار تقليل الحركة في النظام."
  },
  {
    q: "هل العضويات مفعلة الآن؟",
    a: "القسم يوضح بنية الدعم المقترحة. القراءة الحالية متاحة مجانا بالكامل من الأرشيف."
  }
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 }
};

const allFilter = "الكل";

export function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-night text-paper">
      <ScrollProgress />
      <AmbientBackground />
      <CursorGlow />
      <LoadingOverlay />
      <div className="relative z-20">
        <Navigation />
        <Hero />
        <LatestText />
        <Archive />
        <Stats />
        <About />
        <Timeline />
        <FAQ />
        <Pricing />
        <CTA />
        <Footer />
      </div>
    </main>
  );
}

function LoadingOverlay() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <motion.div
      aria-hidden={!visible}
      className="fixed inset-0 z-[60] grid place-items-center bg-night"
      initial={{ opacity: 1 }}
      animate={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-black text-paper shadow-premium backdrop-blur-xl"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-ember-400 shadow-[0_0_24px_rgba(249,115,22,.8)]" />
        علي هاشمي / مزيج أدبي
      </motion.div>
    </motion.div>
  );
}

function Navigation() {
  const [active, setActive] = useState("#archive");

  useEffect(() => {
    const sections = navItems
      .map((item) => document.querySelector(item.href))
      .filter((section): section is Element => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) setActive(`#${visible.target.id}`);
      },
      { threshold: [0.2, 0.45, 0.7], rootMargin: "-20% 0px -55% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-0 top-4 z-40 px-4">
      <nav
        aria-label="التنقل الرئيسي"
        className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-night/62 px-3 py-3 shadow-premium backdrop-blur-2xl"
      >
        <a href="#home" className="flex items-center gap-3 rounded-full pr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember-300">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-ember-500 text-sm font-black text-white shadow-ember">
            AH
          </span>
          <span className="hidden text-sm font-black text-paper sm:block">علي هاشمي</span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ember-300 ${
                active === item.href ? "bg-white text-night" : "text-white/72 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>

        <MagneticLink href="/articles/article1.html" target="_blank" rel="noreferrer" className="min-h-10 px-4 py-2">
          ابدأ القراءة
          <ArrowUpLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 group-hover:translate-y-1" />
        </MagneticLink>
      </nav>
    </header>
  );
}

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", reducedMotion ? "0%" : "24%"]);
  const visualY = useTransform(scrollYProgress, [0, 1], ["0%", reducedMotion ? "0%" : "-18%"]);

  return (
    <section id="home" ref={ref} className="relative flex min-h-screen items-center px-5 pt-32">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
        <motion.div style={{ y: textY }} className="max-w-4xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-7 inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white/78 backdrop-blur-xl"
          >
            <Flame className="h-4 w-4 text-ember-400" />
            بوابة قراءة أدبية
          </motion.div>

          <motion.h1
            className="text-balance text-[clamp(4.5rem,15vw,12.5rem)] font-black leading-[0.9] text-white"
            initial={{ opacity: 0, y: 48, filter: "blur(18px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          >
            علي
            <span className="block bg-gradient-to-l from-ember-300 via-ember-500 to-ember-800 bg-clip-text text-transparent">
              هاشمي
            </span>
          </motion.h1>

          <motion.p
            className="mt-8 max-w-3xl text-pretty text-xl leading-10 text-white/72 md:text-2xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            نصوص عربية قصيرة تتحرك بين القصة والمقال والشعر الحر.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.58, ease: [0.22, 1, 0.36, 1] }}
          >
            <MagneticLink href="/articles/article1.html" target="_blank" rel="noreferrer">
              ابدأ القراءة
              <BookOpen className="h-4 w-4" />
            </MagneticLink>
            <MagneticLink href="#archive" variant="ghost">
              تصفح الأرشيف
              <ArrowUpLeft className="h-4 w-4" />
            </MagneticLink>
          </motion.div>
        </motion.div>

        <motion.div style={{ y: visualY }} className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-8 rounded-[3rem] bg-ember-500/20 blur-3xl" />
          <motion.div
            className="gradient-border relative min-h-[32rem] overflow-hidden rounded-[2rem] bg-white/[0.06] p-6 shadow-premium backdrop-blur-2xl"
            initial={{ opacity: 0, scale: 0.88, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(249,115,22,.36),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(255,255,255,.14),transparent_28%),linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.02))]" />
            <div className="absolute inset-6 rounded-[1.45rem] border border-white/10 bg-night/58 backdrop-blur-xl" />
            <div className="relative z-10 flex min-h-[29rem] flex-col justify-between">
              <div className="flex items-center justify-between gap-4 text-sm font-black text-white/58">
                <span>ARCHIVE / 07</span>
                <span>2026</span>
              </div>
              <div className="space-y-4">
                <div className="h-px w-full bg-gradient-to-l from-transparent via-ember-300/70 to-transparent" />
                <p className="max-w-sm text-5xl font-black leading-tight text-white">بوابة قراءة لا معرض صور.</p>
                <p className="max-w-sm text-pretty leading-8 text-white/64">
                  اللون والحركة والنص كافية لبناء الهوية البصرية.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {["قصة", "مقال", "شعر حر"].map((item) => (
                  <span key={item} className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-4 text-center text-sm font-black text-white/72">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <motion.div
              className="absolute bottom-8 left-8 max-w-[17rem] rounded-3xl border border-white/15 bg-night/72 p-5 shadow-premium backdrop-blur-2xl"
              animate={reducedMotion ? undefined : { y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="text-sm font-black text-ember-300">آخر نص</p>
              <p className="mt-2 text-2xl font-black">مكان لا مكان له</p>
              <p className="mt-2 text-sm leading-6 text-white/65">قصر مهجور، زمن معطل، وخيال يختبر العتمة.</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function LatestText() {
  const latest = articles[articles.length - 1];

  return (
    <section className="px-5 py-16">
      <Reveal className="gradient-border mx-auto max-w-7xl overflow-hidden rounded-[2.4rem] bg-white/[0.065] p-7 shadow-premium backdrop-blur-2xl md:p-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm font-black text-ember-300">آخر نص</p>
            <h2 className="mt-3 text-balance text-4xl font-black leading-tight text-white md:text-6xl">{latest.title}</h2>
            <p className="mt-4 max-w-3xl text-pretty text-lg leading-9 text-white/68">{latest.summary}</p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-white/60">
              {[latest.genre, latest.date, latest.readingTime, latest.mood].map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <MagneticLink href={latest.href} target="_blank" rel="noreferrer">
            قراءة آخر نص
            <ArrowUpRight className="h-4 w-4" />
          </MagneticLink>
        </div>
      </Reveal>
    </section>
  );
}

function About() {
  return (
    <Section id="about" eyebrow="عن الكاتب" title="علي هاشمي في سطور">
      <div className="grid gap-8 lg:grid-cols-[.86fr_1.14fr]">
        <Reveal className="gradient-border relative overflow-hidden rounded-[2rem] bg-white/[0.06] p-6 shadow-premium backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_20%,rgba(249,115,22,.28),transparent_36%),linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.02))]" />
          <div className="relative z-10 flex min-h-[28rem] flex-col justify-between rounded-[1.45rem] border border-white/10 bg-night/55 p-6 backdrop-blur-xl">
            <div>
              <p className="text-sm font-black text-ember-300">الهوية البصرية</p>
              <p className="mt-4 text-4xl font-black leading-tight text-white">برتقالي للأفعال، أبيض للقراءة، فحمي للهدوء.</p>
            </div>
            <div className="space-y-3">
              {[
                ["#F97316", "إشارة وحركة"],
                ["#FFF8EF", "نص ووضوح"],
                ["#080706", "خلفية وتركيز"]
              ].map(([color, label]) => (
                <div key={color} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <span className="font-black text-white">{color}</span>
                  <span className="text-sm font-bold text-white/58">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-premium backdrop-blur-2xl md:p-10">
          <div className="flex items-center gap-3 text-ember-300">
            <Feather className="h-5 w-5" />
            <span className="text-sm font-black">علي هاشمي</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-black text-white/68">
            {["قصة", "مقال", "شعر حر"].map((tag) => (
              <span key={tag} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-7 space-y-5 text-pretty text-lg leading-9 text-white/76">
            {aboutParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function Archive() {
  const [genre, setGenre] = useState(allFilter);
  const [theme, setTheme] = useState(allFilter);
  const [year, setYear] = useState(allFilter);

  const genres = [allFilter, ...Array.from(new Set(articles.map((article) => article.genre)))];
  const themes = [allFilter, ...Array.from(new Set(articles.flatMap((article) => article.themes)))];
  const years = [allFilter, ...Array.from(new Set(articles.map((article) => article.year)))];

  const filteredArticles = articles.filter((article) => {
    const genreMatch = genre === allFilter || article.genre === genre;
    const themeMatch = theme === allFilter || article.themes.includes(theme);
    const yearMatch = year === allFilter || article.year === year;
    return genreMatch && themeMatch && yearMatch;
  });

  return (
    <Section id="archive" eyebrow="الأرشيف" title="ابدأ من النص المناسب لك">
      <div className="mb-6 grid gap-3 rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-4 backdrop-blur-2xl lg:grid-cols-3">
        <FilterGroup label="النوع" options={genres} value={genre} onChange={setGenre} />
        <FilterGroup label="الثيمة" options={themes} value={theme} onChange={setTheme} />
        <FilterGroup label="السنة" options={years} value={year} onChange={setYear} />
      </div>
      <div className="grid gap-4 lg:grid-cols-6">
        {filteredArticles.map((article, index) => (
          <TiltCard
            key={article.id}
            className={`p-6 ${index === 0 ? "lg:col-span-3 lg:row-span-2" : "lg:col-span-3"} ${
              index > 2 ? "lg:col-span-2" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black text-ember-300">{article.genre}</p>
                <h3 className="mt-3 text-3xl font-black text-white">{article.title}</h3>
                <p className="mt-2 text-lg text-white/58">{article.subtitle}</p>
              </div>
              <span className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-sm font-black text-white/70">
                {article.id}
              </span>
            </div>
            <p className="mt-6 text-pretty leading-8 text-white/68">{article.summary}</p>
            <div className="mt-5 grid gap-2 text-sm text-white/58 sm:grid-cols-3">
              <span>{article.readingTime}</span>
              <span>{article.words}</span>
              <span>{article.date}</span>
            </div>
            <div className="mt-7 flex flex-wrap gap-2 text-xs font-bold text-white/58">
              {Array.from(new Set([article.mood, ...article.themes, ...article.signal.split("، ")])).map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <MagneticLink href={article.href} target="_blank" rel="noreferrer" className="min-h-10 px-5 py-2">
                قراءة HTML
                <ArrowUpRight className="h-4 w-4" />
              </MagneticLink>
              <MagneticLink href={article.pdf} target="_blank" rel="noreferrer" variant="ghost" className="min-h-10 px-4 py-2">
                PDF
              </MagneticLink>
            </div>
          </TiltCard>
        ))}
      </div>
      {filteredArticles.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-white/66">
          لا توجد نصوص مطابقة لهذا الاختيار.
        </p>
      ) : null}
    </Section>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-black text-white/46">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-full px-3 py-2 text-xs font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ember-300 ${
              value === option ? "bg-paper text-night" : "border border-white/10 bg-white/[0.05] text-white/64 hover:text-white"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function Stats() {
  return (
    <section className="px-5 py-12">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Reveal
            key={stat.label}
            className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-7 text-center shadow-premium backdrop-blur-2xl"
          >
            <AnimatedStat value={stat.value} suffix={stat.suffix} />
            <p className="mt-3 text-sm font-bold text-white/58">{stat.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Timeline() {
  return (
    <Section id="process" eyebrow="الرحلة" title="خط زمني مختصر لتطور النبرة">
      <div className="relative">
        <div className="absolute right-5 top-0 hidden h-full w-px bg-gradient-to-b from-ember-400 via-white/20 to-transparent md:block" />
        <div className="space-y-5">
          {timeline.map((item, index) => (
            <Reveal key={item.year} className="relative grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.055] p-7 shadow-premium backdrop-blur-2xl md:grid-cols-[10rem_1fr] md:pr-16">
              <span className="absolute right-[1.05rem] top-8 hidden h-4 w-4 rounded-full bg-ember-400 shadow-[0_0_28px_rgba(249,115,22,.9)] md:block" />
              <div>
                <p className="text-4xl font-black text-ember-300">{item.year}</p>
                <p className="mt-1 text-sm font-bold text-white/46">مرحلة {index + 1}</p>
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">{item.title}</h3>
                <p className="mt-3 text-pretty leading-8 text-white/66">{item.text}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {item.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-black text-white/62 transition hover:text-ember-300"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Pricing() {
  return (
    <Section id="pricing" eyebrow="الدعم المقترح — غير مفعّل حالياً" title="القراءة مجانية بالكامل">
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan, index) => (
          <Reveal
            key={plan.title}
            className={`rounded-[2rem] border p-7 shadow-premium backdrop-blur-2xl ${
              index === 1
                ? "gradient-border border-transparent bg-ember-500/12"
                : "border-white/10 bg-white/[0.055]"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-black text-white">{plan.title}</h3>
              {index === 1 ? <Star className="h-5 w-5 fill-ember-300 text-ember-300" /> : <Zap className="h-5 w-5 text-white/40" />}
            </div>
            <p className="mt-6 text-5xl font-black text-white">{plan.price}</p>
            <p className="mt-5 min-h-16 text-pretty leading-8 text-white/66">{plan.text}</p>
            <ul className="mt-7 space-y-3">
              {plan.items.map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/72">
                  <Check className="h-4 w-4 text-ember-300" />
                  {item}
                </li>
              ))}
            </ul>
            <span className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-black text-white/48">
              غير مفعّل حالياً
            </span>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <Section id="faq" eyebrow="أسئلة" title="تفاصيل عملية قبل القراءة">
      <div className="mx-auto max-w-4xl space-y-3">
        {faqs.map((item, index) => (
          <Reveal key={item.q} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] shadow-premium backdrop-blur-2xl">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-right text-lg font-black text-white outline-none transition hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-ember-300"
              onClick={() => setOpen(open === index ? -1 : index)}
              aria-expanded={open === index}
            >
              <span>{item.q}</span>
              <motion.span animate={{ rotate: open === index ? 180 : 0 }}>
                <ChevronDown className="h-5 w-5 text-ember-300" />
              </motion.span>
            </button>
            <motion.div
              initial={false}
              animate={{ height: open === index ? "auto" : 0, opacity: open === index ? 1 : 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <p className="px-6 pb-6 leading-8 text-white/66">{item.a}</p>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function CTA() {
  return (
    <section className="px-5 py-24">
      <Reveal className="gradient-border mx-auto max-w-6xl overflow-hidden rounded-[2.4rem] bg-white/[0.065] p-8 shadow-premium backdrop-blur-2xl md:p-14">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm font-black text-ember-300">ابدأ القراءة من النص الأول</p>
            <h2 className="mt-4 text-balance text-4xl font-black leading-tight text-white md:text-6xl">
              اقرأ، عد، وانظر إلى الجملة من زاوية أخرى.
            </h2>
            <p className="mt-5 max-w-3xl text-pretty text-lg leading-9 text-white/68">
              كل مقال متاح كصفحة HTML للقراءة السلسة، ومعه ملف PDF الأصلي للحفظ والمراجعة.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:flex-col">
            <MagneticLink href="/articles/article1.html" target="_blank" rel="noreferrer">
              ابدأ القراءة من النص الأول
              <BookOpen className="h-4 w-4" />
            </MagneticLink>
            <MagneticLink href="#archive" variant="ghost">
              العودة إلى الأرشيف
              <ArrowUpLeft className="h-4 w-4" />
            </MagneticLink>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 px-5 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-white/52 md:flex-row md:items-center md:justify-between">
        <p>© 2026 علي هاشمي. مزيج أدبي.</p>
        <div className="flex flex-wrap gap-4">
          <a className="transition hover:text-ember-300" href="#about">
            عن الكاتب
          </a>
          <a className="transition hover:text-ember-300" href="#archive">
            المقالات
          </a>
          <a className="transition hover:text-ember-300" href="/articles/article7.html" target="_blank" rel="noreferrer">
            آخر نص
          </a>
        </div>
      </div>
    </footer>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="px-5 py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-10 max-w-4xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-sm font-black text-ember-300">
            <span className="h-2 w-2 rounded-full bg-ember-400" />
            {eyebrow}
          </p>
          <h2 className="mt-5 text-balance text-4xl font-black leading-tight text-white md:text-6xl">{title}</h2>
        </Reveal>
        {children}
      </div>
    </section>
  );
}

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function TiltCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reducedMotion = useReducedMotion();
  const [style, setStyle] = useState({ rotateX: 0, rotateY: 0 });

  return (
    <motion.article
      className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] shadow-premium backdrop-blur-2xl ${className}`}
      style={reducedMotion ? undefined : { rotateX: style.rotateX, rotateY: style.rotateY, transformStyle: "preserve-3d" }}
      onPointerMove={(event) => {
        if (reducedMotion) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        const px = (event.clientX - bounds.left) / bounds.width - 0.5;
        const py = (event.clientY - bounds.top) / bounds.height - 0.5;
        setStyle({ rotateX: py * -5, rotateY: px * 5 });
      }}
      onPointerLeave={() => setStyle({ rotateX: 0, rotateY: 0 })}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-ember-300/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="absolute -left-14 -top-14 h-32 w-32 rounded-full bg-ember-500/15 blur-2xl transition-transform duration-500 group-hover:scale-150" />
      <div className="relative z-10">{children}</div>
    </motion.article>
  );
}

function AnimatedStat({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.7 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const totalFrames = 72;

    const tick = () => {
      frame += 1;
      const progress = 1 - Math.pow(1 - frame / totalFrames, 3);
      setCount(Math.round(value * Math.min(progress, 1)));
      if (frame < totalFrames) requestAnimationFrame(tick);
    };

    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [inView, value]);

  return (
    <div ref={ref} className="text-5xl font-black text-white md:text-6xl">
      {count}
      <span className="text-ember-300">{suffix}</span>
    </div>
  );
}
