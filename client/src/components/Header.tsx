import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, User } from 'lucide-react';
import LoginModal from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';
import ApplicationModal from '@/components/ApplicationModal';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);

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
                Inicio
              </a>
              <a href="#servicios" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium">
                Servicios
              </a>
              <a href="#proceso" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium">
                Proceso
              </a>
              <a href="#contacto" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium">
                Contacto
              </a>
            </div>
          </nav>
          
          <div className="hidden md:flex items-center gap-3">
            <Button 
              variant="ghost"
              onClick={() => setIsLoginOpen(true)}
              data-testid="button-login"
            >
              <User className="h-4 w-4 mr-2" />
              Iniciar Sesión
            </Button>
            <Button 
              data-testid="button-iniciar-solicitud" 
              className="bg-gradient-to-r from-purple-deep to-purple-medium"
              onClick={() => setIsApplicationOpen(true)}
            >
              Iniciar Solicitud
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
                Inicio
              </a>
              <a href="#servicios" className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium">
                Servicios
              </a>
              <a href="#proceso" className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium">
                Proceso
              </a>
              <a href="#contacto" className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium">
                Contacto
              </a>
              <div className="px-3 py-2 space-y-2">
                <Button 
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setIsLoginOpen(true)}
                  data-testid="button-login-mobile"
                >
                  <User className="h-4 w-4 mr-2" />
                  Iniciar Sesión
                </Button>
                <Button 
                  data-testid="button-iniciar-solicitud-mobile" 
                  className="w-full bg-gradient-to-r from-purple-deep to-purple-medium"
                  onClick={() => setIsApplicationOpen(true)}
                >
                  Iniciar Solicitud
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