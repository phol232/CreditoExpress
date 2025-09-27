import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ApplicationModal from '../ApplicationModal';

export default function ApplicationModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-8 bg-background">
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal de Solicitud
      </Button>
      
      <ApplicationModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}