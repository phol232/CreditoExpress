import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Upload, MapPin, DollarSign, User, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const preApplicationSchema = z.object({
  loanAmount: z.string().min(1, 'Debes especificar el monto'),
  loanPurpose: z.string().min(1, 'Debes seleccionar el propósito'),
  monthlyIncome: z.string().min(1, 'Debes especificar tus ingresos'),
  employmentType: z.string().min(1, 'Debes seleccionar tu tipo de empleo'),
  additionalInfo: z.string().optional(),
  acceptGeolocation: z.boolean(),
  documents: z.array(z.any()).optional()
});

type PreApplicationForm = z.infer<typeof preApplicationSchema>;

export default function PreApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  
  const form = useForm<PreApplicationForm>({
    resolver: zodResolver(preApplicationSchema),
    defaultValues: {
      loanAmount: '',
      loanPurpose: '',
      monthlyIncome: '',
      employmentType: '',
      additionalInfo: '',
      acceptGeolocation: false,
      documents: []
    }
  });

  const onSubmit = async (data: PreApplicationForm) => {
    setIsSubmitting(true);
    console.log('Pre-application data:', data);
    console.log('Uploaded files:', uploadedFiles);
    // Todo: remove mock functionality - implement actual pre-application API call
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('Pre-solicitud enviada exitosamente');
    setIsSubmitting(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
    console.log('Files uploaded:', validFiles);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Location granted:', position.coords);
        setLocationPermission('granted');
      },
      (error) => {
        console.log('Location denied:', error);
        setLocationPermission('denied');
      }
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary w-fit mx-auto mb-4">
          <FileText className="h-8 w-8" />
        </div>
        <CardTitle className="text-2xl font-bold">Pre-solicitud de Crédito</CardTitle>
        <CardDescription>
          Completa la información básica para iniciar tu evaluación crediticia
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Financial Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Información Financiera
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="loanAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto del Préstamo</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            {...field} 
                            placeholder="50,000"
                            className="pl-10"
                            data-testid="input-loan-amount"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="monthlyIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ingresos Mensuales</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            {...field} 
                            placeholder="25,000"
                            className="pl-10"
                            data-testid="input-monthly-income"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="loanPurpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Propósito del Préstamo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-loan-purpose">
                            <SelectValue placeholder="Selecciona el propósito" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="personal">Gastos Personales</SelectItem>
                          <SelectItem value="business">Negocio</SelectItem>
                          <SelectItem value="education">Educación</SelectItem>
                          <SelectItem value="home">Mejoras del Hogar</SelectItem>
                          <SelectItem value="medical">Gastos Médicos</SelectItem>
                          <SelectItem value="debt">Consolidación de Deudas</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="employmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Empleo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-employment-type">
                            <SelectValue placeholder="Selecciona tu empleo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="employee">Empleado</SelectItem>
                          <SelectItem value="freelancer">Freelancer</SelectItem>
                          <SelectItem value="business-owner">Empresario</SelectItem>
                          <SelectItem value="student">Estudiante</SelectItem>
                          <SelectItem value="retired">Jubilado</SelectItem>
                          <SelectItem value="unemployed">Desempleado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Adicional
              </h3>
              
              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Información Adicional (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Cuéntanos sobre tu situación financiera, experiencia crediticia, o cualquier información relevante..."
                        className="min-h-[100px]"
                        data-testid="textarea-additional-info"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Document Upload */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Documentos de Respaldo
              </h3>
              
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  data-testid="input-file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                      <Upload className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Arrastra archivos aquí o haz clic para seleccionar</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, JPG, PNG hasta 5MB cada uno
                      </p>
                    </div>
                  </div>
                </label>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Archivos subidos:</p>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{file.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </Badge>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeFile(index)}
                        data-testid={`button-remove-file-${index}`}
                      >
                        Eliminar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Geolocation */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación (Opcional)
              </h3>
              
              <FormField
                control={form.control}
                name="acceptGeolocation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (checked) {
                            requestLocation();
                          }
                        }}
                        data-testid="checkbox-geolocation"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        Permitir acceso a mi ubicación para verificación adicional
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Esto nos ayuda a validar tu identidad y acelerar el proceso
                      </p>
                      {locationPermission === 'granted' && (
                        <Badge className="bg-green-100 text-green-700 mt-2">
                          <MapPin className="h-3 w-3 mr-1" />
                          Ubicación obtenida
                        </Badge>
                      )}
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
              data-testid="button-submit-pre-application"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Enviando pre-solicitud...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Enviar Pre-solicitud
                </div>
              )}
            </Button>
          </form>
        </Form>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Tu pre-solicitud será evaluada en un máximo de 24 horas hábiles</p>
        </div>
      </CardContent>
    </Card>
  );
}