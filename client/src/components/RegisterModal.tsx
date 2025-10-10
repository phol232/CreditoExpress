import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, Eye, EyeOff, User, Phone, Star } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { MicrofinancieraSelector } from './MicrofinancieraSelector';
import { EmailVerificationStep } from './EmailVerificationStep';

const registerSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  dni: z.string().min(8, 'El DNI debe tener al menos 8 dígitos').max(12, 'El DNI no puede tener más de 12 dígitos'),
  email: z.string().email('Ingresa un email válido'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  acceptTerms: z.boolean().refine(val => val === true, 'Debes aceptar los términos')
});

type RegisterForm = z.infer<typeof registerSchema>;

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onRegisterSuccess?: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin, onRegisterSuccess }: RegisterModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'verification' | 'complete'>('form');
  const [registrationEmail, setRegistrationEmail] = useState('');
  const { t } = useLanguage();
  const { refreshProfile, microfinancieraId } = useAuth();
  
  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dni: '',
      email: '',
      phone: '',
      password: '',
      acceptTerms: false
    }
  });

  const onSubmit = async (data: RegisterForm) => {
    if (!microfinancieraId) {
      form.setError('root', { 
        type: 'manual', 
        message: 'Por favor selecciona una microfinanciera primero' 
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Verificar si el email ya existe EN ESTA MICROFINANCIERA
      const emailExists = await authService.checkEmailExists(data.email, microfinancieraId);
      if (emailExists) {
        form.setError('email', { 
          type: 'manual', 
          message: 'Este email ya está registrado en esta microfinanciera' 
        });
        setIsSubmitting(false);
        return;
      }

      // Verificar si el DNI ya existe EN ESTA MICROFINANCIERA
      const dniExists = await authService.checkDniExists(data.dni, microfinancieraId);
      if (dniExists) {
        form.setError('dni', { 
          type: 'manual', 
          message: 'Este DNI ya está registrado en esta microfinanciera' 
        });
        setIsSubmitting(false);
        return;
      }

      // Guardar el email y pasar al paso de verificación
      setRegistrationEmail(data.email);
      setCurrentStep('verification');
    } catch (error: any) {
      console.error('Error en validación:', error);
      form.setError('root', { type: 'manual', message: 'Error al validar los datos' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationComplete = async () => {
    const data = form.getValues();
    
    setIsSubmitting(true);
    
    try {
      // Registrar usuario con rol de CUSTOMER (portal para clientes)
      const result = await authService.registerWithEmail({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        dni: data.dni,
        phone: data.phone,
        microfinancieraId: microfinancieraId!,
        roles: ['customer'] // Siempre customer en el portal
      });

      console.log('Registro exitoso:', result);
      
      // Resetear formulario
      form.reset();
      setCurrentStep('form');
      
      if (onRegisterSuccess) {
        onRegisterSuccess();
      } else {
        onClose();
      }
    } catch (error: any) {
      console.error('Error en registro:', error);
      
      // Volver al formulario con el error
      setCurrentStep('form');
      
      let errorMessage = 'Error al crear la cuenta. Inténtalo de nuevo.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email ya tiene una cuenta. ¿Quieres iniciar sesión en su lugar?';
        form.setError('email', { 
          type: 'manual', 
          message: 'Este email ya está registrado. Usa "Iniciar Sesión" si ya tienes cuenta.' 
        });
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        form.setError('password', { type: 'manual', message: errorMessage });
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
        form.setError('email', { type: 'manual', message: errorMessage });
      } else if (error.message) {
        form.setError('root', { type: 'manual', message: error.message });
      } else {
        form.setError('root', { type: 'manual', message: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialRegister = async (provider: 'google') => {
    if (!microfinancieraId) {
      form.setError('root', { 
        type: 'manual', 
        message: 'Por favor selecciona una microfinanciera primero' 
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await authService.loginWithGoogle(microfinancieraId, ['customer']);
      console.log('Registro con Google exitoso:', result);
      
      // El AuthContext ahora usa listener en tiempo real, no necesitamos delay
      if (onRegisterSuccess) {
        onRegisterSuccess();
      } else {
        onClose();
      }
    } catch (error: any) {
      console.error('Error con Google:', error);
      
      let errorMessage = 'Error al registrarse con Google. Inténtalo de nuevo.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Registro cancelado por el usuario';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup bloqueado. Permite popups para este sitio.';
      }
      
      form.setError('root', { type: 'manual', message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{t('register.title')}</DialogTitle>
          <DialogDescription>{t('register.subtitle')}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
          {/* Left Side - Background Pattern */}
          <div className="hidden md:block relative bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-900 overflow-hidden">
            {/* Geometric Pattern */}
            <div className="absolute inset-0">
              {/* Background shapes */}
              <div className="absolute top-16 right-12 w-20 h-20 bg-cyan-300/30 rounded-full"></div>
              <div className="absolute top-40 left-20 w-14 h-14 bg-blue-300/40 rounded-lg rotate-45"></div>
              <div className="absolute bottom-32 right-10 w-28 h-28 bg-indigo-400/20 rounded-full"></div>
              <div className="absolute bottom-16 left-16 w-16 h-16 bg-cyan-400/30 rounded-lg rotate-12"></div>
              
              {/* Different geometric shapes for register */}
              <div className="absolute top-1/2 left-1/3 w-0 h-0 border-l-10 border-r-10 border-b-18 border-l-transparent border-r-transparent border-b-cyan-300/40"></div>
              <div className="absolute bottom-1/2 right-1/4 w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-blue-400/30 transform rotate-180"></div>
              
              {/* Hexagonal pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-6 grid-rows-10 h-full gap-2">
                  {Array.from({ length: 60 }).map((_, i) => (
                    <div key={i} className="border border-cyan-300/20 transform rotate-45"></div>
                  ))}
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-1/3 left-1/4 w-8 h-8 bg-yellow-400 rounded-full"></div>
              <div className="absolute bottom-1/3 right-1/3 w-3 h-12 bg-green-400 rounded-full transform rotate-45"></div>
              
              {/* Wave patterns */}
              <svg className="absolute top-0 right-0 w-full h-24" viewBox="0 0 400 60" fill="none">
                <path d="M400 0 Q300 30 200 10 T0 40" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none"/>
                <path d="M400 20 Q250 50 100 20 T-100 10" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none"/>
              </svg>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex flex-col justify-start p-6 bg-background overflow-y-auto" style={{ maxHeight: '95vh' }}>
            {currentStep === 'verification' ? (
              <EmailVerificationStep
                email={registrationEmail}
                onVerified={handleVerificationComplete}
                onBack={() => setCurrentStep('form')}
              />
            ) : (
              <>
                {/* Logo/Brand */}
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-cyan-600 to-indigo-700 rounded-lg flex items-center justify-center mr-2">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                </div>

                {/* Header */}
                <div className="mb-3">
                  <h1 className="text-xl font-bold text-foreground mb-1">
                    {t('register.title')}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {t('register.subtitle')}
                  </p>
                </div>

                {/* Selector de Microfinanciera */}
                <div className="mb-3">
                  <MicrofinancieraSelector />
                </div>

                {microfinancieraId && (
                <>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                {/* Error general */}
                {form.formState.errors.root && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
                    {form.formState.errors.root.message}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Nombre *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            autoComplete="given-name"
                            placeholder="Juan"
                            data-testid="input-register-firstname"
                            className="h-9 border-input bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Apellido *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            autoComplete="family-name"
                            placeholder="Pérez"
                            data-testid="input-register-lastname"
                            className="h-9 border-input bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="dni"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        DNI/NIE *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="text"
                          autoComplete="off"
                          placeholder="12345678A"
                          data-testid="input-register-dni"
                          className="h-9 border-input bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        {t('register.email')} *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          autoComplete="email"
                          placeholder="Introduce tu dirección de email"
                          data-testid="input-register-email"
                          className="h-9 border-input bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        {t('register.phone')} *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="tel"
                          autoComplete="tel"
                          placeholder="+34 600 000 000"
                          data-testid="input-register-phone"
                          className="h-9 border-input bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        {t('register.password')} *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            {...field} 
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            placeholder="Introduce contraseña"
                            data-testid="input-register-password"
                            className="h-9 border-input bg-background pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted/50"
                            onClick={() => setShowPassword(!showPassword)}
                            data-testid="button-toggle-password"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-accept-terms"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">
                          {t('register.terms')}
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium" 
                  disabled={isSubmitting}
                  data-testid="button-register-submit"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      {t('common.loading')}
                    </div>
                  ) : (
                    t('register.create_account')
                  )}
                </Button>
              </form>
            </Form>

            {/* Divider */}
            <div className="relative my-2">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-background px-3 text-muted-foreground text-xs">
                  {t('register.or')}
                </span>
              </div>
            </div>

            {/* Social Register */}
            <Button 
              variant="outline" 
              className="w-full h-10 hover-elevate mb-2" 
              onClick={() => handleSocialRegister('google')}
              data-testid="button-register-google"
            >
              <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
              {t('register.google')}
            </Button>

            {/* Login Link */}
            <div className="text-center text-xs text-muted-foreground">
              {t('register.have_account')}{' '}
              <Button 
                variant="ghost" 
                className="p-0 text-primary h-auto font-medium hover:underline"
                onClick={onSwitchToLogin}
                data-testid="button-switch-to-login"
              >
                {t('register.login_here')}
              </Button>
            </div>
            </>
            )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}