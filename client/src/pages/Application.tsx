import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import RegistrationForm from '@/components/RegistrationForm';
import VerificationForm from '@/components/VerificationForm';
import PreApplicationForm from '@/components/PreApplicationForm';
import ThemeToggle from '@/components/ThemeToggle';

type ApplicationStep = 'registration' | 'verification' | 'pre-application' | 'complete';

export default function Application() {
  const [currentStep, setCurrentStep] = useState<ApplicationStep>('registration');
  const [userEmail, setUserEmail] = useState('juan@ejemplo.com');
  const [userPhone, setUserPhone] = useState('+52 55 1234 5678');

  const steps = [
    { id: 'registration', title: 'Registro', description: 'Crea tu cuenta' },
    { id: 'verification', title: 'Verificación', description: 'Confirma tu contacto' },
    { id: 'pre-application', title: 'Pre-solicitud', description: 'Completa tu solicitud' },
    { id: 'complete', title: 'Completado', description: 'Solicitud enviada' }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const getProgressPercentage = () => {
    return ((getCurrentStepIndex() + 1) / steps.length) * 100;
  };

  const goToNextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as ApplicationStep);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as ApplicationStep);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'registration':
        return <RegistrationForm />;
      case 'verification':
        return <VerificationForm contactType="email" contactValue={userEmail} />;
      case 'pre-application':
        return <PreApplicationForm />;
      case 'complete':
        return (
          <Card className="w-full max-w-md mx-auto text-center">
            <CardHeader>
              <div className="inline-flex p-4 rounded-full bg-green-100 text-green-600 w-fit mx-auto mb-4">
                <ArrowRight className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">
                ¡Solicitud Enviada!
              </CardTitle>
              <CardDescription>
                Tu pre-solicitud ha sido recibida exitosamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Recibirás una respuesta en un máximo de 24 horas hábiles a tu email registrado.
              </p>
              <Button 
                onClick={() => window.location.href = '/'}
                data-testid="button-back-home"
              >
                Volver al Inicio
              </Button>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Solicitud de Crédito</h1>
          <p className="text-muted-foreground">Completa el proceso en simples pasos</p>
        </div>

        {/* Progress */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-foreground">
                Paso {getCurrentStepIndex() + 1} de {steps.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(getProgressPercentage())}% completado
              </span>
            </div>
            
            <Progress value={getProgressPercentage()} className="mb-4" />
            
            <div className="grid grid-cols-4 gap-4">
              {steps.map((step, index) => (
                <div key={step.id} className="text-center">
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-semibold ${
                    index <= getCurrentStepIndex() 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <p className="text-xs font-medium text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        {currentStep !== 'complete' && (
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={goToPreviousStep}
              disabled={getCurrentStepIndex() === 0}
              data-testid="button-previous-step"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            
            <Button 
              onClick={goToNextStep}
              disabled={getCurrentStepIndex() === steps.length - 1}
              data-testid="button-next-step"
            >
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}