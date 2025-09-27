import { createContext, useContext, useState } from 'react';

type Language = 'es' | 'en';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

// Definición de todas las traducciones de la aplicación
const translations: Translations = {
  // Header
  'header.inicio': { es: 'Inicio', en: 'Home' },
  'header.servicios': { es: 'Servicios', en: 'Services' },
  'header.proceso': { es: 'Proceso', en: 'Process' },
  'header.contacto': { es: 'Contacto', en: 'Contact' },
  'header.login': { es: 'Iniciar Sesión', en: 'Login' },
  'header.apply': { es: 'Iniciar Solicitud', en: 'Apply Now' },
  
  // Hero Section
  'hero.title1': { es: 'Potenciando Tus Finanzas,', en: 'Empowering Your Finances,' },
  'hero.title2': { es: 'Un Clic a la Vez', en: 'One Click at a Time' },
  'hero.subtitle': { es: 'Ofrecemos los mejores servicios financieros para ti con términos seguros. Préstamos rápidos, créditos flexibles y soluciones financieras personalizadas.', en: 'We offer the best financial services for you with secure terms. Fast loans, flexible credit, and personalized financial solutions.' },
  'hero.apply_now': { es: 'Solicitar Ahora', en: 'Apply Now' },
  'hero.learn_more': { es: 'Conocer Más', en: 'Learn More' },
  'hero.feature1': { es: 'Sin Papeleos', en: 'No Paperwork' },
  'hero.feature2': { es: 'Aprobación en 24h', en: '24h Approval' },
  'hero.feature3': { es: 'Sin Comisiones Ocultas', en: 'No Hidden Fees' },
  
  // Login Modal
  'login.title': { es: 'Iniciar Sesión', en: 'Sign In' },
  'login.subtitle': { es: 'Ingresa a tu cuenta para continuar', en: 'Enter your account to continue' },
  'login.email': { es: 'Correo Electrónico', en: 'Email' },
  'login.password': { es: 'Contraseña', en: 'Password' },
  'login.forgot_password': { es: '¿Olvidaste tu contraseña?', en: 'Forgot your password?' },
  'login.sign_in': { es: 'Iniciar Sesión', en: 'Sign In' },
  'login.no_account': { es: '¿No tienes una cuenta?', en: "Don't have an account?" },
  'login.register_here': { es: 'Regístrate aquí', en: 'Register here' },
  'login.or': { es: 'O continúa con', en: 'Or continue with' },
  'login.google': { es: 'Continuar con Google', en: 'Continue with Google' },
  'login.github': { es: 'Continuar con GitHub', en: 'Continue with GitHub' },
  
  // Register Modal
  'register.title': { es: 'Crear Cuenta', en: 'Create Account' },
  'register.subtitle': { es: 'Únete a nosotros y accede a servicios financieros personalizados', en: 'Join us and access personalized financial services' },
  'register.name': { es: 'Nombre Completo', en: 'Full Name' },
  'register.phone': { es: 'Teléfono', en: 'Phone' },
  'register.create_account': { es: 'Crear Cuenta', en: 'Create Account' },
  'register.have_account': { es: '¿Ya tienes una cuenta?', en: 'Already have an account?' },
  'register.login_here': { es: 'Inicia sesión aquí', en: 'Sign in here' },
  
  // Common
  'common.loading': { es: 'Cargando...', en: 'Loading...' },
  'common.close': { es: 'Cerrar', en: 'Close' },
  'common.cancel': { es: 'Cancelar', en: 'Cancel' },
  'common.continue': { es: 'Continuar', en: 'Continue' },
  'common.back': { es: 'Volver', en: 'Back' },
  'common.next': { es: 'Siguiente', en: 'Next' },
  'common.submit': { es: 'Enviar', en: 'Submit' },
  'common.save': { es: 'Guardar', en: 'Save' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
}

export function LanguageProvider({ children, defaultLanguage = 'es' }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    // Check localStorage first, then use default
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('language') as Language;
      if (stored === 'es' || stored === 'en') {
        return stored;
      }
    }
    return defaultLanguage;
  });

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key; // Return the key as fallback
    }
    return translation[language] || translation['es'] || key;
  };

  const value = {
    language,
    setLanguage: changeLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}