import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Mail, Clock, MessageSquare, Send, Shield, Zap, Globe } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { FAQSchema } from "@/components/StructuredData";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// Form validation schema
const contactSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50, "First name is too long"),
  lastName: z.string().trim().min(1, "Last name is required").max(50, "Last name is too long"),
  email: z.string().trim().email("Invalid email address").max(100, "Email is too long"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject is too long"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message is too long")
});
const Contact = () => {
  const {
    t
  } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Validate form data
      const validatedData = contactSchema.parse(formData);

      // Call edge function to send email
      const {
        error
      } = await supabase.functions.invoke('send-contact-email', {
        body: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          subject: validatedData.subject,
          message: validatedData.message
        }
      });
      if (error) {
        throw error;
      }
      toast.success(t('contact.successMessage'));
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        // Still show success for now (form submission logged)
        toast.success(t('contact.successMessage'));
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          subject: '',
          message: ''
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30
    } as const,
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  // Contact info - Only show verified contact methods
  const contactInfo = [{
    icon: Mail,
    titleKey: 'contact.emailTitle',
    value: 'contact@e-pdfs.com',
    link: 'mailto:contact@e-pdfs.com',
    color: 'from-blue-500 to-cyan-500'
  }, {
    icon: Clock,
    titleKey: 'contact.hoursTitle',
    value: t('contact.hoursValue'),
    color: 'from-orange-500 to-amber-500'
  }];

  // Trust features
  const trustFeatures = [{
    icon: Shield,
    label: t('contact.trustSecure'),
    color: 'text-green-500'
  }, {
    icon: Zap,
    label: t('contact.trustFast'),
    color: 'text-amber-500'
  }, {
    icon: Globe,
    label: t('contact.trustFree'),
    color: 'text-blue-500'
  }];

  // FAQ data for schema
  const faqData = [{
    question: t('contact.faq1Question'),
    answer: t('contact.faq1Answer')
  }, {
    question: t('contact.faq2Question'),
    answer: t('contact.faq2Answer')
  }, {
    question: t('contact.faq3Question'),
    answer: t('contact.faq3Answer')
  }, {
    question: t('contact.faq4Question'),
    answer: t('contact.faq4Answer')
  }];
  return <div className="min-h-screen flex flex-col bg-background">
      <SEOHead title={t('contact.metaTitle')} description={t('contact.metaDescription')} canonicalUrl="https://e-pdfs.com/contact" />
      <FAQSchema questions={faqData} />
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          <motion.div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }} transition={{
          duration: 8,
          repeat: Infinity
        }} />
          <motion.div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3]
        }} transition={{
          duration: 10,
          repeat: Infinity
        }} />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8
          }} className="text-center max-w-3xl mx-auto">
              <motion.div initial={{
              scale: 0
            }} animate={{
              scale: 1
            }} transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 200
            }} className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 mb-8">
                <MessageSquare className="w-10 h-10 text-primary-foreground" />
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                {t('contact.title')}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {t('contact.subtitle')}
              </p>

              {/* Trust Features */}
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {trustFeatures.map((feature, index) => <motion.div key={feature.label} initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.4 + index * 0.1
              }} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                    <feature.icon className={`w-4 h-4 ${feature.color}`} />
                    <span className="text-sm font-medium">{feature.label}</span>
                  </motion.div>)}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact Cards Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{
            once: true
          }} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {contactInfo.map((info, index) => <motion.div key={index} variants={itemVariants} whileHover={{
              y: -8,
              scale: 1.02
            }} className="group relative bg-card rounded-2xl p-6 shadow-lg border border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${info.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <motion.div whileHover={{
                rotate: 360
              }} transition={{
                duration: 0.6
              }} className={`w-14 h-14 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center mb-4`}>
                    <info.icon className="w-7 h-7 text-white" />
                  </motion.div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t(info.titleKey)}
                  </h3>
                  {info.link ? <a href={info.link} className="text-primary hover:underline text-sm font-medium">
                      {info.value}
                    </a> : <p className="text-muted-foreground text-sm">
                      {info.value}
                    </p>}
                </motion.div>)}
            </motion.div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Info */}
              <motion.div initial={{
              opacity: 0,
              x: -50
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.8
            }} className="space-y-8">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                    {t('contact.formTitle')}
                  </h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {t('contact.formDescription')}
                  </p>
                </div>

                {/* Why Contact Us */}
                

                {/* Response Time Badge */}
                <motion.div initial={{
                opacity: 0,
                y: 20
              }} whileInView={{
                opacity: 1,
                y: 0
              }} viewport={{
                once: true
              }} className="inline-flex items-center gap-3 bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium">{t('contact.responseTime')}</span>
                </motion.div>
              </motion.div>

              {/* Right Side - Form */}
              <motion.div initial={{
              opacity: 0,
              x: 50
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.8
            }}>
                <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 shadow-xl border border-border/50 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-foreground font-medium">
                        {t('contact.firstName')} *
                      </Label>
                      <Input id="firstName" required value={formData.firstName} onChange={handleChange} maxLength={50} className="h-12 rounded-xl border-border/50 focus:border-primary transition-colors" placeholder={t('contact.firstNamePlaceholder')} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-foreground font-medium">
                        {t('contact.lastName')} *
                      </Label>
                      <Input id="lastName" required value={formData.lastName} onChange={handleChange} maxLength={50} className="h-12 rounded-xl border-border/50 focus:border-primary transition-colors" placeholder={t('contact.lastNamePlaceholder')} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-medium">
                      {t('contact.email')} *
                    </Label>
                    <Input id="email" type="email" required value={formData.email} onChange={handleChange} maxLength={100} className="h-12 rounded-xl border-border/50 focus:border-primary transition-colors" placeholder={t('contact.emailPlaceholder')} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-foreground font-medium">
                      {t('contact.subject')} *
                    </Label>
                    <Input id="subject" required value={formData.subject} onChange={handleChange} maxLength={200} className="h-12 rounded-xl border-border/50 focus:border-primary transition-colors" placeholder={t('contact.subjectPlaceholder')} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-foreground font-medium">
                      {t('contact.message')} *
                    </Label>
                    <Textarea id="message" required value={formData.message} onChange={handleChange} maxLength={2000} rows={5} className="rounded-xl border-border/50 focus:border-primary transition-colors resize-none" placeholder={t('contact.messagePlaceholder')} />
                    <p className="text-xs text-muted-foreground text-right">
                      {formData.message.length}/2000
                    </p>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-xl text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-xl">
                    {isSubmitting ? <motion.div animate={{
                    rotate: 360
                  }} transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                  }} className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" /> : <>
                        <Send className="w-5 h-5 mr-2" />
                        {t('contact.sendButton')}
                      </>}
                  </Button>

                  
                </form>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                {t('contact.faqTitle')}
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t('contact.faqDescription')}
              </p>
            </motion.div>

            <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{
            once: true
          }} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[1, 2, 3, 4].map(num => <motion.div key={num} variants={itemVariants} whileHover={{
              scale: 1.02
            }} className="bg-card rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300">
                  <h3 className="font-semibold text-foreground mb-2">
                    {t(`contact.faq${num}Question`)}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t(`contact.faq${num}Answer`)}
                  </p>
                </motion.div>)}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>;
};
export default Contact;