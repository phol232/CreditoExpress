import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Shield, Mail, Phone, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { verificationService } from '@/services/verificationService';

const otpSchema = z.object({
  otp: z.string().min(6, 'El código debe tener 6 dígitos').max(6, 'El código debe tener 6 dígitos')
});

type OtpForm = z.infer<typeof otpSchema>;

interface VerificationFormProps {
  contactType: 'phone' | 'email';
  contactValue: string;
  onSuccess?: () => void;
}

export default function VerificationForm({ contactType, contactValue, onSuccess }: VerificationFormProps) {
  const { user, microfinancieraId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: ''
    }
  });

  // Verificar si el email ya está verificado ANTES de enviar código
  useEffect(() => {
    const checkAndSendCode = async () => {
      if (user && microfinancieraId && contactType === 'email') {
        // Primero verificar si ya está verificado
        const verified = await verificationService.isEmailVerified(user.uid, microfinancieraId);
        if (verified) {
          setIsVerified(true);
        } else {
          // Solo enviar código si NO está verificado
          sendVerificationCode();
        }
      }
    };
    checkAndSendCode();
  }, [user, microfinancieraId]);

  const sendVerificationCode = async () => {
    if (!user || !microfinancieraId) {
      setErrorMessage('Usuario no autenticado');
      return;
    }

    setIsSending(true);
    setErrorMessage(null);

    try {
      const result = await verificationService.sendVerificationCode(
        contactValue,
        user.uid,
        microfinancieraId
      );

      if (result.success) {
        setTimeLeft(result.expiresIn || 600);
        setCanResend(false);
        console.log('✅ Código enviado exitosamente');
      }
    } catch (error: any) {
      console.error('Error sending code:', error);
      setErrorMessage(error.message || 'Error al enviar el código');
    } finally {
      setIsSending(false);
    }
  };

  const onSubmit = async (data: OtpForm) => {
    if (!user || !microfinancieraId) {
      setErrorMessage('Usuario no autenticado');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await verificationService.verifyCode(
        data.otp,
        contactValue, // Usar el email en lugar del userId
        user.uid,
        microfinancieraId
      );

      if (result.success) {
        setIsVerified(true);
        console.log('✅ Verificación exitosa');
        
        // Recargar el usuario de Firebase para actualizar emailVerified
        if (user) {
          await user.reload();
        }
        
        // Llamar al callback de éxito después de un breve delay
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
        }, 1500);
      } else {
        setErrorMessage(result.message);
        form.setError('otp', { message: result.message });
      }
    } catch (error: any) {
      console.error('Error verifying code:', error);
      setErrorMessage(error.message || 'Error al verificar el código');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    await sendVerificationCode();
  };

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

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
  }, [timeLeft]);

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
        {isSending && (
          <div className="text-center text-sm text-muted-foreground mb-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              Enviando código...
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md mb-4">
            {errorMessage}
          </div>
        )}

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