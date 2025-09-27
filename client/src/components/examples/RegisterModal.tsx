import { useState } from 'react';
import { Button } from '@/components/ui/button';
import RegisterModal from '../RegisterModal';

export default function RegisterModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-8 bg-background">
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal de Registro
      </Button>
      
      <RegisterModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSwitchToLogin={() => console.log('Switch to login')}
      />
    </div>
  );
}