import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CreditCard } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface AdditionalInfoStepProps {
  form: UseFormReturn<any>;
}

export function AdditionalInfoStep({ form }: AdditionalInfoStepProps) {
  const hasBankAccount = form.watch('hasBankAccount');
  const hasGuarantee = form.watch('hasGuarantee');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          <CreditCard className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold">Información Adicional</h3>
      </div>

      <FormField
        control={form.control}
        name="hasCreditHistory"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>¿Posee historial crediticio?</FormLabel>
              <FormDescription>
                Indica si has tenido préstamos o créditos anteriormente
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="hasBankAccount"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>¿Tiene cuenta bancaria?</FormLabel>
              <FormDescription>
                Indica si posees una cuenta en alguna entidad bancaria
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      {hasBankAccount && (
        <FormField
          control={form.control}
          name="bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Banco</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Banco XYZ" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="hasGuarantee"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>¿Tiene garantía o aval disponible?</FormLabel>
              <FormDescription>
                Indica si cuentas con alguna garantía o aval para el préstamo
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      {hasGuarantee && (
        <FormField
          control={form.control}
          name="guaranteeDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción de la Garantía</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Describe la garantía o aval disponible (propiedad, vehículo, aval personal, etc.)"
                  className="min-h-[80px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="additionalComments"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Comentarios Adicionales (Opcional)</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Cualquier información adicional que consideres relevante para tu solicitud..."
                className="min-h-[100px]"
              />
            </FormControl>
            <FormDescription>
              Puedes agregar información sobre tu situación financiera, planes de pago, etc.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
