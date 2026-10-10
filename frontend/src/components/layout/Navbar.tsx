'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/bits';
import { Button } from '@/components/ui/Button';

const NAV_LINKS = [
  { name: 'Services', href: '/#services' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

/** Elements that can hold focus, in document order. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const menuRef = useRef<HTMLDivElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  /** True only after the menu has been opened, so we never steal focus on first mount. */
  const wasOpen = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  /**
   * Move focus into the menu when it opens, keep it there while it is open, and hand it back
   * to the button that opened it when it closes.
   *
   * Without this the menu is a visual overlay only: a keyboard or screen reader user who
   * opens it is left focused on a button that is now behind the overlay, and pressing Tab
   * walks them through the page underneath that they cannot see. Focus returning to the
   * trigger on close is what makes the menu feel like a single dismissible step rather than
   * a navigation dead end.
   */
  useEffect(() => {
    if (mobileMenuOpen) {
      wasOpen.current = true;
      closeButtonRef.current?.focus();

      const node = menuRef.current;
      if (!node) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        const focusables = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (el) => el.offsetParent !== null,
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };

      node.addEventListener('keydown', handleKeyDown);
      return () => node.removeEventListener('keydown', handleKeyDown);
    }

    if (wasOpen.current) {
      wasOpen.current = false;
      openButtonRef.current?.focus();
    }
  }, [mobileMenuOpen]);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-ink/85 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-10">
            <Logo />

            <nav aria-label="Main" className="hidden md:flex items-center space-x-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  aria-current={pathname === link.href ? 'page' : undefined}
                  className={`text-sm font-medium transition-colors ${
                    pathname === link.href || (pathname === '/' && link.href === '/#services')
                      ? 'text-white'
                      : 'text-fog hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden md:flex items-center">
            <Link href="/contact" tabIndex={-1}>
              <Button variant="primary" size="sm">
                Start a Project
              </Button>
            </Link>
          </div>

          <div className="flex items-center md:hidden">
            <button
              ref={openButtonRef}
              onClick={() => setMobileMenuOpen(true)}
              className="text-fog hover:text-white p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="absolute inset-0 bg-ink/95 backdrop-blur-xl"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex flex-col h-full bg-ink/95 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-8 h-16">
              <Logo />
              <button
                ref={closeButtonRef}
                onClick={() => setMobileMenuOpen(false)}
                className="text-fog hover:text-white p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav aria-label="Main" className="flex flex-col space-y-6 text-center mt-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={pathname === link.href ? 'page' : undefined}
                  className={`text-2xl font-medium transition-colors ${
                    pathname === link.href || (pathname === '/' && link.href === '/#services')
                      ? 'text-white'
                      : 'text-fog hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="mt-auto mb-12 flex justify-center">
              <Link
                href="/contact"
                tabIndex={-1}
                className="w-full max-w-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button variant="primary" className="w-full justify-center">
                  Start a Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
