import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Fusionner', href: '/merge' },
    { name: 'Diviser', href: '/split' },
    { name: 'Compresser', href: '/compress' },
    { name: 'Tous les outils', href: '/tools' },
    { name: 'Blog', href: '/blog' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-primary/20 shadow-[0_4px_30px_rgba(236,72,153,0.15)]">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="relative"
            >
              <img 
                src={logo} 
                alt="E-Pdfs - Outils PDF en ligne gratuits" 
                className="h-16 md:h-20 lg:h-24 w-auto object-contain drop-shadow-[0_0_25px_rgba(236,72,153,0.6)] transition-all duration-300 hover:drop-shadow-[0_0_35px_rgba(236,72,153,0.8)]" 
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-base font-bold text-white/80 hover:text-primary transition-all duration-300 relative group tracking-wide"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary via-rose to-primary group-hover:w-full transition-all duration-300 shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-3 text-white/80 hover:text-primary transition-all duration-300 rounded-lg hover:bg-primary/10"
          >
            {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pb-6 border-t border-primary/20 pt-4"
          >
            <div className="flex flex-col gap-5">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-lg font-bold text-white/80 hover:text-primary transition-all duration-300 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-primary/10"
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.nav>
        )}
      </div>
    </header>
  );
};

export default Header;
