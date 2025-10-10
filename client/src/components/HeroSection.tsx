import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Clock, CheckCircle } from 'lucide-react';
import ApplicationModal from '@/components/ApplicationModal';
import { useLanguage } from '@/contexts/LanguageContext';
// import heroImage from '@assets/generated_images/Hero_background_gradient_cc8df848.png';
// import mobileImage from '@assets/generated_images/Mobile_app_interface_mockup_12e7b423.png';

export default function HeroSection() {
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const { t } = useLanguage();
  
  const handleGetStarted = () => {
    console.log('Iniciar solicitud clicked');
    setIsApplicationOpen(true);
    // Todo: remove mock functionality - implement actual form navigation
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left content */}
        <div className="text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            {t('hero.title1')}{' '}
            <span className="text-purple-300">{t('hero.title2')}</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-purple-100/90">
            {t('hero.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              data-testid="button-get-started"
              className="bg-white text-purple-900 hover:bg-purple-50 hover:text-purple-900 font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all"
            >
              {t('hero.apply_now')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              data-testid="button-learn-more"
              className="border-white text-white hover:bg-white hover:text-purple-900 backdrop-blur-sm bg-white/10 font-semibold px-8 py-4 transition-all"
            >
              {t('hero.learn_more')}
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap gap-6 text-sm text-purple-200/90">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span>{t('hero.feature1')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>{t('hero.feature2')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>{t('hero.feature3')}</span>
            </div>
          </div>
        </div>
        
        {/* Right content - Placeholder for mobile mockup */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative w-80 md:w-96 h-[600px] bg-white/10 backdrop-blur-sm rounded-3xl border-4 border-white/20 shadow-2xl flex items-center justify-center">
            <div className="text-center text-white/60">
              <Shield className="h-24 w-24 mx-auto mb-4" />
              <p className="text-lg">App Móvil</p>
            </div>
            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span>Crédito Aprobado</span>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
              <div className="flex items-center gap-2">
                <span>Tasa desde 12%</span>
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ApplicationModal 
        isOpen={isApplicationOpen}
        onClose={() => setIsApplicationOpen(false)}
      />
    </section>
  );
}