import VerificationForm from '../VerificationForm';

export default function VerificationFormExample() {
  return (
    <div className="p-8 bg-background space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Verificación por Teléfono</h3>
        <VerificationForm contactType="phone" contactValue="+52 55 1234 5678" />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Verificación por Email</h3>
        <VerificationForm contactType="email" contactValue="juan@ejemplo.com" />
      </div>
    </div>
  );
}