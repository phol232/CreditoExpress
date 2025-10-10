import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface EmploymentInfoStepProps {
  form: UseFormReturn<any>;
}

export function EmploymentInfoStep({ form }: EmploymentInfoStepProps) {
  const employmentType = form.watch('employmentType');
  const showEmploymentDetails = ['empleado', 'independiente', 'empresario'].includes(employmentType);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          <Briefcase className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold">Información Laboral</h3>
      </div>

      <FormField
        control={form.control}
        name="employmentType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Empleo *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="empleado">Empleado</SelectItem>
                <SelectItem value="independiente">Independiente</SelectItem>
                <SelectItem value="empresario">Empresario</SelectItem>
                <SelectItem value="jubilado">Jubilado</SelectItem>
                <SelectItem value="estudiante">Estudiante</SelectItem>
                <SelectItem value="desempleado">Desempleado</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {showEmploymentDetails && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="employerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Empleador/Negocio</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Empresa ABC S.A.C." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo/Puesto</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Analista Senior" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="yearsEmployed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Años de Antigüedad</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min="0" placeholder="2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monthsEmployed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meses Adicionales</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min="0" max="11" placeholder="6" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contractType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Contrato</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="indefinido">Indefinido</SelectItem>
                      <SelectItem value="temporal">Temporal</SelectItem>
                      <SelectItem value="independiente">Independiente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="workPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono del Trabajo (Opcional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="+51 1 555 0000" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  );
}
