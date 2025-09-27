import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Shield, Mail, Phone, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const otpSchema = z.object({
  otp: z.string().min(6, 'El código debe tener 6 dígitos').max(6, 'El código debe tener 6 dígitos')
});

type OtpForm = z.infer<typeof otpSchema>;

interface VerificationFormProps {
  contactType: 'phone' | 'email';
  contactValue: string;
}

export default function VerificationForm({ contactType, contactValue }: VerificationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  
  const form = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: ''
    }
  });

  const onSubmit = async (data: OtpForm) => {
    setIsSubmitting(true);
    console.log('OTP verification:', data);
    // Todo: remove mock functionality - implement actual OTP verification API call
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsVerified(true);
    setIsSubmitting(false);
    console.log('Verificación exitosa');
  };

  const handleResendOtp = () => {
    console.log('Reenviar OTP');
    // Todo: remove mock functionality - implement actual resend OTP API call
    setTimeLeft(300);
    setCanResend(false);
  };

  // Simulate countdown
  useState(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isVerified) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="text-center p-8">
          <div className="inline-flex p-4 rounded-full bg-green-100 text-green-600 mb-4">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            ¡Verificación Exitosa!
          </h3>
          <p className="text-muted-foreground mb-6">
            Tu {contactType === 'phone' ? 'teléfono' : 'email'} ha sido verificado correctamente.
          </p>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verificado
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary w-fit mx-auto mb-4">
          {contactType === 'phone' ? <Phone className="h-8 w-8" /> : <Mail className="h-8 w-8" />}
        </div>
        <CardTitle className="text-2xl font-bold">Verificar {contactType === 'phone' ? 'Teléfono' : 'Email'}</CardTitle>
        <CardDescription>
          Ingresa el código de 6 dígitos que enviamos a{' '}
          <span className="font-medium text-foreground">{contactValue}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Código de Verificación
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="123456"
                      className="text-center text-2xl tracking-widest font-mono"
                      maxLength={6}
                      data-testid="input-otp"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
              data-testid="button-verify"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Verificando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Verificar Código
                </div>
              )}
            </Button>
          </form>
        </Form>
        
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
            <Clock className="h-4 w-4" />
            <span>El código expira en {formatTime(timeLeft)}</span>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleResendOtp}
            disabled={!canResend}
            data-testid="button-resend"
          >
            {canResend ? 'Reenviar código' : `Reenviar en ${formatTime(timeLeft)}`}
          </Button>
        </div>
        
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-3 w-3 text-green-600" />
            <span>Código protegido y encriptado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}