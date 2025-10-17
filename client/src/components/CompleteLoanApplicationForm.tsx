import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { FileText, DollarSign, User, Briefcase, Home, CreditCard, Shield, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { loanApplicationService } from '@/services/loanApplicationService';
import { Separator } from '@/components/ui/separator';
import { ProductSelectionStep } from './loan-form-steps/ProductSelectionStep';
import { PersonalInfoStep } from './loan-form-steps/PersonalInfoStep';
import { ContactInfoStep } from './loan-form-steps/ContactInfoStep';
import { EmploymentInfoStep } from './loan-form-steps/EmploymentInfoStep';
import { FinancialInfoStep } from './loan-form-steps/FinancialInfoStep';
import { AdditionalInfoStep } from './loan-form-steps/AdditionalInfoStep';
import { ConsentsStep } from './loan-form-steps/ConsentsStep';

// Schema de validación completo
const completeLoanApplicationSchema = z.object({
  // Producto
  productId: z.string().min(1, 'Debes seleccionar un producto'),
  productCode: z.string().min(1),
  productName: z.string().min(1),
  productRateNominal: z.number(),
  productInterestType: z.string(),
  productTermMin: z.number(),
  productTermMax: z.number(),
  productAmountMin: z.number(),
  productAmountMax: z.number(),
  
  // Datos Personales
  firstName: z.string().min(2, 'Nombre requerido'),
  lastName: z.string().min(2, 'Apellido requerido'),
  documentType: z.enum(['DNI', 'CE', 'PASAPORTE']),
  documentNumber: z.string().min(8, 'Número de documento inválido'),
  birthDate: z.string().min(1, 'Fecha de nacimiento requerida'),
  nationality: z.string().min(2, 'Nacionalidad requerida'),
  maritalStatus: z.enum(['soltero', 'casado', 'divorciado', 'viudo', 'conviviente']),
  dependents: z.string().optional(),
  
  // Información de Contacto
  address: z.string().min(5, 'Dirección requerida'),
  district: z.string().min(2, 'Distrito requerido'),
  province: z.string().min(2, 'Provincia requerida'),
  department: z.string().min(2, 'Departamento requerido'),
  mobilePhone: z.string().min(9, 'Teléfono móvil requerido'),
  email: z.string().email('Email inválido'),
  homeReference: z.string().optional(),
  
  // Información Laboral
  employmentType: z.enum(['empleado', 'independiente', 'empresario', 'jubilado', 'estudiante', 'desempleado']),
  employerName: z.string().optional(),
  position: z.string().optional(),
  yearsEmployed: z.string().optional(),
  monthsEmployed: z.string().optional(),
  contractType: z.enum(['indefinido', 'temporal', 'independiente']).optional(),
  workPhone: z.string().optional(),
  
  // Información Financiera
  monthlyIncome: z.string().min(1, 'Ingreso mensual requerido'),
  otherIncome: z.string().optional(),
  otherIncomeSource: z.string().optional(),
  monthlyExpenses: z.string().optional(),
  currentDebts: z.string().optional(),
  currentDebtsEntity: z.string().optional(),
  loanAmount: z.string().min(1, 'Monto del préstamo requerido'),
  loanTermMonths: z.string().min(1, 'Plazo requerido'),
  loanPurpose: z.string().min(1, 'Propósito requerido'),
  
  // Información Adicional
  hasCreditHistory: z.boolean(),
  hasBankAccount: z.boolean(),
  bankName: z.string().optional(),
  hasGuarantee: z.boolean(),
  guaranteeDescription: z.string().optional(),
  additionalComments: z.string().optional(),
  
  // Consentimientos
  acceptTerms: z.boolean().refine(val => val === true, 'Debes aceptar los términos'),
  authorizeCreditCheck: z.boolean().refine(val => val === true, 'Debes autorizar la consulta'),
  confirmTruthfulness: z.boolean().refine(val => val === true, 'Debes confirmar la veracidad'),
  
  // Geolocalización
  acceptGeolocation: z.boolean(),
});

type CompleteLoanApplicationForm = z.infer<typeof completeLoanApplicationSchema>;

interface CompleteLoanApplicationFormProps {
  onSuccess?: () => void;
}

export default function CompleteLoanApplicationForm({ onSuccess }: CompleteLoanApplicationFormProps) {
  const { user, microfinancieraId, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasPendingApplication, setHasPendingApplication] = useState(false);
  const [isCheckingApplications, setIsCheckingApplications] = useState(true);
  
  const form = useForm<CompleteLoanApplicationForm>({
    resolver: zodResolver(completeLoanApplicationSchema),
    defaultValues: {
      productId: '',
      productCode: '',
      productName: '',
      productRateNominal: 0,
      productInterestType: '',
      productTermMin: 0,
      productTermMax: 0,
      productAmountMin: 0,
      productAmountMax: 0,
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      documentType: 'DNI',
      documentNumber: '',
      birthDate: '',
      nationality: 'Peruana',
      maritalStatus: 'soltero',
      dependents: '0',
      address: '',
      district: '',
      province: '',
      department: '',
      mobilePhone: profile?.phone || '',
      email: profile?.email || '',
      homeReference: '',
      employmentType: 'empleado',
      employerName: '',
      position: '',
      yearsEmployed: '',
      monthsEmployed: '',
      contractType: 'indefinido',
      workPhone: '',
      monthlyIncome: '',
      otherIncome: '',
      otherIncomeSource: '',
      monthlyExpenses: '',
      currentDebts: '',
      currentDebtsEntity: '',
      loanAmount: '',
      loanTermMonths: '12',
      loanPurpose: '',
      hasCreditHistory: false,
      hasBankAccount: false,
      bankName: '',
      hasGuarantee: false,
      guaranteeDescription: '',
      additionalComments: '',
      acceptTerms: false,
      authorizeCreditCheck: false,
      confirmTruthfulness: false,
      acceptGeolocation: false,
    }
  });

  // Verificar si ya tiene una solicitud pendiente
  useEffect(() => {
    const checkPendingApplications = async () => {
      if (!user || !microfinancieraId) return;

      setIsCheckingApplications(true);
      try {
        const applications = await loanApplicationService.getUserApplications(user.uid, microfinancieraId);
        const pending = applications.some(app => app.status === 'pending' || app.status === 'in_review');
        setHasPendingApplication(pending);
      } catch (error) {
        console.error('Error checking applications:', error);
      } finally {
        setIsCheckingApplications(false);
      }
    };

    checkPendingApplications();
  }, [user, microfinancieraId]);


  const onSubmit = async (data: CompleteLoanApplicationForm) => {
    if (!user || !microfinancieraId) {
      setErrorMessage('Usuario no autenticado');
      return;
    }

    // Validar límites del producto
    const loanAmount = parseFloat(data.loanAmount);
    const loanTermMonths = parseInt(data.loanTermMonths);

    if (loanAmount < data.productAmountMin || loanAmount > data.productAmountMax) {
      setErrorMessage(`El monto debe estar entre S/${data.productAmountMin} y S/${data.productAmountMax}`);
      return;
    }

    if (loanTermMonths < data.productTermMin || loanTermMonths > data.productTermMax) {
      setErrorMessage(`El plazo debe estar entre ${data.productTermMin} y ${data.productTermMax} meses`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Preparar datos para enviar
      const applicationData = {
        product: {
          id: data.productId,
          code: data.productCode,
          name: data.productName,
          rateNominal: data.productRateNominal,
          interestType: data.productInterestType,
          termMin: data.productTermMin,
          termMax: data.productTermMax,
          amountMin: data.productAmountMin,
          amountMax: data.productAmountMax,
        },
        personalInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          documentType: data.documentType,
          documentNumber: data.documentNumber,
          birthDate: data.birthDate,
          nationality: data.nationality,
          maritalStatus: data.maritalStatus,
          dependents: data.dependents ? parseInt(data.dependents) : undefined,
        },
        contactInfo: {
          address: data.address,
          district: data.district,
          province: data.province,
          department: data.department,
          mobilePhone: data.mobilePhone,
          email: data.email,
          homeReference: data.homeReference,
        },
        employmentInfo: {
          employmentType: data.employmentType,
          employerName: data.employerName,
          position: data.position,
          yearsEmployed: data.yearsEmployed ? parseInt(data.yearsEmployed) : undefined,
          monthsEmployed: data.monthsEmployed ? parseInt(data.monthsEmployed) : undefined,
          contractType: data.contractType,
          workPhone: data.workPhone,
        },
        financialInfo: {
          monthlyIncome: parseFloat(data.monthlyIncome),
          otherIncome: data.otherIncome ? parseFloat(data.otherIncome) : undefined,
          otherIncomeSource: data.otherIncomeSource,
          monthlyExpenses: data.monthlyExpenses ? parseFloat(data.monthlyExpenses) : undefined,
          currentDebts: data.currentDebts ? parseFloat(data.currentDebts) : undefined,
          currentDebtsEntity: data.currentDebtsEntity,
          loanAmount: parseFloat(data.loanAmount),
          loanTermMonths: parseInt(data.loanTermMonths),
          loanPurpose: data.loanPurpose,
        },
        additionalInfo: {
          hasCreditHistory: data.hasCreditHistory,
          hasBankAccount: data.hasBankAccount,
          bankName: data.bankName,
          hasGuarantee: data.hasGuarantee,
          guaranteeDescription: data.guaranteeDescription,
          additionalComments: data.additionalComments,
        },
        consents: {
          acceptTerms: data.acceptTerms,
          authorizeCreditCheck: data.authorizeCreditCheck,
          confirmTruthfulness: data.confirmTruthfulness,
        },
        ...(userLocation && {
          location: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            timestamp: new Date()
          }
        }),
      };

      console.log('📤 Enviando solicitud con datos:', applicationData);
      
      const result = await loanApplicationService.createApplication(
        user.uid,
        microfinancieraId,
        applicationData
      );

      if (result.success) {
        console.log('✅ Solicitud completa creada:', result.applicationId);
        console.log('📊 Datos guardados:', applicationData);
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error('Error submitting application:', error);
      setErrorMessage(error.message || 'Error al enviar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationPermission('granted');
      },
      (error) => {
        console.log('Location denied:', error);
        setLocationPermission('denied');
      }
    );
  };

  const nextStep = async () => {
    const fields = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fields as any);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 7));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const getFieldsForStep = (step: number): string[] => {
    switch (step) {
      case 0:
        return ['productId', 'productCode', 'productName'];
      case 1:
        return ['firstName', 'lastName', 'documentType', 'documentNumber', 'birthDate', 'nationality', 'maritalStatus'];
      case 2:
        return ['address', 'district', 'province', 'department', 'mobilePhone', 'email'];
      case 3:
        return ['employmentType', 'employerName', 'position'];
      case 4:
        return ['monthlyIncome', 'loanAmount', 'loanTermMonths', 'loanPurpose'];
      case 5:
        return ['hasCreditHistory', 'hasBankAccount'];
      case 6:
        return ['acceptTerms', 'authorizeCreditCheck', 'confirmTruthfulness'];
      default:
        return [];
    }
  };

  if (isCheckingApplications) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verificando solicitudes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasPendingApplication) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="text-center py-12">
          <div className="inline-flex p-4 rounded-full bg-yellow-100 text-yellow-600 mb-4">
            <Clock className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Ya tienes una solicitud en proceso</h3>
          <p className="text-muted-foreground mb-6">
            Actualmente tienes una solicitud pendiente de revisión. Por favor espera a que sea procesada antes de enviar una nueva.
          </p>
        </CardContent>
      </Card>
    );
  }


  const steps = [
    { number: 0, title: 'Tipo de Crédito', icon: CreditCard },
    { number: 1, title: 'Datos Personales', icon: User },
    { number: 2, title: 'Contacto', icon: Home },
    { number: 3, title: 'Información Laboral', icon: Briefcase },
    { number: 4, title: 'Información Financiera', icon: DollarSign },
    { number: 5, title: 'Información Adicional', icon: FileText },
    { number: 6, title: 'Consentimientos', icon: Shield },
  ];

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="text-center">
        <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary w-fit mx-auto mb-4">
          <FileText className="h-8 w-8" />
        </div>
        <CardTitle className="text-2xl font-bold">Solicitud de Crédito</CardTitle>
        <CardDescription>
          Completa todos los campos para una evaluación crediticia completa
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      currentStep === step.number
                        ? 'bg-primary border-primary text-white'
                        : currentStep > step.number
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {currentStep > step.number ? '✓' : step.number}
                  </div>
                  <span className="text-xs mt-2 text-center hidden md:block">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 transition-colors ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-muted-foreground md:hidden">
            Paso {currentStep + 1} de {steps.length}: {steps[currentStep].title}
          </div>
        </div>

        {errorMessage && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md mb-4">
            {errorMessage}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Step Content */}
            <div className="min-h-[400px]">
              {currentStep === 0 && <ProductSelectionStep form={form} />}
              {currentStep === 1 && <PersonalInfoStep form={form} />}
              {currentStep === 2 && <ContactInfoStep form={form} />}
              {currentStep === 3 && <EmploymentInfoStep form={form} />}
              {currentStep === 4 && <FinancialInfoStep form={form} />}
              {currentStep === 5 && <AdditionalInfoStep form={form} />}
              {currentStep === 6 && (
                <ConsentsStep
                  form={form}
                  locationPermission={locationPermission}
                  onRequestLocation={requestLocation}
                />
              )}
            </div>

            <Separator />

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0 || isSubmitting}
              >
                Anterior
              </Button>

              <div className="flex gap-2">
                {currentStep < 6 ? (
                  <Button type="button" onClick={nextStep} disabled={isSubmitting}>
                    Siguiente
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        Enviando solicitud...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Enviar Solicitud
                      </div>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Tu solicitud será evaluada en un máximo de 48 horas hábiles</p>
        </div>
      </CardContent>
    </Card>
  );
}
