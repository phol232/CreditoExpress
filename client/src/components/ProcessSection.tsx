import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, Shield, FileText, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Registro',
    description: 'Crea tu cuenta con tus datos básicos y acepta nuestros términos y condiciones de forma segura.',
    details: ['DNI y datos personales', 'Verificación de contacto', 'Aceptación de términos']
  },
  {
    icon: Shield,
    title: 'Verificación',
    description: 'Valida tu teléfono y email mediante OTP para asegurar que podamos contactarte.',
    details: ['Código SMS o WhatsApp', 'Verificación por email', 'Confirmación de identidad']
  },
  {
    icon: FileText,
    title: 'Pre-solicitud',
    description: 'Completa el formulario con datos mínimos y adjunta los documentos requeridos.',
    details: ['Información financiera básica', 'Documentos de respaldo', 'Geolocalización opcional']
  },
  {
    icon: CheckCircle,
    title: 'Evaluación',
    description: 'Nuestro sistema evalúa tu solicitud y te notificamos el resultado en máximo 24 horas.',
    details: ['Análisis crediticio', 'Verificación de datos', 'Respuesta inmediata']
  }
];

export default function ProcessSection() {
  return (
    <section id="proceso" className="py-16 bg-muted/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Proceso Simple en{' '}
            <span className="text-primary">4 Pasos</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Nuestro proceso está diseñado para ser rápido, seguro y completamente digital. 
            Obtén tu crédito sin salir de casa.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="text-center hover-elevate transition-all duration-300 h-full">
                <CardContent className="p-6">
                  <div className="relative mb-6">
                    <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary mb-4">
                      <step.icon className="h-8 w-8" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-card-foreground mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4 text-sm">
                    {step.description}
                  </p>
                  
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-primary/50 transform -translate-y-1/2 z-10"></div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Proceso 100% seguro y protegido por encriptación SSL</span>
          </div>
        </div>
      </div>
    </section>
  );
}