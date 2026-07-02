"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { aboutParagraphs, articles } from "@/data/articles";

const pageEase = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

export function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-black pt-24 text-white">
      <section dir="ltr" className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl grid-cols-1 items-center gap-8 px-5 py-12 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.div
          className="order-2 flex min-h-[30rem] items-center justify-center lg:order-1"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.85, ease: pageEase }}
        >
          <GeometricIdentity />
        </motion.div>

        <motion.div
          dir="rtl"
          className="order-1 text-right lg:order-2"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.85, ease: pageEase, delay: 0.08 }}
        >
          <p className="mb-5 inline-flex rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-black text-orange-300">
            مساحة قراءة عربية
          </p>
          <h1 className="whitespace-nowrap text-[clamp(3.25rem,7.6vw,7rem)] font-black leading-none tracking-normal">
            علي هاشمي
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-lg leading-9 text-white/70 md:text-xl">
            موقع شخصي يجمع نصوص علي الأدبية في تجربة قراءة حديثة، واضحة، ومبنية حول الأرشيف لا حول الزخرفة.
          </p>
          <div className="mt-10 flex flex-wrap justify-end gap-3">
            <Link href="/reading" className="rounded-full bg-orange-500 px-7 py-3 text-sm font-black text-white transition hover:bg-orange-400">
              ابدأ القراءة
            </Link>
            <Link href="/about" className="rounded-full border border-white/15 bg-white/[0.06] px-7 py-3 text-sm font-black text-white/78 transition hover:bg-white/10">
              عن الكاتب
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

export function ReadingPage() {
  const totalWords = articles.reduce((sum, article) => sum + Number.parseInt(article.words, 10), 0);
  const latestYear = Math.max(...articles.map((article) => Number(article.year)));

  return (
    <main className="min-h-screen bg-black pt-28 text-white">
      <section className="mx-auto max-w-7xl px-5 py-12">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.65, ease: pageEase }} className="mb-10 text-right">
          <p className="text-sm font-black text-orange-300">قراءة</p>
          <h1 className="mt-3 text-5xl font-black md:text-7xl">النصوص</h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-9 text-white/62">
            بطاقات مرتبة للقراءة السريعة، مع بيانات واضحة لكل نص ورابط مباشر إلى النسخة الكاملة.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article, index) => (
            <motion.article
              key={article.id}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.16 }}
              transition={{ duration: 0.55, ease: pageEase, delay: index * 0.035 }}
              whileHover={{ y: -8 }}
              className="group relative flex min-h-[29rem] flex-col rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-[0_26px_80px_rgba(0,0,0,.35)] backdrop-blur-xl"
            >
              <a
                href={`mailto:?subject=تعليق على نص ${article.title}`}
                className="absolute left-5 top-5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-black text-white/62 transition hover:border-orange-400/50 hover:text-orange-300"
              >
                تعليق
              </a>
              <p className="text-sm font-black text-orange-300">Text #{article.id}</p>
              <h2 className="mt-5 text-3xl font-black leading-tight text-white">{article.title}</h2>
              <p className="mt-4 text-pretty leading-8 text-white/64">{article.summary}</p>

              <div className="mt-7 grid grid-cols-3 gap-2">
                <InfoBox label="الكلمات" value={article.words.replace(" كلمة", "")} />
                <InfoBox label="التاريخ" value={article.date} />
                <InfoBox label="الوقت" value={article.readingTime} />
              </div>

              <div className="mt-5 space-y-1 text-xs font-bold text-white/46">
                <p>Text type: {article.genre}</p>
                <p>Writing style: {article.mood}</p>
              </div>

              <div className="mt-auto flex justify-center pt-8">
                <a
                  href={article.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-orange-500 px-9 py-3 text-sm font-black text-white transition hover:bg-orange-400"
                >
                  Read Now
                </a>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: pageEase }}
          className="mt-20 grid gap-6 md:grid-cols-3"
        >
          <TriangleStat label="Total texts" value={articles.length.toString()} tone="orange" />
          <TriangleStat label="Approx. words" value={totalWords.toLocaleString("en-US")} tone="white" />
          <TriangleStat label="Latest year" value={latestYear.toString()} tone="gray" />
        </motion.div>
      </section>
    </main>
  );
}

export function AboutPage() {
  return (
    <main className="min-h-screen bg-black pt-28 text-white">
      <section className="mx-auto grid min-h-[72vh] max-w-5xl place-items-center px-5 py-14">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.75, ease: pageEase }}
          className="rounded-[2.2rem] border border-white/10 bg-white/[0.055] p-8 text-center shadow-[0_26px_80px_rgba(0,0,0,.35)] backdrop-blur-xl md:p-12"
        >
          <p className="text-sm font-black text-orange-300">عن الكاتب</p>
          <h1 className="mt-4 text-4xl font-black md:text-6xl">علي هاشمي</h1>
          <div className="mx-auto mt-8 max-w-3xl space-y-5 text-pretty text-right text-lg leading-9 text-white/68">
            {aboutParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mx-auto grid min-h-[70vh] max-w-4xl place-items-center px-5 py-20">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7, ease: pageEase }}
          className="w-full text-center"
        >
          <p className="text-balance text-4xl font-black leading-tight md:text-6xl">
            كل نص لا يشرح العالم فقط؛ بل يعيد ترتيب الضوء داخله.
          </p>
          <form className="mx-auto mt-10 flex max-w-xl flex-col gap-3 rounded-full border border-white/10 bg-white/[0.06] p-2 backdrop-blur-xl sm:flex-row">
            <label className="sr-only" htmlFor="email">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="أدخل بريدك الإلكتروني"
              className="min-h-12 flex-1 rounded-full border border-transparent bg-transparent px-5 text-right text-white outline-none placeholder:text-white/40 focus:border-orange-400"
            />
            <button type="submit" className="rounded-full bg-orange-500 px-7 py-3 text-sm font-black text-white transition hover:bg-orange-400">
              اشتراك
            </button>
          </form>
        </motion.div>
      </section>
    </main>
  );
}

function GeometricIdentity() {
  return (
    <motion.div
      className="relative h-[29rem] w-full max-w-[31rem]"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.35, ease: pageEase }}
      aria-label="تكوين هندسي بصري"
    >
      <motion.div
        className="absolute left-10 top-9 h-0 w-0 border-b-[180px] border-l-[104px] border-r-[104px] border-b-orange-500 border-l-transparent border-r-transparent"
        animate={{ y: [0, -12, 0], rotate: [0, 2, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-10 top-24 h-0 w-0 border-b-[124px] border-l-[72px] border-r-[72px] border-b-white/90 border-l-transparent border-r-transparent"
        animate={{ y: [0, 16, 0], rotate: [0, -3, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-14 right-20 h-0 w-0 border-b-[150px] border-l-[88px] border-r-[88px] border-b-gray-700 border-l-transparent border-r-transparent"
        animate={{ x: [0, 14, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute bottom-24 left-8 h-24 w-24 rounded-[1.1rem] border border-white/16 bg-white/[0.08]" />
      <div className="absolute left-36 top-52 h-20 w-40 rounded-[1.3rem] border border-orange-400/30 bg-orange-500/14" />
      <div className="absolute bottom-6 left-36 h-20 w-20 rounded-full border border-white/20 bg-white/[0.06]" />
      <div className="absolute right-5 top-10 h-px w-64 rotate-[-24deg] bg-white/24" />
      <div className="absolute bottom-28 left-8 h-px w-72 rotate-[18deg] bg-orange-400/60" />
      <div className="absolute left-28 top-20 h-64 w-px rotate-[10deg] bg-white/18" />
    </motion.div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/36 p-3 text-center">
      <p className="text-[0.68rem] font-black text-white/40">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function TriangleStat({ label, value, tone }: { label: string; value: string; tone: "orange" | "white" | "gray" }) {
  const styles = {
    orange: {
      triangle: "border-b-orange-500/92",
      value: "text-white",
      label: "text-white/76"
    },
    white: {
      triangle: "border-b-white/92",
      value: "text-black",
      label: "text-black/62"
    },
    gray: {
      triangle: "border-b-zinc-700/96",
      value: "text-white",
      label: "text-white/70"
    }
  }[tone];

  return (
    <div className="relative mx-auto grid h-72 w-72 place-items-center text-center">
      <div className={`absolute inset-0 h-0 w-0 border-b-[288px] border-l-[144px] border-r-[144px] border-l-transparent border-r-transparent ${styles.triangle}`} />
      <div className="relative z-10 mt-20">
        <p className={`text-5xl font-black ${styles.value}`}>{value}</p>
        <p className={`mt-2 text-sm font-black uppercase tracking-[0.18em] ${styles.label}`}>{label}</p>
      </div>
    </div>
  );
}
