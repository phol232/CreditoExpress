import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { authService, UserProfile, AuthUser } from '../services/authService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  microfinancieraId: string | null;
  isVerified: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setMicrofinanciera: (mfId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [microfinancieraId, setMicrofinancieraIdState] = useState<string | null>(null);

  const setMicrofinanciera = (mfId: string) => {
    setMicrofinancieraIdState(mfId);
    authService.setMicrofinanciera(mfId);
  };

  const refreshProfile = async () => {
    if (user && microfinancieraId) {
      const updatedProfile = await authService.getCurrentUserProfile(user.uid, microfinancieraId);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setProfile(null);
      setMicrofinancieraIdState(null);
      localStorage.removeItem('selectedMicrofinancieraId');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    // Cargar microfinanciera guardada
    const savedMfId = localStorage.getItem('selectedMicrofinancieraId');
    if (savedMfId) {
      setMicrofinancieraIdState(savedMfId);
    }
  }, []);

  useEffect(() => {
    let profileUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);

      // Limpiar el listener anterior si existe
      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = null;
      }

      if (user) {
        // Si no hay microfinanciera seleccionada, intentar obtenerla
        let mfId = microfinancieraId;
        if (!mfId) {
          const savedMfId = localStorage.getItem('selectedMicrofinancieraId');
          if (savedMfId) {
            mfId = savedMfId;
            setMicrofinancieraIdState(savedMfId);
          } else {
            // Buscar la primera microfinanciera donde el usuario está registrado
            try {
              const microfinancierasSnapshot = await getDocs(collection(db, 'microfinancieras'));
              for (const mfDoc of microfinancierasSnapshot.docs) {
                const usersRef = collection(db, 'microfinancieras', mfDoc.id, 'users');
                const userQuery = query(usersRef, where('userId', '==', user.uid));
                const userSnapshot = await getDocs(userQuery);

                if (!userSnapshot.empty) {
                  mfId = mfDoc.id;
                  setMicrofinancieraIdState(mfId);
                  authService.setMicrofinanciera(mfId);
                  break;
                }
              }
            } catch (error) {
              console.error('Error finding user microfinanciera:', error);
            }
          }
        }

        if (mfId) {
          // Crear listener en tiempo real del perfil del usuario en la estructura multitenant
          const usersRef = collection(db, 'microfinancieras', mfId, 'users');
          const profileRef = doc(usersRef, user.uid);

          profileUnsubscribe = onSnapshot(profileRef, (doc) => {
            if (doc.exists()) {
              const userData = doc.data() as AuthUser;
              const profileData: UserProfile = {
                uid: user.uid,
                email: userData.email,
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                fullName: userData.displayName,
                dni: userData.dni,
                phone: userData.phone,
                photoUrl: userData.photoUrl,
                microfinancieraId: mfId!,
                roles: userData.roles,
                status: userData.status,
                emailVerified: userData.emailVerified || false,
                createdAt: userData.createdAt,
                updatedAt: userData.lastLoginAt,
              };
              setProfile(profileData);
            } else {
              // Buscar por userId si no existe con el uid como ID del documento
              getDocs(query(usersRef, where('userId', '==', user.uid)))
                .then(snapshot => {
                  if (!snapshot.empty) {
                    const userData = snapshot.docs[0].data() as AuthUser;
                    const profileData: UserProfile = {
                      uid: user.uid,
                      email: userData.email,
                      firstName: userData.firstName || '',
                      lastName: userData.lastName || '',
                      fullName: userData.displayName,
                      dni: userData.dni,
                      phone: userData.phone,
                      photoUrl: userData.photoUrl,
                      microfinancieraId: mfId!,
                      roles: userData.roles,
                      status: userData.status,
                      emailVerified: userData.emailVerified || false,
                      createdAt: userData.createdAt,
                      updatedAt: userData.lastLoginAt,
                    };
                    setProfile(profileData);
                  } else {
                    setProfile(null);
                  }
                })
                .catch(error => {
                  console.error('Error querying user:', error);
                  setProfile(null);
                });
            }

            setLoading(false);
          }, (error) => {
            console.error('Error listening to profile:', error);
            setProfile(null);
            setLoading(false);
          });
        } else {
          setProfile(null);
          setLoading(false);
        }
      } else {
        // Usuario no autenticado
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }
    };
  }, [microfinancieraId]);

  // Determinar si el usuario está verificado (usando emailVerified de Firestore o Firebase Auth)
  const isVerified = profile?.emailVerified === true || user?.emailVerified || false;

  const value = {
    user,
    profile,
    loading,
    microfinancieraId,
    isVerified,
    signOut,
    refreshProfile,
    setMicrofinanciera,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
