"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "الصفحة الرئيسية" },
  { href: "/reading", label: "قراءة" },
  { href: "/about", label: "عن الكاتب" }
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/78 px-4 py-4 backdrop-blur-2xl">
      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-center">
        <div
          aria-label="موضع الشعار"
          className="absolute left-0 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full border border-white/20 bg-white/8 shadow-[0_0_40px_rgba(255,77,0,.18)]"
        />
        <nav aria-label="التنقل الرئيسي" className="flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] p-1">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 sm:px-6 ${
                  active ? "bg-orange-500 text-white shadow-[0_0_28px_rgba(255,77,0,.32)]" : "text-white/68 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
