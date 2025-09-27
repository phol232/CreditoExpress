import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Shield, Award, Users } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-purple-900 to-purple-800 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">MicroCredit</h3>
            <p className="text-purple-200">
              Tu aliado financiero de confianza. Ofrecemos soluciones de crédito rápidas, 
              seguras y adaptadas a tus necesidades.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-purple-200 hover:text-white hover:bg-purple-700">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-purple-200 hover:text-white hover:bg-purple-700">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-purple-200 hover:text-white hover:bg-purple-700">
                <Instagram className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Servicios</h4>
            <ul className="space-y-2 text-purple-200">
              <li><a href="#" className="hover:text-white transition-colors">Préstamos Personales</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Créditos Empresariales</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Microcréditos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Planificación Financiera</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Seguros y Protección</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Soporte</h4>
            <ul className="space-y-2 text-purple-200">
              <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Preguntas Frecuentes</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de Privacidad</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contacto</h4>
            <div className="space-y-3 text-purple-200">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4" />
                <span>+52 55 1234 5678</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4" />
                <span>contacto@microcredit.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4" />
                <span>Ciudad de México, México</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="border-t border-purple-700 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center gap-3 text-purple-200">
              <Shield className="h-6 w-6" />
              <div>
                <p className="font-semibold">Regulado por CNBV</p>
                <p className="text-sm">Institución Financiera Autorizada</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 text-purple-200">
              <Award className="h-6 w-6" />
              <div>
                <p className="font-semibold">Certificación ISO 27001</p>
                <p className="text-sm">Seguridad de la Información</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 text-purple-200">
              <Users className="h-6 w-6" />
              <div>
                <p className="font-semibold">+50,000 Clientes</p>
                <p className="text-sm">Satisfechos en todo México</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-purple-700 mt-8 pt-8 text-center text-purple-200">
          <p>&copy; {currentYear} MicroCredit. Todos los derechos reservados.</p>
          <p className="text-sm mt-2">
            Desarrollado con tecnología segura y confiable para proteger tu información financiera.
          </p>
        </div>
      </div>
    </footer>
  );
}