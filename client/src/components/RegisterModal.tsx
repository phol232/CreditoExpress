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
import { UserPlus, Mail, Lock, Eye, EyeOff, User, Phone, CreditCard } from 'lucide-react';
import { FaGoogle, FaGithub } from 'react-icons/fa';

const registerSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  dni: z.string().min(8, 'El DNI debe tener al menos 8 caracteres'),
  email: z.string().email('Ingresa un email válido'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'Debes aceptar los términos'),
  acceptPrivacy: z.boolean().refine(val => val === true, 'Debes aceptar la política de privacidad')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dni: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
      acceptPrivacy: false
    }
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    console.log('Register data:', data);
    // Todo: remove mock functionality - implement actual registration
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Registro exitoso');
    setIsSubmitting(false);
    onClose();
  };

  const handleSocialRegister = (provider: 'google' | 'github') => {
    console.log(`Register with ${provider}`);
    // Todo: remove mock functionality - implement social registration
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <UserPlus className="h-6 w-6" />
            Crear Cuenta
          </DialogTitle>
          <DialogDescription className="text-center">
            Únete a MicroCredit y accede a los mejores servicios financieros
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Social Registration Buttons */}
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full h-12" 
              onClick={() => handleSocialRegister('google')}
              data-testid="button-register-google"
            >
              <FaGoogle className="mr-3 h-5 w-5 text-red-500" />
              Registrarse con Google
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full h-12" 
              onClick={() => handleSocialRegister('github')}
              data-testid="button-register-github"
            >
              <FaGithub className="mr-3 h-5 w-5" />
              Registrarse con GitHub
            </Button>
          </div>
          
          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-2 text-muted-foreground text-sm">o completa tus datos</span>
            </div>
          </div>
          
          {/* Registration Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nombre
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Juan"
                          data-testid="input-register-firstname"
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
                      <FormLabel>Apellidos</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Pérez González"
                          data-testid="input-register-lastname"
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
                    <FormLabel className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      DNI / Cédula
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="12345678"
                        data-testid="input-register-dni"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          placeholder="juan@ejemplo.com"
                          data-testid="input-register-email"
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
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Teléfono
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="+52 55 1234 5678"
                          data-testid="input-register-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Contraseña
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            {...field} 
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            data-testid="input-register-password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            {...field} 
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            data-testid="input-register-confirm-password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-register-terms"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          Acepto los{' '}
                          <button type="button" className="text-primary hover:underline">
                            términos y condiciones
                          </button>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="acceptPrivacy"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-register-privacy"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          Acepto la{' '}
                          <button type="button" className="text-primary hover:underline">
                            política de privacidad
                          </button>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
                data-testid="button-register-submit"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Creando cuenta...
                  </div>
                ) : (
                  'Crear Cuenta'
                )}
              </Button>
            </form>
          </Form>
          
          <div className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Button 
              variant="ghost" 
              className="p-0 text-primary h-auto"
              onClick={onSwitchToLogin}
              data-testid="button-switch-to-login"
            >
              Inicia sesión aquí
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}