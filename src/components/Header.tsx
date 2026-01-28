import { motion } from 'framer-motion';
import { Menu, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '@/assets/logo.png';
import LanguageSwitcher from './LanguageSwitcher';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: t('nav.merge'), href: '/merge' },
    { name: t('nav.split'), href: '/split' },
    { name: t('nav.compress'), href: '/compress' },
    { name: t('nav.allTools'), href: '/tools' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.blog'), href: '/blog' },
    { name: t('nav.contact'), href: '/contact' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-black/95 backdrop-blur-xl shadow-[0_4px_30px_rgba(236,72,153,0.2)] border-b border-primary/20' 
          : 'bg-black'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="relative"
            >
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 to-rose/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img 
                src={logo} 
                alt="E-Pdfs - Outils PDF en ligne gratuits" 
                width={56}
                height={34}
                fetchPriority="high"
                style={{ aspectRatio: '138/84' }}
                className="h-10 md:h-14 w-auto object-contain drop-shadow-[0_0_15px_rgba(236,72,153,0.5)] transition-all duration-300 group-hover:drop-shadow-[0_0_25px_rgba(236,72,153,0.7)]" 
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1 p-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                      isActive 
                        ? 'text-white' 
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-primary to-rose rounded-full"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                );
              })}
            </div>
            <LanguageSwitcher />
          </nav>

          {/* Mobile Menu */}
          <div className="lg:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button
                  aria-label={t('nav.openMenu')}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-all duration-300"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-black/95 backdrop-blur-xl border-l border-white/10 p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Nav Header */}
                  <div className="p-4 border-b border-white/10">
                    <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3">
                      <img 
                        src={logo} 
                        alt="E-Pdfs" 
                        className="h-10 w-auto object-contain" 
                      />
                    </Link>
                  </div>

                  {/* Mobile Nav Links */}
                  <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                            isActive
                              ? 'bg-gradient-to-r from-primary/20 to-rose/20 text-primary border border-primary/30'
                              : 'text-white/80 hover:text-white hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <span className="font-medium">{item.name}</span>
                          <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'text-primary' : 'text-white/40'}`} />
                        </Link>
                      );
                    })}
                  </nav>

                  {/* Mobile Language Switcher */}
                  <div className="p-4 border-t border-white/10">
                    <LanguageSwitcher variant="mobile" />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
