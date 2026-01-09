import { FileText, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const toolCategories = [
    {
      title: 'Organiser',
      links: [
        { name: 'Fusionner PDF', href: '/merge' },
        { name: 'Diviser PDF', href: '/split' },
        { name: 'Supprimer des pages', href: '/delete-pages' },
        { name: 'Extraire des pages', href: '/extract-pages' },
      ],
    },
    {
      title: 'Convertir',
      links: [
        { name: 'JPG en PDF', href: '/jpg-to-pdf' },
        { name: 'PDF en JPG', href: '/pdf-to-jpg' },
        { name: 'Word en PDF', href: '/word-to-pdf' },
        { name: 'PDF en Word', href: '/pdf-to-word' },
      ],
    },
    {
      title: 'Ressources',
      links: [
        { name: 'Blog', href: '/blog' },
        { name: 'Tous les outils', href: '/tools' },
        { name: 'Compresser PDF', href: '/compress' },
        { name: 'Faire pivoter PDF', href: '/rotate' },
      ],
    },
  ];

  return (
    <footer className="border-t border-border mt-24">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">E-Pdf's</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tous les outils PDF dont vous avez besoin. Gratuit, simple et sécurisé. 
              Traitez vos fichiers directement dans votre navigateur.
            </p>
          </div>

          {/* Tool Categories */}
          {toolCategories.map((category) => (
            <div key={category.title}>
              <h3 className="font-semibold mb-4">{category.title}</h3>
              <ul className="space-y-3">
                {category.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 E-Pdf's. Tous droits réservés.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Fait avec <Heart className="w-4 h-4 text-rose" /> pour simplifier votre travail
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
