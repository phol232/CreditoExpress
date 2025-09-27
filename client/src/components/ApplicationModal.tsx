import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import RegistrationForm from '@/components/RegistrationForm';
import VerificationForm from '@/components/VerificationForm';
import PreApplicationForm from '@/components/PreApplicationForm';
import RegisterModal from '@/components/RegisterModal';

type ApplicationStep = 'registration' | 'verification' | 'pre-application' | 'complete';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplicationModal({ isOpen, onClose }: ApplicationModalProps) {
  const [currentStep, setCurrentStep] = useState<ApplicationStep>('registration');
  const [userEmail, setUserEmail] = useState('juan@ejemplo.com');
  const [userPhone, setUserPhone] = useState('+52 55 1234 5678');
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

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

  const handleClose = () => {
    setCurrentStep('registration');
    setIsUserRegistered(false);
    setShowRegisterModal(false);
    onClose();
  };

  const handleRegisterComplete = () => {
    setIsUserRegistered(true);
    setShowRegisterModal(false);
    setCurrentStep('verification');
  };

  const handleRegisterRequired = () => {
    setShowRegisterModal(true);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'registration':
        if (!isUserRegistered) {
          return (
            <Card className="w-full max-w-md mx-auto text-center">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  ¡Bienvenido a MicroCredit!
                </h3>
                <p className="text-muted-foreground mb-6">
                  Para solicitar un crédito, necesitas crear una cuenta primero. Es rápido y seguro.
                </p>
                <Button 
                  onClick={handleRegisterRequired}
                  data-testid="button-start-registration"
                  className="w-full"
                >
                  Crear Cuenta
                </Button>
              </CardContent>
            </Card>
          );
        }
        return <RegistrationForm />;
      case 'verification':
        return <VerificationForm contactType="email" contactValue={userEmail} />;
      case 'pre-application':
        return <PreApplicationForm />;
      case 'complete':
        return (
          <Card className="w-full max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <div className="inline-flex p-4 rounded-full bg-green-100 text-green-600 mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">
                ¡Solicitud Enviada!
              </h3>
              <p className="text-muted-foreground mb-6">
                Tu pre-solicitud ha sido recibida exitosamente. Recibirás una respuesta en máximo 24 horas.
              </p>
              <Button 
                onClick={handleClose}
                data-testid="button-close-application"
                className="w-full"
              >
                Cerrar
              </Button>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Solicitud de Crédito
          </DialogTitle>
          <DialogDescription className="text-center">
            Completa el proceso en simples pasos
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Progress */}
          <Card>
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
          <div className="px-2">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          {currentStep !== 'complete' && (
            <div className="flex justify-between px-6 pb-4">
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
      </DialogContent>
      
      <RegisterModal 
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          // Could implement login modal here if needed
        }}
        onRegisterSuccess={handleRegisterComplete}
      />
    </Dialog>
  );
}