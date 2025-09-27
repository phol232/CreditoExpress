import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, PiggyBank, TrendingUp, Calculator, Users, Shield } from 'lucide-react';

const services = [
  {
    icon: CreditCard,
    title: 'Préstamos Personales',
    description: 'Hasta $500,000 pesos para tus proyectos personales con tasas competitivas y plazos flexibles.',
    features: ['Tasa desde 12% anual', 'Hasta 60 meses', 'Sin garantía'],
    color: 'text-purple-600'
  },
  {
    icon: TrendingUp,
    title: 'Créditos Empresariales',
    description: 'Impulsa tu negocio con líneas de crédito diseñadas para emprendedores y PYMES.',
    features: ['Hasta $2,000,000', 'Capital de trabajo', 'Equipamiento'],
    color: 'text-blue-600'
  },
  {
    icon: PiggyBank,
    title: 'Microcréditos',
    description: 'Soluciones financieras rápidas para pequeñas necesidades económicas inmediatas.',
    features: ['Desde $5,000', 'Aprobación rápida', 'Sin buró de crédito'],
    color: 'text-green-600'
  },
  {
    icon: Calculator,
    title: 'Planificación Financiera',
    description: 'Asesoría personalizada para mejorar tu salud financiera y alcanzar tus metas.',
    features: ['Consultoría gratuita', 'Plan personalizado', 'Seguimiento mensual'],
    color: 'text-orange-600'
  },
  {
    icon: Users,
    title: 'Crédito Grupal',
    description: 'Financiamiento colaborativo para grupos de personas con proyectos en común.',
    features: ['Responsabilidad compartida', 'Tasas preferenciales', 'Apoyo mutuo'],
    color: 'text-indigo-600'
  },
  {
    icon: Shield,
    title: 'Seguros y Protección',
    description: 'Protege tus inversiones y préstamos con nuestros productos de seguros especializados.',
    features: ['Seguro de vida', 'Protección de pagos', 'Cobertura total'],
    color: 'text-red-600'
  }
];

export default function ServicesSection() {
  const handleLearnMore = (service: string) => {
    console.log(`Learn more about ${service} clicked`);
    // Todo: remove mock functionality - implement service details navigation
  };

  return (
    <section id="servicios" className="py-16 bg-gradient-to-br from-background to-accent/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Características Esenciales para{' '}
            <span className="text-primary">Finanzas Inteligentes</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ofrecemos los mejores servicios financieros para ti con términos seguros. 
            Nuestros productos están diseñados para adaptarse a tus necesidades específicas.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="group hover-elevate transition-all duration-300 border-card-border">
              <CardHeader className="pb-4">
                <div className={`inline-flex p-3 rounded-lg bg-accent/10 w-fit mb-4 ${service.color}`}>
                  <service.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-semibold text-card-foreground">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={() => handleLearnMore(service.title)}
                  data-testid={`button-learn-more-${index}`}
                >
                  Conocer Más
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}