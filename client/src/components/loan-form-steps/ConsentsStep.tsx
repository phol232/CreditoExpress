import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Shield, MapPin } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface ConsentsStepProps {
  form: UseFormReturn<any>;
  locationPermission: 'granted' | 'denied' | 'pending';
  onRequestLocation: () => void;
}

export function ConsentsStep({ form, locationPermission, onRequestLocation }: ConsentsStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          <Shield className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold">Consentimientos y Autorización</h3>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-900">
          <strong>Importante:</strong> Para procesar tu solicitud de crédito, necesitamos tu autorización explícita para los siguientes puntos. Lee cuidadosamente cada uno antes de continuar.
        </p>
      </div>

      <FormField
        control={form.control}
        name="acceptTerms"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="text-base font-medium">
                Acepto los Términos y Condiciones *
              </FormLabel>
              <FormDescription>
                He leído y acepto los{' '}
                <a href="/terminos" target="_blank" className="text-primary underline">
                  términos y condiciones
                </a>{' '}
                del servicio de crédito. Entiendo las tasas de interés, comisiones y condiciones de pago.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="authorizeCreditCheck"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="text-base font-medium">
                Autorizo Consulta en Centrales de Riesgo *
              </FormLabel>
              <FormDescription>
                Autorizo expresamente a la microfinanciera a consultar mi historial crediticio en centrales de riesgo (Equifax, Sentinel, Infocorp, etc.) para evaluar mi capacidad de pago y comportamiento crediticio.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="confirmTruthfulness"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="text-base font-medium">
                Confirmo Veracidad de la Información *
              </FormLabel>
              <FormDescription>
                Declaro bajo juramento que toda la información proporcionada en esta solicitud es verdadera, completa y exacta. Entiendo que proporcionar información falsa puede resultar en el rechazo de mi solicitud o acciones legales.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <div className="border-t pt-6 mt-6">
        <h4 className="font-medium mb-4">Ubicación (Opcional)</h4>
        
        <FormField
          control={form.control}
          name="acceptGeolocation"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (checked) {
                      onRequestLocation();
                    }
                  }}
                />
              </FormControl>
              <div className="space-y-1 leading-none flex-1">
                <FormLabel>
                  Permitir acceso a mi ubicación
                </FormLabel>
                <FormDescription>
                  Esto nos ayuda a validar tu identidad y acelerar el proceso de evaluación
                </FormDescription>
                {locationPermission === 'granted' && (
                  <Badge className="bg-green-100 text-green-700 mt-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    Ubicación obtenida
                  </Badge>
                )}
                {locationPermission === 'denied' && (
                  <Badge variant="destructive" className="mt-2">
                    Acceso denegado
                  </Badge>
                )}
              </div>
            </FormItem>
          )}
        />
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
        <p className="text-xs text-gray-600">
          <strong>Protección de Datos:</strong> Tus datos personales serán tratados conforme a la Ley N° 29733 - Ley de Protección de Datos Personales y su reglamento. Tienes derecho a acceder, rectificar, cancelar u oponerte al tratamiento de tus datos personales.
        </p>
      </div>
    </div>
  );
}
