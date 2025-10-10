import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, Eye, EyeOff, Star } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { MicrofinancieraSelector } from './MicrofinancieraSelector';

const loginSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rememberMe: z.boolean().optional()
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useLanguage();
  const { refreshProfile, microfinancieraId } = useAuth();
  
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = async (data: LoginForm) => {
    if (!microfinancieraId) {
      form.setError('root', { 
        type: 'manual', 
        message: 'Por favor selecciona una microfinanciera primero' 
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await authService.loginWithEmail(data.email, data.password, microfinancieraId);
      console.log('Login exitoso:', result);
      
      // El AuthContext ahora usa listener en tiempo real, no necesitamos refrescar manualmente
      
      // Resetear formulario
      form.reset();
      onClose();
    } catch (error: any) {
      console.error('Error en login:', error);
      
      let errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No existe una cuenta con este email';
        form.setError('email', { type: 'manual', message: errorMessage });
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Contraseña incorrecta';
        form.setError('password', { type: 'manual', message: errorMessage });
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
        form.setError('email', { type: 'manual', message: errorMessage });
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos fallidos. Inténtalo más tarde.';
        form.setError('root', { type: 'manual', message: errorMessage });
      } else {
        form.setError('root', { type: 'manual', message: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: 'google') => {
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
      console.log('Login con Google exitoso:', result);
      
      // El AuthContext ahora usa listener en tiempo real, no necesitamos delay
      onClose();
    } catch (error: any) {
      console.error('Error con Google:', error);
      
      let errorMessage = 'Error al iniciar sesión con Google. Inténtalo de nuevo.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Login cancelado por el usuario';
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
      <DialogContent className="max-w-4xl w-full max-h-[90vh] h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{t('login.title')}</DialogTitle>
          <DialogDescription>{t('login.subtitle')}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
          {/* Left Side - Form */}
          <div className="flex flex-col justify-start p-4 lg:p-6 bg-background overflow-y-auto">
            {/* Logo/Brand */}
            <div className="flex items-center mb-8">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Star className="h-5 w-5 text-white" />
              </div>
            </div>

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {t('login.title')}
              </h1>
              <p className="text-muted-foreground">
                {t('login.subtitle')}
              </p>
            </div>

            {/* Selector de Microfinanciera */}
            <div className="mb-4">
              <MicrofinancieraSelector />
            </div>

            {microfinancieraId && (
            <>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Error general */}
                {form.formState.errors.root && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
                    {form.formState.errors.root.message}
                  </div>
                )}
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        {t('login.email')} *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          autoComplete="username"
                          placeholder="Introduce tu dirección de email"
                          data-testid="input-login-email"
                          className="h-11 border-input bg-background"
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
                        {t('login.password')} *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            {...field} 
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            placeholder="Introduce contraseña"
                            data-testid="input-login-password"
                            className="h-11 border-input bg-background pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 p-0 hover:bg-muted/50"
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

                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-remember-me"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">
                            {t('login.remember_me')}
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button variant="ghost" className="p-0 text-sm text-primary h-auto">
                    {t('login.forgot_password')}
                  </Button>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium" 
                  disabled={isSubmitting}
                  data-testid="button-login-submit"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      {t('common.loading')}
                    </div>
                  ) : (
                    t('login.sign_in')
                  )}
                </Button>
              </form>
            </Form>

            {/* Divider */}
            <div className="relative my-4">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-background px-4 text-muted-foreground text-sm">
                  {t('login.or')}
                </span>
              </div>
            </div>

            {/* Social Login */}
            <Button 
              variant="outline" 
              className="w-full h-11 hover-elevate" 
              onClick={() => handleSocialLogin('google')}
              data-testid="button-login-google"
            >
              <FaGoogle className="mr-3 h-5 w-5 text-red-500" />
              {t('login.google')}
            </Button>

            {/* Register Link */}
            <div className="text-center mt-4 text-sm text-muted-foreground">
              {t('login.no_account')}{' '}
              <Button 
                variant="ghost" 
                className="p-0 text-primary h-auto font-medium hover:underline"
                onClick={onSwitchToRegister}
                data-testid="button-switch-to-register"
              >
                {t('login.register_here')}
              </Button>
            </div>
            </>
            )}
          </div>

          {/* Right Side - Background Pattern */}
          <div className="hidden md:block relative bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 overflow-hidden">
            {/* Geometric Pattern */}
            <div className="absolute inset-0">
              {/* Background shapes */}
              <div className="absolute top-10 left-10 w-24 h-24 bg-purple-400/30 rounded-full"></div>
              <div className="absolute top-32 right-16 w-16 h-16 bg-purple-300/40 rounded-lg rotate-45"></div>
              <div className="absolute bottom-40 left-8 w-32 h-32 bg-purple-500/20 rounded-full"></div>
              <div className="absolute bottom-20 right-20 w-20 h-20 bg-purple-400/30 rounded-lg rotate-12"></div>
              
              {/* Triangular shapes */}
              <div className="absolute top-1/3 left-1/2 w-0 h-0 border-l-12 border-r-12 border-b-20 border-l-transparent border-r-transparent border-b-purple-300/40"></div>
              <div className="absolute bottom-1/3 right-1/3 w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-purple-400/30 transform rotate-180"></div>
              
              {/* Grid pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-8 grid-rows-12 h-full gap-1">
                  {Array.from({ length: 96 }).map((_, i) => (
                    <div key={i} className="border border-purple-300/20"></div>
                  ))}
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-1/4 right-1/4 w-6 h-6 bg-yellow-400 rounded-sm transform rotate-45"></div>
              <div className="absolute bottom-1/4 left-1/4 w-4 h-16 bg-cyan-400 rounded-full"></div>
              
              {/* Curved lines */}
              <svg className="absolute bottom-0 left-0 w-full h-32" viewBox="0 0 400 100" fill="none">
                <path d="M0 100 Q100 0 200 50 T400 30" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none"/>
                <path d="M0 80 Q150 10 300 60 T500 40" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none"/>
              </svg>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}