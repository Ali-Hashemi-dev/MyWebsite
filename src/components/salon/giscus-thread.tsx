"use client";

import { useEffect, useRef } from "react";
import { GISCUS } from "@/data/site-config";

/**
 * A giscus (GitHub Discussions) thread. Mapping is always "specific" with an
 * explicit term — never pathname, since the basePath would split threads
 * across deployments. Renders nothing while giscus is unconfigured; parents
 * provide their own fallback.
 */
export function GiscusThread({ term }: { term: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", GISCUS.repo);
    script.setAttribute("data-repo-id", GISCUS.repoId);
    script.setAttribute("data-category", GISCUS.category);
    script.setAttribute("data-category-id", GISCUS.categoryId);
    script.setAttribute("data-mapping", "specific");
    script.setAttribute("data-term", term);
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", "transparent_dark");
    script.setAttribute("data-lang", "ar");
    script.setAttribute("data-loading", "lazy");
    container.appendChild(script);

    return () => {
      container.replaceChildren();
    };
  }, [term]);

  if (!GISCUS.repoId || !GISCUS.categoryId) return null;

  return <div ref={containerRef} />;
}
