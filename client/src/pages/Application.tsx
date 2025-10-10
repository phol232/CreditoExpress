import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import RegistrationForm from '@/components/RegistrationForm';
import VerificationForm from '@/components/VerificationForm';
import CompleteLoanApplicationForm from '@/components/CompleteLoanApplicationForm';
import ThemeToggle from '@/components/ThemeToggle';

type ApplicationStep = 'registration' | 'verification' | 'pre-application' | 'complete';

export default function Application() {
  const { user, isVerified } = useAuth();
  const [currentStep, setCurrentStep] = useState<ApplicationStep>('registration');

  // Determinar el paso inicial basado en el estado del usuario
  useEffect(() => {
    if (user) {
      // Usuario logueado
      if (isVerified) {
        // Usuario verificado -> ir directo al formulario
        setCurrentStep('pre-application');
      } else {
        // Usuario no verificado -> ir a verificación
        setCurrentStep('verification');
      }
    } else {
      // Usuario no logueado -> registro
      setCurrentStep('registration');
    }
  }, [user, isVerified]);

  const steps = [
    { id: 'registration', title: 'Registro', description: 'Crea tu cuenta' },
    { id: 'verification', title: 'Verificación', description: 'Confirma tu contacto' },
    { id: 'pre-application', title: 'Solicitud', description: 'Completa tu solicitud' },
    { id: 'complete', title: 'Completado', description: 'Solicitud enviada' }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const getProgressPercentage = () => {
    return ((getCurrentStepIndex() + 1) / steps.length) * 100;
  };

  const canAccessStep = (stepId: string): boolean => {
    // Paso 1 (registro): solo si NO está logueado
    if (stepId === 'registration') {
      return !user;
    }

    // Paso 2 (verificación): solo si está logueado pero NO verificado
    if (stepId === 'verification') {
      return user !== null && !isVerified;
    }

    // Paso 3 (formulario): solo si está logueado Y verificado
    if (stepId === 'pre-application') {
      return user !== null && isVerified;
    }

    // Paso 4 (completado): siempre accesible si llegaste aquí
    return true;
  };

  const goToNextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1].id as ApplicationStep;
      if (canAccessStep(nextStep)) {
        setCurrentStep(nextStep);
      }
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1].id as ApplicationStep;
      if (canAccessStep(prevStep)) {
        setCurrentStep(prevStep);
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'registration':
        if (user) {
          // Usuario ya logueado, mostrar mensaje
          return (
            <Card className="w-full max-w-md mx-auto text-center">
              <CardHeader>
                <div className="inline-flex p-4 rounded-full bg-blue-100 text-blue-600 w-fit mx-auto mb-4">
                  <Lock className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl font-bold">
                  Ya tienes una cuenta
                </CardTitle>
                <CardDescription>
                  Has iniciado sesión como {user.email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Este paso ya está completado. Continúa con la verificación.
                </p>
                <Button onClick={goToNextStep}>
                  Continuar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          );
        }
        return <RegistrationForm onSuccess={goToNextStep} />;

      case 'verification':
        if (!user) {
          // No logueado, no puede acceder
          return (
            <Card className="w-full max-w-md mx-auto text-center">
              <CardHeader>
                <CardTitle>Debes iniciar sesión primero</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setCurrentStep('registration')}>
                  Ir a Registro
                </Button>
              </CardContent>
            </Card>
          );
        }
        if (isVerified) {
          // Ya verificado
          return (
            <Card className="w-full max-w-md mx-auto text-center">
              <CardHeader>
                <div className="inline-flex p-4 rounded-full bg-green-100 text-green-600 w-fit mx-auto mb-4">
                  <Lock className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl font-bold">
                  Cuenta Verificada
                </CardTitle>
                <CardDescription>
                  Tu cuenta ya está verificada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={goToNextStep}>
                  Continuar al Formulario
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          );
        }
        return <VerificationForm contactType="email" contactValue={user.email || ''} onSuccess={goToNextStep} />;

      case 'pre-application':
        if (!user) {
          return (
            <Card className="w-full max-w-md mx-auto text-center">
              <CardHeader>
                <CardTitle>Debes iniciar sesión</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setCurrentStep('registration')}>
                  Ir a Registro
                </Button>
              </CardContent>
            </Card>
          );
        }
        if (!isVerified) {
          return (
            <Card className="w-full max-w-md mx-auto text-center">
              <CardHeader>
                <div className="inline-flex p-4 rounded-full bg-yellow-100 text-yellow-600 w-fit mx-auto mb-4">
                  <Lock className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl font-bold">
                  Verificación Requerida
                </CardTitle>
                <CardDescription>
                  Debes verificar tu cuenta antes de continuar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Por seguridad, necesitamos verificar tu identidad antes de procesar tu solicitud de crédito.
                </p>
                <Button onClick={() => setCurrentStep('verification')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Ir a Verificación
                </Button>
              </CardContent>
            </Card>
          );
        }
        console.log('🔍 Renderizando CompleteLoanApplicationForm');
        return <CompleteLoanApplicationForm onSuccess={goToNextStep} />;

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
                Tu solicitud de crédito ha sido recibida exitosamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Recibirás una respuesta en un máximo de 48 horas hábiles a tu email registrado.
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
              {steps.map((step, index) => {
                const isAccessible = canAccessStep(step.id);
                const isCurrent = index === getCurrentStepIndex();
                const isCompleted = index < getCurrentStepIndex();

                return (
                  <div key={step.id} className="text-center relative">
                    <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-semibold ${isCurrent
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                        : isCompleted
                          ? 'bg-green-500 text-white'
                          : isAccessible
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-gray-200 text-gray-400'
                      }`}>
                      {isCompleted ? '✓' : index + 1}
                      {!isAccessible && (
                        <Lock className="absolute h-3 w-3 -top-1 -right-1 text-gray-500" />
                      )}
                    </div>
                    <p className={`text-xs font-medium ${isAccessible ? 'text-foreground' : 'text-gray-400'}`}>
                      {step.title}
                    </p>
                    <p className={`text-xs ${isAccessible ? 'text-muted-foreground' : 'text-gray-400'}`}>
                      {step.description}
                    </p>
                  </div>
                );
              })}
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
              disabled={
                getCurrentStepIndex() === 0 ||
                // Bloquear "Anterior" si está en verificación y ya está logueado (no puede volver a registro)
                (currentStep === 'verification' && user !== null) ||
                // Bloquear si el paso anterior no es accesible
                (getCurrentStepIndex() > 0 && !canAccessStep(steps[getCurrentStepIndex() - 1]?.id))
              }
              data-testid="button-previous-step"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            <Button
              onClick={goToNextStep}
              disabled={
                getCurrentStepIndex() === steps.length - 1 ||
                // Bloquear "Siguiente" si está en verificación y NO está verificado
                (currentStep === 'verification' && !isVerified) ||
                // Bloquear si el siguiente paso no es accesible
                (getCurrentStepIndex() < steps.length - 1 && !canAccessStep(steps[getCurrentStepIndex() + 1]?.id))
              }
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