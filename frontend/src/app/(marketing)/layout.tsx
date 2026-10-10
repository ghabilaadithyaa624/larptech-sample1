import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* First focusable element on the page, so a keyboard or screen reader user can jump
          straight past the navigation. See `.skip-link` in globals.css — it stays in the tab
          order and is only revealed when focused. */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      {/* `tabIndex={-1}` so the skip link moves focus here, not just the scroll position;
          without it the next Tab continues from the top of the document. */}
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <Footer />
    </div>
  );
}
