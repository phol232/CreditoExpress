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
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();
  
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
      <DialogContent className="sm:max-w-md max-w-sm mx-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {t('login.title')}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {t('login.subtitle')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 p-1">
          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full h-12 hover-elevate border-2" 
              onClick={() => handleSocialLogin('google')}
              data-testid="button-login-google"
            >
              <FaGoogle className="mr-3 h-5 w-5 text-red-500" />
              {t('login.google')}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full h-12 hover-elevate border-2" 
              onClick={() => handleSocialLogin('github')}
              data-testid="button-login-github"
            >
              <FaGithub className="mr-3 h-5 w-5" />
              {t('login.github')}
            </Button>
          </div>
          
          <div className="relative">
            <Separator className="bg-border" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-4 text-muted-foreground text-sm font-medium">{t('login.or')}</span>
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
                    <FormLabel className="flex items-center gap-2 text-sm font-medium">
                      <Mail className="h-4 w-4 text-primary" />
                      {t('login.email')}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="email"
                        placeholder="tu@email.com"
                        data-testid="input-login-email"
                        className="h-11 border-2 focus:border-primary"
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
                    <FormLabel className="flex items-center gap-2 text-sm font-medium">
                      <Lock className="h-4 w-4 text-primary" />
                      {t('login.password')}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          {...field} 
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          data-testid="input-login-password"
                          className="h-11 border-2 focus:border-primary pr-12"
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
                <Button variant="ghost" className="p-0 text-sm text-primary h-auto font-medium hover:underline">
                  {t('login.forgot_password')}
                </Button>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold" 
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
          
          <div className="text-center text-sm text-muted-foreground">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}