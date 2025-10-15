import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Calendar, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';

interface Payment {
  paymentNumber: number;
  dueDate: Date;
  amount: number;
  principal: number;
  interest: number;
  balance: number;
  status: 'pending' | 'paid' | 'overdue';
}

interface Loan {
  id: string;
  amount: number;
  status: string;
  disbursedAt: Date;
  repaymentSchedule: Payment[];
  loanTermMonths: number;
  interestRate: number;
}

export default function MyLoans() {
  const { user, microfinancieraId } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLoans();
  }, [user, microfinancieraId]);

  async function loadLoans() {
    if (!user || !microfinancieraId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar préstamos desembolsados del usuario
      const loansRef = collection(db, `microfinancieras/${microfinancieraId}/loanApplications`);
      const q = query(
        loansRef,
        where('userId', '==', user.uid),
        where('status', '==', 'disbursed'),
        orderBy('disbursedAt', 'desc')
      );

      const snapshot = await getDocs(q);

      const loansData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();

          // Obtener cronograma de pagos
          const scheduleRef = collection(doc.ref, 'repaymentSchedule');
          const scheduleSnapshot = await getDocs(query(scheduleRef, orderBy('paymentNumber', 'asc')));
          
          const schedule = scheduleSnapshot.docs.map(s => {
            const scheduleData = s.data();
            return {
              paymentNumber: scheduleData.paymentNumber,
              dueDate: scheduleData.dueDate?.toDate() || new Date(),
              amount: scheduleData.amount || 0,
              principal: scheduleData.principal || 0,
              interest: scheduleData.interest || 0,
              balance: scheduleData.balance || 0,
              status: scheduleData.status || 'pending',
            } as Payment;
          });

          return {
            id: doc.id,
            amount: data.financialInfo?.loanAmount || 0,
            status: data.status,
            disbursedAt: data.disbursedAt?.toDate() || new Date(),
            repaymentSchedule: schedule,
            loanTermMonths: data.financialInfo?.loanTermMonths || 0,
            interestRate: data.interestRate || 0,
          } as Loan;
        })
      );

      setLoans(loansData);
    } catch (error: any) {
      console.error('Error loading loans:', error);
      setError('Error al cargar los préstamos. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pagado';
      case 'overdue':
        return 'Vencido';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Cargando préstamos...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Error al cargar préstamos</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={loadLoans}>Reintentar</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Mis Préstamos</h1>
            <p className="text-muted-foreground">
              Consulta el estado y cronograma de pagos de tus préstamos activos
            </p>
          </div>

          {loans.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="inline-flex p-4 rounded-full bg-muted mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No tienes préstamos activos</h3>
                <p className="text-muted-foreground mb-6">
                  Cuando tu solicitud sea aprobada y desembolsada, aparecerá aquí.
                </p>
                <Button onClick={() => window.location.href = '/'}>
                  Solicitar un Crédito
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {loans.map((loan) => (
                <Card key={loan.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <CardTitle className="text-2xl">
                          {formatCurrency(loan.amount)}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Préstamo desembolsado el {formatDate(loan.disbursedAt)}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{loan.loanTermMonths} meses</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span>{loan.interestRate}% anual</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{loan.repaymentSchedule.length} cuotas</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/30 border-b">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Cuota</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Fecha Venc.</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold">Monto</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold">Capital</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold">Interés</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold">Saldo</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {loan.repaymentSchedule.map((payment) => (
                            <tr
                              key={payment.paymentNumber}
                              className={`hover:bg-muted/20 transition-colors ${
                                payment.status === 'paid' ? 'bg-green-50/50' : 
                                payment.status === 'overdue' ? 'bg-red-50/50' : ''
                              }`}
                            >
                              <td className="px-4 py-3 text-sm font-medium">
                                {payment.paymentNumber}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {formatDate(payment.dueDate)}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-medium">
                                {formatCurrency(payment.amount)}
                              </td>
                              <td className="px-4 py-3 text-sm text-right">
                                {formatCurrency(payment.principal)}
                              </td>
                              <td className="px-4 py-3 text-sm text-right">
                                {formatCurrency(payment.interest)}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-medium">
                                {formatCurrency(payment.balance)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                                    payment.status
                                  )}`}
                                >
                                  {getStatusText(payment.status)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
