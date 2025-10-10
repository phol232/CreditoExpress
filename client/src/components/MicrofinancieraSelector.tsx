import React, { useEffect, useState } from 'react';
import { authService, Microfinanciera } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface MicrofinancieraSelectorProps {
  onSelect?: (mfId: string) => void;
}

export function MicrofinancieraSelector({ onSelect }: MicrofinancieraSelectorProps) {
  const [microfinancieras, setMicrofinancieras] = useState<Microfinanciera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { microfinancieraId, setMicrofinanciera } = useAuth();

  useEffect(() => {
    loadMicrofinancieras();
  }, []);

  const loadMicrofinancieras = async () => {
    try {
      setLoading(true);
      const mfs = await authService.getActiveMicrofinancieras();
      setMicrofinancieras(mfs);
      
      // Si solo hay una, seleccionarla automáticamente
      if (mfs.length === 1 && !microfinancieraId) {
        handleSelect(mfs[0].id);
      }
    } catch (err) {
      console.error('Error loading microfinancieras:', err);
      setError('Error al cargar las microfinancieras');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (mfId: string) => {
    setMicrofinanciera(mfId);
    setOpen(false);
    if (onSelect) {
      onSelect(mfId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        Cargando microfinancieras...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
        {error}
        <button
          onClick={loadMicrofinancieras}
          className="ml-2 underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (microfinancieras.length === 0) {
    return (
      <div className="text-sm text-yellow-800 bg-yellow-50 p-2 rounded-md">
        No hay microfinancieras disponibles
      </div>
    );
  }

  const selectedMf = microfinancieras.find(mf => mf.id === microfinancieraId);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        Microfinanciera *
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-11"
          >
            {selectedMf ? (
              <span className="truncate">{selectedMf.name}</span>
            ) : (
              <span className="text-muted-foreground">Selecciona una microfinanciera</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar microfinanciera..." />
            <CommandEmpty>No se encontraron microfinancieras.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {microfinancieras.map((mf) => (
                <CommandItem
                  key={mf.id}
                  value={mf.name}
                  onSelect={() => handleSelect(mf.id)}
                  className="cursor-pointer"
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      microfinancieraId === mf.id ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{mf.name}</span>
                    <span className="text-xs text-muted-foreground">{mf.legalName}</span>
                    {mf.ruc && (
                      <span className="text-xs text-muted-foreground">RUC: {mf.ruc}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
