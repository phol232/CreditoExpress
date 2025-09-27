import { useState } from 'react';
import { Button } from '@/components/ui/button';
import LoginModal from '../LoginModal';

export default function LoginModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-8 bg-background">
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal de Login
      </Button>
      
      <LoginModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSwitchToRegister={() => console.log('Switch to register')}
      />
    </div>
  );
}