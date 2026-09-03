import Link from 'next/link';
import { Logo } from '@/components/ui/bits';

export function Footer() {
  return (
    <footer className="bg-ink-2 border-t border-line py-16 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between gap-12 mb-16">
          <div className="max-w-xs">
            <div className="mb-6">
              <Logo />
            </div>
            <p className="text-sm text-fog leading-relaxed">
              One AI partner across marketing, sales, agents, security, commerce and trading.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-16">
            <div>
              <h3 className="text-sm font-medium text-snow mb-4">Services</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/services#marketing-ai" className="text-sm text-fog hover:text-snow transition-colors">
                    Marketing AI
                  </Link>
                </li>
                <li>
                  <Link href="/services#sales-ai" className="text-sm text-fog hover:text-snow transition-colors">
                    Sales AI
                  </Link>
                </li>
                <li>
                  <Link href="/services#ai-agents" className="text-sm text-fog hover:text-snow transition-colors">
                    AI Agents
                  </Link>
                </li>
                <li>
                  <Link href="/services#security-mssp" className="text-sm text-fog hover:text-snow transition-colors">
                    Security MSSP
                  </Link>
                </li>
                <li>
                  <Link href="/services#ecommerce-ai" className="text-sm text-fog hover:text-snow transition-colors">
                    E-commerce AI
                  </Link>
                </li>
                <li>
                  <Link href="/services#trading-ai" className="text-sm text-fog hover:text-snow transition-colors">
                    Trading AI
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-snow mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-sm text-fog hover:text-snow transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-fog hover:text-snow transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-snow mb-4">Connect</h3>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:team@larptech.io" className="text-sm text-fog hover:text-snow transition-colors">
                    team@larptech.io
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-line flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-fog">
            &copy; {new Date().getFullYear()} Larptech. All rights reserved.
          </p>
          <span className="text-xs font-mono text-fog">
            build things that matter
          </span>
        </div>
      </div>
    </footer>
  );
}
