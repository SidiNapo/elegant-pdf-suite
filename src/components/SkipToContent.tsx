import { useTranslation } from 'react-i18next';

/**
 * Accessible skip link — first focusable element on every page.
 * Lets keyboard/AT users jump past nav straight into <main id="main-content">.
 */
const SkipToContent = () => {
  const { t } = useTranslation();
  return (
    <a href="#main-content" className="skip-link">
      {t('a11y.skipToContent', { defaultValue: 'Skip to content' })}
    </a>
  );
};

export default SkipToContent;
