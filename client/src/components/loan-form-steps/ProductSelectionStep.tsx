import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, TrendingUp, Calendar, DollarSign, CheckCircle2, Loader2 } from 'lucide-react';

interface Product {
  id: string;
  code: string;
  name: string;
  interestType: string;
  rateNominal: number;
  termMin: number;
  termMax: number;
  amountMin: number;
  amountMax: number;
}

interface ProductSelectionStepProps {
  form: UseFormReturn<any>;
}

const productColors: Record<string, string> = {
  CRED_IND: '#2563EB',
  CRED_GRUP: '#16A34A',
  MIC_PROD: '#EA580C',
  CRED_RESP: '#9333EA',
  MICROEMP: '#0D9488',
  CRED_VERDE: '#65A30D',
};

export function ProductSelectionStep({ form }: ProductSelectionStepProps) {
  const { microfinancieraId } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedProductId = form.watch('productId');

  useEffect(() => {
    loadProducts();
  }, [microfinancieraId]);

  async function loadProducts() {
    if (!microfinancieraId) {
      setError('No se encontró la microfinanciera');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const productsRef = collection(db, `microfinancieras/${microfinancieraId}/products`);
      const snapshot = await getDocs(productsRef);

      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      setProducts(productsData);
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  }

  const selectProduct = (product: Product) => {
    form.setValue('productId', product.id);
    form.setValue('productCode', product.code);
    form.setValue('productName', product.name);
    form.setValue('productRateNominal', product.rateNominal);
    form.setValue('productInterestType', product.interestType);
    form.setValue('productTermMin', product.termMin);
    form.setValue('productTermMax', product.termMax);
    form.setValue('productAmountMin', product.amountMin);
    form.setValue('productAmountMax', product.amountMax);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex p-4 rounded-full bg-red-100 text-red-600 mb-4">
          <CreditCard className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Error al cargar productos</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Selecciona el tipo de crédito</h3>
        <p className="text-muted-foreground">
          Elige el producto que mejor se adapte a tus necesidades
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const isSelected = selectedProductId === product.id;
          const color = productColors[product.code] || '#6B7280';

          return (
            <Card
              key={product.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-offset-2' : ''
              }`}
              style={{
                borderColor: isSelected ? color : undefined,
                ...(isSelected && { '--tw-ring-color': color } as any),
              }}
              onClick={() => selectProduct(product)}
            >
              <CardContent className="p-6">
                {/* Header con color */}
                <div
                  className="flex items-center justify-between mb-4 pb-4 border-b-2"
                  style={{ borderColor: color }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <CreditCard
                        className="h-5 w-5"
                        style={{ color }}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{product.name}</h4>
                      <p className="text-xs text-muted-foreground">{product.code}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2
                      className="h-6 w-6"
                      style={{ color }}
                    />
                  )}
                </div>

                {/* Tasa de interés */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Tasa de interés</span>
                  </div>
                  <p className="text-2xl font-bold" style={{ color }}>
                    {product.rateNominal}%
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {product.interestType === 'flat' ? 'Tasa plana' : 'Tasa efectiva'}
                  </p>
                </div>

                {/* Monto */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Rango de monto</span>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatCurrency(product.amountMin)} - {formatCurrency(product.amountMax)}
                  </p>
                </div>

                {/* Plazo */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Plazo</span>
                  </div>
                  <p className="text-sm font-semibold">
                    {product.termMin} - {product.termMax} meses
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedProductId && (
        <div className="text-center text-sm text-muted-foreground">
          ✓ Producto seleccionado. Continúa al siguiente paso.
        </div>
      )}
    </div>
  );
}
