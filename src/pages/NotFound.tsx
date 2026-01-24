import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import SEOHead from "@/components/SEOHead";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <SEOHead
        title="Page Not Found - E-PDF's"
        description="The page you're looking for doesn't exist. Return to E-PDF's homepage for free online PDF tools."
        noIndex={true}
      />
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">{t('notFound.title')}</h1>
          <p className="mb-4 text-xl text-muted-foreground">{t('notFound.message')}</p>
          <a href="/" className="text-primary underline hover:text-primary/90">
            {t('notFound.backHome')}
          </a>
        </div>
      </div>
    </>
  );
};

export default NotFound;
