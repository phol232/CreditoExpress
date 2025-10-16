import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, AlertCircle } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface FinancialInfoStepProps {
  form: UseFormReturn<any>;
}

export function FinancialInfoStep({ form }: FinancialInfoStepProps) {
  const productName = form.watch('productName');
  const productAmountMin = form.watch('productAmountMin');
  const productAmountMax = form.watch('productAmountMax');
  const productTermMin = form.watch('productTermMin');
  const productTermMax = form.watch('productTermMax');
  const loanAmount = form.watch('loanAmount');
  const loanTermMonths = form.watch('loanTermMonths');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isAmountValid = !loanAmount || (
    parseFloat(loanAmount) >= productAmountMin && 
    parseFloat(loanAmount) <= productAmountMax
  );

  const isTermValid = !loanTermMonths || (
    parseInt(loanTermMonths) >= productTermMin && 
    parseInt(loanTermMonths) <= productTermMax
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          <DollarSign className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold">Información Financiera</h3>
      </div>

      {productName && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900">
            Producto seleccionado: <span className="font-bold">{productName}</span>
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Monto: {formatCurrency(productAmountMin)} - {formatCurrency(productAmountMax)} | 
            Plazo: {productTermMin} - {productTermMax} meses
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="monthlyIncome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ingreso Mensual Principal *</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground">S/</span>
                  <Input {...field} type="number" className="pl-10" placeholder="3000" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="otherIncome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Otros Ingresos Mensuales</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground">S/</span>
                  <Input {...field} type="number" className="pl-10" placeholder="500" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="otherIncomeSource"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fuente de Otros Ingresos</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Renta, comisiones, bonos, etc." />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="monthlyExpenses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gastos Mensuales Aproximados</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground">S/</span>
                  <Input {...field} type="number" className="pl-10" placeholder="1500" />
                </div>
              </FormControl>
              <FormDescription>Servicios, vivienda, educación, etc.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currentDebts"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deudas Actuales (Monto Total)</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground">S/</span>
                  <Input {...field} type="number" className="pl-10" placeholder="5000" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="currentDebtsEntity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Entidad(es) de Deudas Actuales</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Banco XYZ, Tarjeta ABC" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="border-t pt-6 mt-6">
        <h4 className="font-medium mb-4">Detalles del Préstamo Solicitado</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="loanAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto del Préstamo *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-muted-foreground">S/</span>
                    <Input {...field} type="number" className="pl-10" placeholder="10000" />
                  </div>
                </FormControl>
                {!isAmountValid && loanAmount && (
                  <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      El monto debe estar entre {formatCurrency(productAmountMin)} y {formatCurrency(productAmountMax)}
                    </span>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="loanTermMonths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plazo Deseado *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="3">3 meses</SelectItem>
                    <SelectItem value="6">6 meses</SelectItem>
                    <SelectItem value="12">12 meses</SelectItem>
                    <SelectItem value="18">18 meses</SelectItem>
                    <SelectItem value="24">24 meses</SelectItem>
                    <SelectItem value="36">36 meses</SelectItem>
                    <SelectItem value="48">48 meses</SelectItem>
                  </SelectContent>
                </Select>
                {!isTermValid && loanTermMonths && (
                  <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      El plazo debe estar entre {productTermMin} y {productTermMax} meses
                    </span>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="loanPurpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Propósito del Préstamo *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el propósito" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="personal">Gastos Personales</SelectItem>
                  <SelectItem value="business">Capital de Trabajo/Negocio</SelectItem>
                  <SelectItem value="education">Educación</SelectItem>
                  <SelectItem value="home">Mejoras del Hogar</SelectItem>
                  <SelectItem value="medical">Gastos Médicos</SelectItem>
                  <SelectItem value="debt">Consolidación de Deudas</SelectItem>
                  <SelectItem value="vehicle">Vehículo</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
