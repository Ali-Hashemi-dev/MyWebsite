/**
 * Central site configuration — identity, publishing, and community settings.
 *
 * The writer publishes under the pen name "عين" (the letter ع). The real
 * name must never appear in code, metadata, or content.
 */

/** Pen name as displayed across the site. */
export const PEN_NAME = "عين";

/** Full site title. */
export const SITE_TITLE = "مكتبة عين";

/**
 * GitHub coordinates used by the in-browser admin studio (/admin) to publish
 * articles, and by the live overlay to fetch freshly published texts before
 * the next static rebuild.
 */
export const GITHUB = {
  owner: "Ali-Hashemi-dev",
  repo: "MyWebsite",
  branch: "main",
  /** Repo-relative directory that holds article markdown files. */
  contentDir: "content/articles"
};

/**
 * SHA-256 hash of the admin PIN. The PIN only unlocks the admin interface;
 * actual publishing rights come from the GitHub token the admin pastes once
 * (kept in the browser's localStorage, never committed).
 *
 * Default PIN: 3141 — change it by hashing a new PIN:
 *   printf 'yourpin' | shasum -a 256
 * and replacing the value below.
 */
export const ADMIN_PIN_HASH =
  "51c94a510b50e68f490e35edd977845f9b008e3bb1a5c7f0d8eecf8b0b9794bf";

/**
 * Community settings for المجلس (the salon) and per-article discussions,
 * powered by giscus (GitHub Discussions). To enable:
 *   1. Make the repo public and enable Discussions in repo settings.
 *   2. Install the giscus app: https://github.com/apps/giscus
 *   3. Visit https://giscus.app, pick the repo, and copy repoId +
 *      categoryId here.
 * Until repoId is filled in, the site shows the letter form only.
 */
export const GISCUS = {
  repo: `${GITHUB.owner}/${GITHUB.repo}` as `${string}/${string}`,
  repoId: "",
  category: "Announcements",
  categoryId: ""
};

/**
 * Address readers write letters to. Use an alias that does not reveal the
 * writer's identity.
 */
export const CONTACT_EMAIL = "ain.library@gmail.com";
