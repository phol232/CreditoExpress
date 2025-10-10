import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { verificationService } from '@/services/verificationService';

interface EmailVerificationStepProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

export function EmailVerificationStep({ email, onVerified, onBack }: EmailVerificationStepProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos
  const [canResend, setCanResend] = useState(false);

  // Enviar código al montar el componente
  useEffect(() => {
    sendCode();
  }, []);

  // Contador de tiempo
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const sendCode = async () => {
    setIsSending(true);
    setError('');
    setSuccess('');

    try {
      await verificationService.sendVerificationCode(email);
      setSuccess('Código enviado a tu email');
      setTimeLeft(600); // Reiniciar contador
      setCanResend(false);
    } catch (err) {
      setError('Error al enviar el código. Intenta nuevamente.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await verificationService.verifyCode(code, email);
      
      if (result.success) {
        setSuccess('Email verificado correctamente');
        setTimeout(() => {
          onVerified();
        }, 1000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error al verificar el código. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Verifica tu email</h2>
        <p className="text-muted-foreground">
          Hemos enviado un código de 6 dígitos a
        </p>
        <p className="font-semibold">{email}</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">Código de verificación</Label>
          <Input
            id="code"
            type="text"
            placeholder="000000"
            value={code}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setCode(value);
            }}
            maxLength={6}
            className="text-center text-2xl tracking-widest font-mono"
            disabled={isLoading}
            autoFocus
          />
          <p className="text-sm text-muted-foreground text-center">
            {timeLeft > 0 ? (
              <>El código expira en {formatTime(timeLeft)}</>
            ) : (
              <span className="text-destructive">El código ha expirado</span>
            )}
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || code.length !== 6 || timeLeft <= 0}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            'Verificar código'
          )}
        </Button>
      </form>

      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={sendCode}
          disabled={isSending || !canResend}
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            'Reenviar código'
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onBack}
          disabled={isLoading || isSending}
        >
          Volver
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>¿No recibiste el código?</p>
        <p>Revisa tu carpeta de spam o correo no deseado</p>
      </div>
    </div>
  );
}
