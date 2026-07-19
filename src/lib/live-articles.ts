"use client";

/**
 * Live overlay — client-only helpers that surface articles committed from
 * the admin studio BEFORE the CI rebuild bakes them into the static site.
 *
 * The repo directory is listed once per session (unauthenticated; a public
 * repo needs no token), fresh *.md files are parsed with the same grammar
 * the build uses, and baked files are skipped entirely — their baked pages
 * keep rendering until the next deploy. Any failure (network, rate limit,
 * private repo) degrades to "nothing newer than the baked site".
 */

import { useEffect, useState } from "react";
import { articles, type Article } from "@/data/articles";
import { GITHUB } from "@/data/site-config";
import { fetchRawFile, listDir } from "@/lib/github";
import { parseArticleMarkdown, parsedToArticle } from "@/lib/article-markdown";

const bakedFiles = new Set(articles.map((article) => article.file));

/** Fetch + parse one raw .md by file stem; null on any failure. */
async function loadOne(file: string): Promise<Article | null> {
  const source = await fetchRawFile(`${GITHUB.contentDir}/${file}.md`);
  if (!source) return null;
  try {
    const article = parsedToArticle(parseArticleMarkdown(source));
    /* live-only articles have no baked static page — the query-param reader serves them */
    return { ...article, href: `/read/?f=${file}` };
  } catch {
    return null;
  }
}

async function loadLiveArticles(): Promise<Article[]> {
  try {
    const entries = await listDir(GITHUB.contentDir);
    const fresh = entries
      .filter((entry) => entry.name.endsWith(".md"))
      .map((entry) => entry.name.replace(/\.md$/, ""))
      .filter((stem) => !bakedFiles.has(stem));
    const loaded = await Promise.all(fresh.map(loadOne));
    return loaded.filter((article): article is Article => article !== null);
  } catch {
    return [];
  }
}

/* Shared promise: the whole session hits the listing API at most once. */
let cache: Promise<Article[]> | null = null;

export function fetchLiveArticles(): Promise<Article[]> {
  if (!cache) cache = loadLiveArticles();
  return cache;
}

/** Direct read of one live article (no listing round-trip); null on failure. */
export function fetchLiveArticleByFile(file: string): Promise<Article | null> {
  return loadOne(file);
}

export function useLiveArticles(): { live: Article[]; loading: boolean } {
  const [live, setLive] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchLiveArticles().then((result) => {
      if (!active) return;
      setLive(result);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { live, loading };
}
