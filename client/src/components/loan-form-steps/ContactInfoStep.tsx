import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Home } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface ContactInfoStepProps {
  form: UseFormReturn<any>;
}

export function ContactInfoStep({ form }: ContactInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          <Home className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold">Información de Contacto</h3>
      </div>

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dirección Completa *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Av. Larco 123, Dpto 401" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          control={form.control}
          name="district"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Distrito *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Miraflores" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="province"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provincia *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Lima" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departamento *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Lima" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="mobilePhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono Móvil *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="+51 999 999 999" />
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
              <FormLabel>Correo Electrónico *</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="correo@ejemplo.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="homeReference"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Referencia Domiciliaria (Opcional)</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Frente al parque, edificio azul" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
