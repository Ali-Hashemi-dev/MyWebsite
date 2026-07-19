/**
 * Browser-side GitHub client — the site's only "backend".
 *
 * The admin studio commits article markdown straight to the repo with the
 * GitHub Contents API, authenticated by a fine-grained personal access
 * token that lives ONLY in the admin's browser (localStorage). Readers
 * never need a token: public reads go through raw.githubusercontent.com.
 *
 * Every publish is therefore a real git commit — fully trackable on GitHub,
 * and it triggers the Pages deploy workflow to rebake the static site.
 */

import { GITHUB } from "@/data/site-config";

const TOKEN_KEY = "ain-admin-github-token";
const API = "https://api.github.com";

export function getStoredToken(): string {
  try {
    return window.localStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setStoredToken(token: string) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token.trim());
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable — token just won't persist */
  }
}

function authHeaders(): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function apiError(response: Response, fallback: string): Promise<Error> {
  let detail = "";
  try {
    const body = (await response.json()) as { message?: string };
    detail = body.message ?? "";
  } catch {
    /* non-JSON error body */
  }
  if (response.status === 401) return new Error("رمز الوصول مرفوض — تحقق من الرمز في الإعدادات");
  if (response.status === 404) return new Error(`${fallback}: غير موجود (404)`);
  return new Error(detail ? `${fallback}: ${detail}` : `${fallback} (${response.status})`);
}

/* UTF-8 <-> base64 helpers (btoa/atob alone mangle Arabic) */
export function encodeBase64Utf8(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function decodeBase64Utf8(base64: string): string {
  const binary = atob(base64.replace(/\s/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export type RepoFile = { name: string; path: string; sha: string };

/** List files in a repo directory (needs token for private repos). */
export async function listDir(path: string): Promise<RepoFile[]> {
  const response = await fetch(
    `${API}/repos/${GITHUB.owner}/${GITHUB.repo}/contents/${path}?ref=${GITHUB.branch}`,
    { headers: authHeaders(), cache: "no-store" }
  );
  if (!response.ok) throw await apiError(response, "تعذّر جلب قائمة الملفات");
  const body = (await response.json()) as RepoFile[];
  return body.map(({ name, path: filePath, sha }) => ({ name, path: filePath, sha }));
}

/** Read one file (content + sha, sha is required to update it later). */
export async function getFile(path: string): Promise<{ content: string; sha: string }> {
  const response = await fetch(
    `${API}/repos/${GITHUB.owner}/${GITHUB.repo}/contents/${path}?ref=${GITHUB.branch}`,
    { headers: authHeaders(), cache: "no-store" }
  );
  if (!response.ok) throw await apiError(response, "تعذّر قراءة الملف");
  const body = (await response.json()) as { content: string; sha: string };
  return { content: decodeBase64Utf8(body.content), sha: body.sha };
}

/** Create or update a file — one git commit. Pass sha when updating. */
export async function putFile(
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<void> {
  const response = await fetch(`${API}/repos/${GITHUB.owner}/${GITHUB.repo}/contents/${path}`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      branch: GITHUB.branch,
      content: encodeBase64Utf8(content),
      ...(sha ? { sha } : {})
    })
  });
  if (!response.ok) throw await apiError(response, "تعذّر النشر");
}

/** Delete a file — one git commit. */
export async function deleteFile(path: string, message: string, sha: string): Promise<void> {
  const response = await fetch(`${API}/repos/${GITHUB.owner}/${GITHUB.repo}/contents/${path}`, {
    method: "DELETE",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ message, branch: GITHUB.branch, sha })
  });
  if (!response.ok) throw await apiError(response, "تعذّر الحذف");
}

/**
 * Tokenless read for visitors (works only while the repo is public).
 * Returns null on any failure — the live overlay treats that as
 * "nothing newer than the baked site".
 */
export async function fetchRawFile(path: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/${GITHUB.owner}/${GITHUB.repo}/${GITHUB.branch}/${path}`,
      { cache: "no-store" }
    );
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

/** Verify a token can reach the repo; returns the login it belongs to. */
export async function verifyToken(token: string): Promise<string> {
  const response = await fetch(`${API}/repos/${GITHUB.owner}/${GITHUB.repo}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token.trim()}`,
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });
  if (!response.ok) throw await apiError(response, "تعذّر التحقق من الرمز");
  const user = await fetch(`${API}/user`, {
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token.trim()}` }
  });
  if (!user.ok) return "";
  const body = (await user.json()) as { login?: string };
  return body.login ?? "";
}
