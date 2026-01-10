import { motion } from 'framer-motion';
import { FileText, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = [{
    name: 'Fusionner',
    href: '/merge'
  }, {
    name: 'Diviser',
    href: '/split'
  }, {
    name: 'Compresser',
    href: '/compress'
  }, {
    name: 'Tous les outils',
    href: '/tools'
  }, {
    name: 'Blog',
    href: '/blog'
  }];
  return <header className="fixed top-0 left-0 right-0 z-50 glass-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between bg-black">
          <Link to="/" className="flex items-center gap-3">
            <motion.div whileHover={{
            rotate: 10,
            scale: 1.1
          }} className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold gradient-text">E-Pdf's</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map(item => <Link key={item.name} to={item.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {item.name}
              </Link>)}
          </nav>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && <motion.nav initial={{
        opacity: 0,
        height: 0
      }} animate={{
        opacity: 1,
        height: 'auto'
      }} exit={{
        opacity: 0,
        height: 0
      }} className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col gap-4">
              {navItems.map(item => <Link key={item.name} to={item.href} onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  {item.name}
                </Link>)}
            </div>
          </motion.nav>}
      </div>
    </header>;
};
export default Header;