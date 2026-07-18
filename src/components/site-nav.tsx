"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AinMark } from "./ain-mark";
import { useAinVariant } from "./identity-provider";

const links = [
  { href: "/", label: "المكتبة" },
  { href: "/about/", label: "عن الكاتب" },
  { href: "/lab/", label: "المِرسم" }
];

/**
 * Navigation that almost disappears: a small ع seal and three whispered
 * links. The content is meant to dominate.
 */
export function SiteNav() {
  const pathname = usePathname();
  const { variant } = useAinVariant();

  return (
    <header className="fixed top-0 right-0 left-0 z-[90]">
      <nav
        aria-label="التنقل الرئيسي"
        className="flex items-center justify-between px-5 py-4 sm:px-8"
        style={{
          background: "linear-gradient(to bottom, rgba(12,10,8,0.72), transparent)"
        }}
      >
        <Link
          href="/"
          aria-label="مكتبة علي هاشمي — الصفحة الرئيسية"
          className="text-parchment transition-colors duration-300 hover:text-accent"
        >
          <AinMark variant={variant} size={34} eye />
        </Link>
        <ul className="m-0 flex list-none items-center gap-6 p-0 text-sm sm:gap-8">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="relative pb-1 tracking-wide no-underline transition-colors duration-300"
                  style={{ color: active ? "var(--accent)" : "var(--warm-gray)" }}
                >
                  {link.label}
                  <span
                    aria-hidden
                    className="absolute right-0 -bottom-0.5 h-px bg-accent transition-all duration-500"
                    style={{ width: active ? "100%" : 0 }}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
