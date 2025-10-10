import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  FieldValue
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dni?: string | null;
  photoUrl?: string | null;
  phone?: string | null;
  microfinancieraId: string;
  roles: string[];
  status: 'active' | 'inactive' | 'pending';
  emailVerified?: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface AuthUser {
  userId: string;
  mfId: string;
  email: string;
  displayName: string;
  photoUrl?: string | null;
  linkedProviders: string[];
  roles: string[];
  primaryRoleId: string;
  status: 'active' | 'inactive' | 'pending';
  emailVerified?: boolean;
  lastLoginAt: any;
  createdAt: any;
  phone?: string | null;
  dni?: string | null;
  firstName?: string;
  lastName?: string;
}

export interface Microfinanciera {
  id: string;
  name: string;
  legalName: string;
  ruc?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: any;
  updatedAt?: any;
  settings?: Record<string, any>;
}

class AuthService {
  // ID de microfinanciera por defecto - debe configurarse según el contexto
  private defaultMicrofinancieraId: string | null = null;

  // Helper para limpiar undefined de objetos (Firestore no acepta undefined)
  private cleanUndefined<T extends Record<string, any>>(obj: T): T {
    const cleaned = { ...obj };
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === undefined) {
        delete cleaned[key];
      }
    });
    return cleaned;
  }

  // Establecer la microfinanciera actual
  setMicrofinanciera(microfinancieraId: string) {
    this.defaultMicrofinancieraId = microfinancieraId;
    localStorage.setItem('selectedMicrofinancieraId', microfinancieraId);
  }

  // Obtener la microfinanciera actual
  getMicrofinancieraId(): string {
    if (this.defaultMicrofinancieraId) {
      return this.defaultMicrofinancieraId;
    }
    const stored = localStorage.getItem('selectedMicrofinancieraId');
    if (stored) {
      this.defaultMicrofinancieraId = stored;
      return stored;
    }
    throw new Error('No se ha seleccionado una microfinanciera');
  }

  // Obtener todas las microfinancieras activas
  async getActiveMicrofinancieras(): Promise<Microfinanciera[]> {
    try {
      const microfinancierasRef = collection(db, 'microfinancieras');
      const q = query(microfinancierasRef, where('isActive', '==', true));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Microfinanciera));
    } catch (error) {
      console.error('Error getting microfinancieras:', error);
      throw error;
    }
  }

  // Registrar usuario manualmente
  async registerWithEmail(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dni: string;
    phone: string;
    microfinancieraId?: string;
    roles?: string[];
  }) {
    try {
      const microfinancieraId = data.microfinancieraId || this.getMicrofinancieraId();
      const roles = data.roles || ['analyst'];

      // Verificar que la microfinanciera existe y está activa
      const mfDoc = await getDoc(doc(db, 'microfinancieras', microfinancieraId));
      if (!mfDoc.exists() || !mfDoc.data()?.isActive) {
        throw new Error('La microfinanciera seleccionada no está disponible');
      }

      // Verificar si el email ya existe en esta microfinanciera
      const emailExists = await this.checkEmailExists(data.email, microfinancieraId);
      if (emailExists) {
        throw new Error('Este email ya está registrado en esta microfinanciera');
      }

      // Verificar si el DNI ya existe en esta microfinanciera
      if (data.dni) {
        const dniExists = await this.checkDniExists(data.dni, microfinancieraId);
        if (dniExists) {
          throw new Error('Este DNI ya está registrado en esta microfinanciera');
        }
      }

      // 1. Intentar crear usuario en Firebase Auth
      let userCredential;
      let user;
      let isNewUser = true;

      try {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );
        user = userCredential.user;
      } catch (authError: any) {
        // Si el email ya existe en Firebase Auth, intentar iniciar sesión
        if (authError.code === 'auth/email-already-in-use') {
          // El usuario ya existe en Firebase Auth, pero podría no estar en esta microfinanciera
          // Intentar iniciar sesión para obtener el usuario
          try {
            userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
            user = userCredential.user;
            isNewUser = false;

            // Verificar si ya está en esta microfinanciera
            const usersRef = collection(db, 'microfinancieras', microfinancieraId, 'users');
            const userDocRef = doc(usersRef, user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              throw new Error('Este email ya está registrado en esta microfinanciera. Por favor inicia sesión.');
            }

            // El usuario existe en Firebase Auth pero no en esta microfinanciera
            // Continuar con el registro en esta microfinanciera
          } catch (signInError: any) {
            if (signInError.code === 'auth/wrong-password') {
              throw new Error('Este email ya está registrado con otra contraseña. Por favor inicia sesión o recupera tu contraseña.');
            }
            throw signInError;
          }
        } else {
          throw authError;
        }
      }

      if (!user) {
        throw new Error('No se pudo crear o autenticar el usuario');
      }

      const displayName = `${data.firstName} ${data.lastName}`;
      const timestamp = serverTimestamp();

      // 2. Crear documento en microfinancieras/{mfId}/users/{userId}
      const userData: any = {
        userId: user.uid,
        mfId: microfinancieraId,
        email: data.email,
        displayName,
        photoUrl: user.photoURL || null,
        linkedProviders: ['password'],
        roles,
        primaryRoleId: roles[0],
        status: 'active',
        createdAt: timestamp,
        lastLoginAt: timestamp,
        phone: data.phone || null,
        dni: data.dni || null,
        firstName: data.firstName,
        lastName: data.lastName,
      };

      const usersRef = collection(db, 'microfinancieras', microfinancieraId, 'users');
      console.log('📝 Guardando usuario en Firestore:', {
        path: `microfinancieras/${microfinancieraId}/users/${user.uid}`,
        data: this.cleanUndefined(userData)
      });

      await setDoc(doc(usersRef, user.uid), this.cleanUndefined(userData));
      console.log('✅ Usuario guardado en Firestore');

      // 3. Si el rol incluye 'customer', crear en la colección customers
      if (roles.includes('customer')) {
        const searchKeys = [
          data.firstName.toLowerCase(),
          data.lastName.toLowerCase(),
          displayName.toLowerCase(),
          data.email.toLowerCase(),
          data.phone,
          data.dni,
        ].filter(Boolean);

        const customerData: any = {
          mfId: microfinancieraId,
          userId: user.uid,
          personType: 'natural',
          docType: 'dni',
          docNumber: data.dni || null,
          firstName: data.firstName,
          lastName: data.lastName,
          fullName: displayName,
          phone: data.phone || null,
          email: data.email,
          searchKeys,
          isActive: true,
          createdAt: timestamp,
          createdBy: user.uid,
          primaryRoleId: roles[0],
        };

        const customersRef = collection(db, 'microfinancieras', microfinancieraId, 'customers');
        console.log('📝 Guardando customer en Firestore:', {
          path: `microfinancieras/${microfinancieraId}/customers/${user.uid}`,
          data: this.cleanUndefined(customerData)
        });

        await setDoc(doc(customersRef, user.uid), this.cleanUndefined(customerData));
        console.log('✅ Customer guardado en Firestore');
      }

      // 4. Si tiene roles de staff (no customer), crear en workers
      const staffRoles = roles.filter(r => r !== 'customer');
      if (staffRoles.length > 0) {
        const workerData: any = {
          mfId: microfinancieraId,
          userId: user.uid,
          displayName,
          roleIds: staffRoles,
          isActive: true,
          createdAt: timestamp,
          phone: data.phone || null,
          dni: data.dni || null,
          email: data.email,
        };

        const workersRef = collection(db, 'microfinancieras', microfinancieraId, 'workers');
        await setDoc(doc(workersRef, user.uid), this.cleanUndefined(workerData));
      }

      // El displayName se maneja en Firestore, no es necesario actualizar en Auth

      const profileData: UserProfile = {
        uid: user.uid,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: displayName,
        dni: data.dni,
        phone: data.phone,
        microfinancieraId,
        roles,
        status: 'active',
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      console.log('🎉 Registro completado exitosamente');
      return { user, profile: profileData };
    } catch (error) {
      console.error('❌ Error registering user:', error);
      throw error;
    }
  }

  // Login con email y contraseña
  async loginWithEmail(email: string, password: string, microfinancieraId?: string) {
    try {
      const mfId = microfinancieraId || this.getMicrofinancieraId();

      // 1. Autenticar con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Verificar que el usuario pertenece a esta microfinanciera
      const usersRef = collection(db, 'microfinancieras', mfId, 'users');
      const userDocRef = doc(usersRef, user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Buscar por userId en caso de que el documento tenga otro ID
        const q = query(usersRef, where('userId', '==', user.uid));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          await auth.signOut();
          throw new Error('Usuario no autorizado para esta microfinanciera');
        }

        const membershipDoc = snapshot.docs[0];
        const membershipData = membershipDoc.data() as AuthUser;

        if (membershipData.status !== 'active') {
          await auth.signOut();
          throw new Error('Usuario desactivado. Contacte al administrador');
        }

        // Actualizar último login
        await setDoc(membershipDoc.ref, {
          lastLoginAt: serverTimestamp()
        }, { merge: true });

        const profile: UserProfile = {
          uid: user.uid,
          email: membershipData.email,
          firstName: membershipData.firstName || '',
          lastName: membershipData.lastName || '',
          fullName: membershipData.displayName,
          dni: membershipData.dni,
          phone: membershipData.phone,
          photoUrl: membershipData.photoUrl,
          microfinancieraId: mfId,
          roles: membershipData.roles,
          status: membershipData.status,
          createdAt: membershipData.createdAt,
          updatedAt: serverTimestamp(),
        };

        return { user, profile };
      }

      const userData = userDoc.data() as AuthUser;

      if (userData.status !== 'active') {
        await auth.signOut();
        throw new Error('Usuario desactivado. Contacte al administrador');
      }

      // 3. Actualizar último login
      await setDoc(userDocRef, {
        lastLoginAt: serverTimestamp()
      }, { merge: true });

      // 4. Construir perfil del usuario
      const profile: UserProfile = {
        uid: user.uid,
        email: userData.email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        fullName: userData.displayName,
        dni: userData.dni,
        phone: userData.phone,
        photoUrl: userData.photoUrl,
        microfinancieraId: mfId,
        roles: userData.roles,
        status: userData.status,
        createdAt: userData.createdAt,
        updatedAt: serverTimestamp(),
      };

      return { user, profile };
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  // Login con Google
  async loginWithGoogle(microfinancieraId?: string, roles: string[] = ['analyst']) {
    try {
      const mfId = microfinancieraId || this.getMicrofinancieraId();

      // Verificar que la microfinanciera existe y está activa
      const mfDoc = await getDoc(doc(db, 'microfinancieras', mfId));
      if (!mfDoc.exists() || !mfDoc.data()?.isActive) {
        throw new Error('La microfinanciera seleccionada no está disponible');
      }

      // 1. Autenticar con Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const usersRef = collection(db, 'microfinancieras', mfId, 'users');
      const userDocRef = doc(usersRef, user.uid);
      const userDoc = await getDoc(userDocRef);

      const names = user.displayName?.split(' ') || ['', ''];
      const firstName = names[0] || '';
      const lastName = names.slice(1).join(' ') || '';
      const displayName = user.displayName || `${firstName} ${lastName}`;
      const timestamp = serverTimestamp();

      let profile: UserProfile;

      if (!userDoc.exists()) {
        // Usuario nuevo - crear en la estructura multitenant
        const userData: any = {
          userId: user.uid,
          mfId,
          email: user.email!,
          displayName,
          photoUrl: user.photoURL || null,
          linkedProviders: ['google'],
          roles,
          primaryRoleId: roles[0],
          status: 'active',
          createdAt: timestamp,
          lastLoginAt: timestamp,
          phone: user.phoneNumber || null,
          firstName,
          lastName,
        };

        console.log('📝 Guardando usuario Google en Firestore:', {
          path: `microfinancieras/${mfId}/users/${user.uid}`,
          roles,
          data: this.cleanUndefined(userData)
        });

        await setDoc(userDocRef, this.cleanUndefined(userData));
        console.log('✅ Usuario Google guardado en Firestore');

        // Si incluye rol customer, crear en customers
        if (roles.includes('customer')) {
          const searchKeys = [
            firstName.toLowerCase(),
            lastName.toLowerCase(),
            displayName.toLowerCase(),
            user.email!.toLowerCase(),
          ].filter(Boolean);

          const customerData: any = {
            mfId,
            userId: user.uid,
            personType: 'natural',
            docType: 'dni',
            firstName,
            lastName,
            fullName: displayName,
            email: user.email!,
            searchKeys,
            isActive: true,
            createdAt: timestamp,
            createdBy: user.uid,
            primaryRoleId: roles[0],
          };

          const customersRef = collection(db, 'microfinancieras', mfId, 'customers');
          console.log('📝 Guardando customer Google en Firestore:', {
            path: `microfinancieras/${mfId}/customers/${user.uid}`,
            data: this.cleanUndefined(customerData)
          });

          await setDoc(doc(customersRef, user.uid), this.cleanUndefined(customerData));
          console.log('✅ Customer Google guardado en Firestore');
        }

        // Si tiene roles de staff, crear en workers
        const staffRoles = roles.filter(r => r !== 'customer');
        if (staffRoles.length > 0) {
          const workerData: any = {
            mfId,
            userId: user.uid,
            displayName,
            roleIds: staffRoles,
            isActive: true,
            createdAt: timestamp,
            email: user.email!,
          };

          const workersRef = collection(db, 'microfinancieras', mfId, 'workers');
          await setDoc(doc(workersRef, user.uid), this.cleanUndefined(workerData));
        }

        profile = {
          uid: user.uid,
          email: user.email!,
          firstName,
          lastName,
          fullName: displayName,
          photoUrl: user.photoURL || null,
          microfinancieraId: mfId,
          roles,
          status: 'active',
          createdAt: timestamp,
          updatedAt: timestamp,
        };
      } else {
        // Usuario existente - actualizar
        const userData = userDoc.data() as AuthUser;

        if (userData.status !== 'active') {
          await auth.signOut();
          throw new Error('Usuario desactivado. Contacte al administrador');
        }

        // Actualizar providers y último login
        const existingProviders = userData.linkedProviders || [];
        if (!existingProviders.includes('google')) {
          existingProviders.push('google');
        }

        await setDoc(userDocRef, {
          linkedProviders: existingProviders,
          lastLoginAt: timestamp,
          photoUrl: user.photoURL || userData.photoUrl,
          updatedAt: timestamp,
        }, { merge: true });

        profile = {
          uid: user.uid,
          email: userData.email,
          firstName: userData.firstName || firstName,
          lastName: userData.lastName || lastName,
          fullName: userData.displayName,
          dni: userData.dni,
          phone: userData.phone,
          photoUrl: user.photoURL || userData.photoUrl,
          microfinancieraId: mfId,
          roles: userData.roles,
          status: userData.status,
          createdAt: userData.createdAt,
          updatedAt: timestamp,
        };
      }

      return { user, profile };
    } catch (error) {
      console.error('Error with Google login:', error);
      throw error;
    }
  }

  // Cerrar sesión
  async signOut() {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Obtener perfil de usuario actual
  async getCurrentUserProfile(uid: string, microfinancieraId?: string): Promise<UserProfile | null> {
    try {
      const mfId = microfinancieraId || this.getMicrofinancieraId();
      const usersRef = collection(db, 'microfinancieras', mfId, 'users');
      const userDocRef = doc(usersRef, uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Buscar por userId
        const q = query(usersRef, where('userId', '==', uid));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          return null;
        }

        const userData = snapshot.docs[0].data() as AuthUser;
        return {
          uid,
          email: userData.email,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          fullName: userData.displayName,
          dni: userData.dni,
          phone: userData.phone,
          photoUrl: userData.photoUrl,
          microfinancieraId: mfId,
          roles: userData.roles,
          status: userData.status,
          createdAt: userData.createdAt,
          updatedAt: userData.lastLoginAt,
        };
      }

      const userData = userDoc.data() as AuthUser;
      return {
        uid,
        email: userData.email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        fullName: userData.displayName,
        dni: userData.dni,
        phone: userData.phone,
        photoUrl: userData.photoUrl,
        microfinancieraId: mfId,
        roles: userData.roles,
        status: userData.status,
        createdAt: userData.createdAt,
        updatedAt: userData.lastLoginAt,
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Verificar si un email ya existe en una microfinanciera
  async checkEmailExists(email: string, microfinancieraId?: string): Promise<boolean> {
    try {
      const mfId = microfinancieraId || this.getMicrofinancieraId();
      const usersRef = collection(db, 'microfinancieras', mfId, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  }

  // Verificar si un DNI ya existe en una microfinanciera
  async checkDniExists(dni: string, microfinancieraId?: string): Promise<boolean> {
    try {
      const mfId = microfinancieraId || this.getMicrofinancieraId();
      const usersRef = collection(db, 'microfinancieras', mfId, 'users');
      const q = query(usersRef, where('dni', '==', dni));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking DNI:', error);
      return false;
    }
  }

  // Actualizar perfil de usuario
  async updateUserProfile(uid: string, updates: Partial<UserProfile>, microfinancieraId?: string): Promise<void> {
    try {
      const mfId = microfinancieraId || this.getMicrofinancieraId();
      const usersRef = collection(db, 'microfinancieras', mfId, 'users');
      const userRef = doc(usersRef, uid);

      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      if (updates.firstName) updateData.firstName = updates.firstName;
      if (updates.lastName) updateData.lastName = updates.lastName;
      if (updates.fullName) updateData.displayName = updates.fullName;
      if (updates.phone) updateData.phone = updates.phone;
      if (updates.dni) updateData.dni = updates.dni;
      if (updates.photoUrl) updateData.photoUrl = updates.photoUrl;

      await setDoc(userRef, updateData, { merge: true });

      // Si es customer, actualizar también en customers
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data() as AuthUser;
        if (userData.roles.includes('customer')) {
          const customersRef = collection(db, 'microfinancieras', mfId, 'customers');
          const customerRef = doc(customersRef, uid);

          const customerUpdate: any = {
            updatedAt: serverTimestamp(),
          };

          if (updates.firstName) customerUpdate.firstName = updates.firstName;
          if (updates.lastName) customerUpdate.lastName = updates.lastName;
          if (updates.fullName) customerUpdate.fullName = updates.fullName;
          if (updates.phone) customerUpdate.phone = updates.phone;
          if (updates.dni) {
            customerUpdate.dni = updates.dni;
            customerUpdate.docNumber = updates.dni;
          }

          await setDoc(customerRef, customerUpdate, { merge: true });
        }

        // Si tiene roles de staff, actualizar en workers
        const staffRoles = userData.roles.filter(r => r !== 'customer');
        if (staffRoles.length > 0) {
          const workersRef = collection(db, 'microfinancieras', mfId, 'workers');
          const workerRef = doc(workersRef, uid);

          const workerUpdate: any = {
            updatedAt: serverTimestamp(),
          };

          if (updates.fullName) workerUpdate.displayName = updates.fullName;
          if (updates.phone) workerUpdate.phone = updates.phone;
          if (updates.dni) workerUpdate.dni = updates.dni;

          await setDoc(workerRef, workerUpdate, { merge: true });
        }
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService;
