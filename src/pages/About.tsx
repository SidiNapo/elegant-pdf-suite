import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Users, Target, Award, Globe, Zap, Shield, Heart, 
  CheckCircle, ArrowRight, Sparkles, TrendingUp, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import heroPdf from '@/assets/hero-pdf.jpg';
import globalIllustration from '@/assets/global-illustration.jpg';
import securityIllustration from '@/assets/security-illustration.jpg';
import speedIllustration from '@/assets/speed-illustration.jpg';

const About = () => {
  const { t } = useTranslation();

  const stats = [
    { number: '10M+', label: t('about.stats.filesProcessed'), icon: TrendingUp },
    { number: '500K+', label: t('about.stats.happyUsers'), icon: Users },
    { number: '20+', label: t('about.stats.pdfTools'), icon: Sparkles },
    { number: '24/7', label: t('about.stats.availability'), icon: Clock },
  ];

  const values = [
    {
      icon: Shield,
      title: t('about.values.security.title'),
      description: t('about.values.security.description'),
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Zap,
      title: t('about.values.speed.title'),
      description: t('about.values.speed.description'),
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: Heart,
      title: t('about.values.simplicity.title'),
      description: t('about.values.simplicity.description'),
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: Globe,
      title: t('about.values.accessibility.title'),
      description: t('about.values.accessibility.description'),
      gradient: 'from-blue-500 to-cyan-500',
    },
  ];

  const team = [
    { role: t('about.team.developer'), count: '5+' },
    { role: t('about.team.designer'), count: '3+' },
    { role: t('about.team.support'), count: '10+' },
  ];

  const features = [
    t('about.features.noInstallation'),
    t('about.features.noRegistration'),
    t('about.features.noLimits'),
    t('about.features.allDevices'),
    t('about.features.instantProcessing'),
    t('about.features.secureEncryption'),
  ];

  return (
    <>
      <SEOHead
        title={t('about.seo.title')}
        description={t('about.seo.description')}
        keywords={t('about.seo.keywords')}
        canonicalUrl="https://e-pdfs.com/about"
      />

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20">
          {/* Hero Section */}
          <section className="relative min-h-[80vh] flex items-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
              <img
                src={heroPdf}
                alt="About E-PDF's"
                className="w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/10" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
            </div>

            {/* Animated Shapes */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [360, 180, 0],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-accent/20 to-violet-500/20 rounded-full blur-3xl"
            />

            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
                  >
                    <Sparkles className="w-4 h-4" />
                    {t('about.hero.badge')}
                  </motion.span>

                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                    {t('about.hero.title')}{' '}
                    <span className="gradient-text">{t('about.hero.titleHighlight')}</span>
                  </h1>

                  <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-10">
                    {t('about.hero.description')}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/tools" className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg">
                      {t('about.hero.cta')}
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link to="/blog" className="btn-secondary inline-flex items-center gap-2 px-8 py-4 text-lg">
                      {t('about.hero.ctaSecondary')}
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
            <div className="container mx-auto px-4 relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center group"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                      <stat.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-4xl md:text-5xl font-black gradient-text mb-2">{stat.number}</div>
                    <div className="text-muted-foreground font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="py-24 relative">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="space-y-8"
                >
                  <div>
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                      <Target className="w-4 h-4" />
                      {t('about.mission.badge')}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                      {t('about.mission.title')}
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {t('about.mission.description')}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                      >
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
                  <div className="relative rounded-3xl overflow-hidden border border-border">
                    <img
                      src={globalIllustration}
                      alt={t('about.mission.imageAlt')}
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                          <Globe className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">150+</div>
                          <div className="text-sm text-muted-foreground">{t('about.mission.countries')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="py-24 bg-gradient-to-b from-background to-card/50 relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl" />
            </div>
            <div className="container mx-auto px-4 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <Heart className="w-4 h-4" />
                  {t('about.values.badge')}
                </span>
                <h2 className="text-3xl md:text-5xl font-bold mb-4">
                  {t('about.values.title')}
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  {t('about.values.subtitle')}
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {values.map((value, index) => (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="h-full glass-card rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 hover-glow">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <value.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Why Choose Us Section */}
          <section className="py-24">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="order-2 lg:order-1"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="rounded-2xl overflow-hidden"
                    >
                      <img
                        src={securityIllustration}
                        alt={t('about.whyUs.securityAlt')}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 }}
                      className="rounded-2xl overflow-hidden mt-8"
                    >
                      <img
                        src={speedIllustration}
                        alt={t('about.whyUs.speedAlt')}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="order-1 lg:order-2"
                >
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                    <Award className="w-4 h-4" />
                    {t('about.whyUs.badge')}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-bold mb-6">
                    {t('about.whyUs.title')}
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                    {t('about.whyUs.description')}
                  </p>

                  <div className="space-y-4">
                    {team.map((member, index) => (
                      <motion.div
                        key={member.role}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                      >
                        <span className="font-medium">{member.role}</span>
                        <span className="text-2xl font-bold gradient-text">{member.count}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-violet-500/10" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-conic from-primary/20 via-transparent to-transparent rounded-full"
            />
            <div className="container mx-auto px-4 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto text-center"
              >
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  {t('about.cta.title')}{' '}
                  <span className="gradient-text">{t('about.cta.titleHighlight')}</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                  {t('about.cta.description')}
                </p>
                <Link to="/tools" className="btn-primary inline-flex items-center gap-2 px-10 py-4 text-lg">
                  {t('about.cta.button')}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default About;
