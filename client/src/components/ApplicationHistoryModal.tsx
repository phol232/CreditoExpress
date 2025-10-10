import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { loanApplicationService, type LoanApplication } from '@/services/loanApplicationService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ApplicationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const statusConfig = {
  pending: {
    label: 'Pendiente',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300'
  },
  in_review: {
    label: 'En Revisión',
    icon: AlertCircle,
    color: 'bg-blue-100 text-blue-700 border-blue-300'
  },
  approved: {
    label: 'Aprobada',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-700 border-green-300'
  },
  rejected: {
    label: 'Rechazada',
    icon: XCircle,
    color: 'bg-red-100 text-red-700 border-red-300'
  }
};

const purposeLabels: Record<string, string> = {
  personal: 'Gastos Personales',
  business: 'Negocio',
  education: 'Educación',
  home: 'Mejoras del Hogar',
  medical: 'Gastos Médicos',
  debt: 'Consolidación de Deudas'
};

export function ApplicationHistoryModal({ isOpen, onClose }: ApplicationHistoryModalProps) {
  const { user, microfinancieraId } = useAuth();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);

  useEffect(() => {
    if (isOpen && user && microfinancieraId) {
      loadApplications();
    }
  }, [isOpen, user, microfinancieraId]);

  const loadApplications = async () => {
    if (!user || !microfinancieraId) return;

    setIsLoading(true);
    try {
      const apps = await loanApplicationService.getUserApplications(user.uid, microfinancieraId);
      setApplications(apps);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "d 'de' MMMM, yyyy", { locale: es });
  };

  const handleViewDetails = (app: LoanApplication) => {
    setSelectedApp(app);
  };

  const handleCloseDetails = () => {
    setSelectedApp(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Mis Solicitudes
          </DialogTitle>
          <DialogDescription>
            Historial completo de tus solicitudes de crédito
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes solicitudes</h3>
            <p className="text-muted-foreground">
              Aún no has enviado ninguna solicitud de crédito
            </p>
          </div>
        ) : selectedApp ? (
          <div className="space-y-6">
            <button
              onClick={handleCloseDetails}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              ← Volver a la lista
            </button>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl">
                      {formatCurrency(selectedApp.financialInfo.loanAmount)}
                    </CardTitle>
                    <CardDescription>
                      {purposeLabels[selectedApp.financialInfo.loanPurpose] || selectedApp.financialInfo.loanPurpose}
                    </CardDescription>
                  </div>
                  <Badge className={statusConfig[selectedApp.status].color}>
                    {statusConfig[selectedApp.status].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Información Personal */}
                <div>
                  <h3 className="font-semibold mb-3">Información Personal</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Nombre completo</p>
                      <p className="font-medium">{selectedApp.personalInfo.firstName} {selectedApp.personalInfo.lastName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Documento</p>
                      <p className="font-medium">{selectedApp.personalInfo.documentType}: {selectedApp.personalInfo.documentNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fecha de nacimiento</p>
                      <p className="font-medium">{selectedApp.personalInfo.birthDate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Estado civil</p>
                      <p className="font-medium capitalize">{selectedApp.personalInfo.maritalStatus}</p>
                    </div>
                  </div>
                </div>

                {/* Información de Contacto */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">Información de Contacto</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedApp.contactInfo.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Teléfono</p>
                      <p className="font-medium">{selectedApp.contactInfo.mobilePhone}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Dirección</p>
                      <p className="font-medium">{selectedApp.contactInfo.address}, {selectedApp.contactInfo.district}, {selectedApp.contactInfo.province}</p>
                    </div>
                  </div>
                </div>

                {/* Información Laboral */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">Información Laboral</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tipo de empleo</p>
                      <p className="font-medium capitalize">{selectedApp.employmentInfo.employmentType}</p>
                    </div>
                    {selectedApp.employmentInfo.employerName && (
                      <div>
                        <p className="text-muted-foreground">Empleador</p>
                        <p className="font-medium">{selectedApp.employmentInfo.employerName}</p>
                      </div>
                    )}
                    {selectedApp.employmentInfo.position && (
                      <div>
                        <p className="text-muted-foreground">Cargo</p>
                        <p className="font-medium">{selectedApp.employmentInfo.position}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información Financiera */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">Información Financiera</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Ingresos mensuales</p>
                      <p className="font-medium">{formatCurrency(selectedApp.financialInfo.monthlyIncome)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Monto solicitado</p>
                      <p className="font-medium">{formatCurrency(selectedApp.financialInfo.loanAmount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Plazo</p>
                      <p className="font-medium">{selectedApp.financialInfo.loanTermMonths} meses</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Propósito</p>
                      <p className="font-medium">{purposeLabels[selectedApp.financialInfo.loanPurpose] || selectedApp.financialInfo.loanPurpose}</p>
                    </div>
                  </div>
                </div>

                {/* Información Adicional */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">Información Adicional</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Historial crediticio</p>
                      <p className="font-medium">{selectedApp.additionalInfo.hasCreditHistory ? 'Sí' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cuenta bancaria</p>
                      <p className="font-medium">{selectedApp.additionalInfo.hasBankAccount ? 'Sí' : 'No'}</p>
                    </div>
                    {selectedApp.additionalInfo.bankName && (
                      <div>
                        <p className="text-muted-foreground">Banco</p>
                        <p className="font-medium">{selectedApp.additionalInfo.bankName}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Garantía</p>
                      <p className="font-medium">{selectedApp.additionalInfo.hasGuarantee ? 'Sí' : 'No'}</p>
                    </div>
                  </div>
                  {selectedApp.additionalInfo.additionalComments && (
                    <div className="mt-4">
                      <p className="text-muted-foreground">Comentarios</p>
                      <p className="font-medium">{selectedApp.additionalInfo.additionalComments}</p>
                    </div>
                  )}
                </div>

                {/* Fecha de solicitud */}
                <div className="pt-4 border-t text-sm text-muted-foreground">
                  Solicitud enviada el {formatDate(selectedApp.createdAt)}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const StatusIcon = statusConfig[app.status].icon;

              return (
                <Card key={app.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">
                          {formatCurrency(app.financialInfo.loanAmount)}
                        </CardTitle>
                        <CardDescription>
                          {purposeLabels[app.financialInfo.loanPurpose] || app.financialInfo.loanPurpose}
                        </CardDescription>
                      </div>
                      <Badge className={statusConfig[app.status].color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[app.status].label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-muted-foreground">Fecha de solicitud</p>
                        <p className="font-medium">{formatDate(app.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ingresos mensuales</p>
                        <p className="font-medium">{formatCurrency(app.financialInfo.monthlyIncome)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Plazo</p>
                        <p className="font-medium">{app.financialInfo.loanTermMonths} meses</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tipo de empleo</p>
                        <p className="font-medium capitalize">{app.employmentInfo.employmentType}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDetails(app)}
                      className="w-full mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Ver detalles completos
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
