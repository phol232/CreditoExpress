import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, User } from 'lucide-react';
import LoginModal from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';
import ApplicationModal from '@/components/ApplicationModal';
import ThemeToggle from '@/components/ThemeToggle';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary">MicroCredit</h1>
            </div>
          </div>
          
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#inicio" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium">
                {t('header.inicio')}
              </a>
              <a href="#servicios" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium">
                {t('header.servicios')}
              </a>
              <a href="#proceso" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium">
                {t('header.proceso')}
              </a>
              <a href="#contacto" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium">
                {t('header.contacto')}
              </a>
            </div>
          </nav>
          
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <LanguageSelector />
            <div className="h-6 w-px bg-border mx-2" />
            <Button 
              variant="ghost"
              onClick={() => setIsLoginOpen(true)}
              data-testid="button-login"
            >
              <User className="h-4 w-4 mr-2" />
              {t('header.login')}
            </Button>
            <Button 
              data-testid="button-iniciar-solicitud" 
              className="bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900"
              onClick={() => setIsApplicationOpen(true)}
            >
              {t('header.apply')}
            </Button>
          </div>
          
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="button-menu-toggle"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t">
              <a href="#inicio" className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium">
                {t('header.inicio')}
              </a>
              <a href="#servicios" className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium">
                {t('header.servicios')}
              </a>
              <a href="#proceso" className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium">
                {t('header.proceso')}
              </a>
              <a href="#contacto" className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium">
                {t('header.contacto')}
              </a>
              <div className="px-3 py-2 space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <ThemeToggle />
                  <LanguageSelector />
                </div>
                <Button 
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setIsLoginOpen(true)}
                  data-testid="button-login-mobile"
                >
                  <User className="h-4 w-4 mr-2" />
                  {t('header.login')}
                </Button>
                <Button 
                  data-testid="button-iniciar-solicitud-mobile" 
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900"
                  onClick={() => setIsApplicationOpen(true)}
                >
                  {t('header.apply')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <LoginModal 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
      />
      
      <RegisterModal 
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />
      
      <ApplicationModal 
        isOpen={isApplicationOpen}
        onClose={() => setIsApplicationOpen(false)}
      />
    </header>
  );
}