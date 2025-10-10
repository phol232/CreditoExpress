import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authService, UserProfile } from '@/services/authService';

// Schema de validación para el perfil
const profileSchema = z.object({
  firstName: z.string()
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(50, 'Nombre debe tener máximo 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, 'Nombre solo puede contener letras y espacios'),
  lastName: z.string()
    .min(2, 'Apellido debe tener al menos 2 caracteres')
    .max(50, 'Apellido debe tener máximo 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, 'Apellido solo puede contener letras y espacios'),
  dni: z.string()
    .min(8, 'DNI debe tener al menos 8 caracteres')
    .max(12, 'DNI debe tener máximo 12 caracteres')
    .regex(/^[0-9]+[A-Z]?$/, 'DNI debe contener solo números y una letra opcional al final')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .min(9, 'Teléfono debe tener al menos 9 dígitos')
    .max(15, 'Teléfono debe tener máximo 15 dígitos')
    .optional()
    .or(z.literal('')),
  photoUrl: z.string().url('URL de imagen inválida').optional().or(z.literal(''))
});

type ProfileForm = z.infer<typeof profileSchema>;

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dni: '',
      phone: '',
      photoUrl: ''
    }
  });

  // Cargar datos del perfil cuando se abre el modal
  useEffect(() => {
    if (isOpen && user?.uid) {
      loadProfileData();
    }
  }, [isOpen, user?.uid]);

  const loadProfileData = async () => {
    if (!user?.uid) return;
    
    setIsLoadingProfile(true);
    try {
      const userProfile = await authService.getCurrentUserProfile(user.uid);
      if (userProfile) {
        setProfileData(userProfile);
        form.reset({
          firstName: userProfile.firstName || '',
          lastName: userProfile.lastName || '',
          dni: userProfile.dni || '',
          phone: userProfile.phone || '',
          photoUrl: userProfile.photoUrl || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    if (!user?.uid || !profileData) return;

    setIsSubmitting(true);
    try {
      // Verificar si el DNI ya existe (solo si se está cambiando)
      if (data.dni && data.dni !== profileData.dni) {
        const dniExists = await authService.checkDniExists(data.dni);
        if (dniExists) {
          form.setError('dni', { 
            type: 'manual', 
            message: 'Este DNI ya está registrado por otro usuario' 
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Actualizar perfil
      await authService.updateUserProfile(user.uid, {
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`,
        dni: data.dni || undefined,
        phone: data.phone || undefined,
        photoUrl: data.photoUrl || undefined
      });

      // Refrescar el perfil en el contexto
      await refreshProfile();
      
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      form.setError('root', { 
        type: 'manual', 
        message: 'Error al actualizar el perfil. Inténtalo de nuevo.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Configuración de Perfil
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Puedes modificar todos tus datos personales
          </p>
        </DialogHeader>

        {isLoadingProfile ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Información básica */}
            <div className="text-center">
              <Avatar className="h-20 w-20 mx-auto mb-4">
                <AvatarImage 
                  src={profileData?.photoUrl || ''} 
                  alt={profileData?.fullName || 'Usuario'} 
                />
                <AvatarFallback className="text-lg bg-primary/10">
                  {profileData ? 
                    getInitials(profileData.firstName, profileData.lastName) : 
                    <User className="h-8 w-8" />
                  }
                </AvatarFallback>
              </Avatar>
              
              <p className="text-sm text-muted-foreground">
                {profileData?.email}
              </p>
            </div>

            <div className="border-t pt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Error general */}
                  {form.formState.errors.root && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                      {form.formState.errors.root.message}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Nombre *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Juan"
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Apellido *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Pérez"
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="dni"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          DNI/NIE
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="12345678A"
                            className="h-10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Teléfono
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="tel"
                            placeholder="+34 600 000 000"
                            className="h-10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="photoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          URL de Foto de Perfil
                        </FormLabel>
                        <FormControl>
                          <div className="flex space-x-2">
                            <Input 
                              {...field} 
                              type="url"
                              placeholder="https://ejemplo.com/mi-foto.jpg"
                              className="h-10 flex-1"
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              className="h-10 w-10 p-0"
                            >
                              <Camera className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
                          Pega la URL de tu imagen de perfil
                        </p>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="min-w-[100px]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Guardando...
                        </>
                      ) : (
                        'Guardar Cambios'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
