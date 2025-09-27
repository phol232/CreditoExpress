import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { FaGoogle, FaGithub } from 'react-icons/fa';

const loginSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
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
  
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    console.log('Login data:', data);
    // Todo: remove mock functionality - implement actual login
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Login exitoso');
    setIsSubmitting(false);
    onClose();
  };

  const handleSocialLogin = (provider: 'google' | 'github') => {
    console.log(`Login with ${provider}`);
    // Todo: remove mock functionality - implement social login
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Iniciar Sesión</DialogTitle>
          <DialogDescription className="text-center">
            Accede a tu cuenta de MicroCredit
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full h-12" 
              onClick={() => handleSocialLogin('google')}
              data-testid="button-login-google"
            >
              <FaGoogle className="mr-3 h-5 w-5 text-red-500" />
              Continuar con Google
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full h-12" 
              onClick={() => handleSocialLogin('github')}
              data-testid="button-login-github"
            >
              <FaGithub className="mr-3 h-5 w-5" />
              Continuar con GitHub
            </Button>
          </div>
          
          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-2 text-muted-foreground text-sm">o</span>
            </div>
          </div>
          
          {/* Email/Password Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        placeholder="tu@email.com"
                        data-testid="input-login-email"
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
                          data-testid="input-login-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="text-right">
                <Button variant="ghost" className="p-0 text-sm text-primary h-auto">
                  ¿Olvidaste tu contraseña?
                </Button>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
                data-testid="button-login-submit"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>
          </Form>
          
          <div className="text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Button 
              variant="ghost" 
              className="p-0 text-primary h-auto"
              onClick={onSwitchToRegister}
              data-testid="button-switch-to-register"
            >
              Regístrate aquí
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}