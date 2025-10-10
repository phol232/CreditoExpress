/**
 * Script para crear una microfinanciera en Firestore
 * 
 * Uso:
 * 1. Importar este script en tu aplicación
 * 2. Llamar a createMicrofinanciera() con los datos necesarios
 * 3. Opcionalmente, crear roles por defecto
 */

import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../client/src/lib/firebase';

interface CreateMicrofinancieraData {
  id: string;
  name: string;
  legalName: string;
  ruc?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
}

/**
 * Crea una nueva microfinanciera en Firestore
 */
export async function createMicrofinanciera(data: CreateMicrofinancieraData) {
  try {
    const mfRef = doc(db, 'microfinancieras', data.id);
    
    await setDoc(mfRef, {
      name: data.name,
      legalName: data.legalName,
      ruc: data.ruc || null,
      address: data.address || null,
      phone: data.phone || null,
      email: data.email || null,
      website: data.website || null,
      logoUrl: data.logoUrl || null,
      isActive: true,
      createdAt: serverTimestamp(),
      settings: {
        maxLoanAmount: 50000,
        minLoanAmount: 1000,
        maxTermMonths: 36,
        minTermMonths: 6,
        operatingHours: '06:00-22:00',
      },
    });

    console.log(`✅ Microfinanciera creada: ${data.name} (${data.id})`);
    
    // Crear roles por defecto
    await createDefaultRoles(data.id);
    
    return data.id;
  } catch (error) {
    console.error('❌ Error creando microfinanciera:', error);
    throw error;
  }
}

/**
 * Crea los roles por defecto para una microfinanciera
 */
async function createDefaultRoles(microfinancieraId: string) {
  const roles = [
    {
      id: 'admin',
      name: 'Administrador',
      description: 'Acceso completo al sistema',
      permissions: ['*'],
    },
    {
      id: 'analyst',
      name: 'Analista',
      description: 'Puede revisar y aprobar solicitudes',
      permissions: ['loans.read', 'loans.update', 'customers.read'],
    },
    {
      id: 'agent',
      name: 'Agente',
      description: 'Puede crear y gestionar solicitudes',
      permissions: ['loans.create', 'loans.read', 'customers.create', 'customers.read'],
    },
    {
      id: 'customer',
      name: 'Cliente',
      description: 'Usuario cliente que solicita créditos',
      permissions: ['loans.create', 'loans.read.own'],
    },
  ];

  for (const role of roles) {
    const roleRef = doc(
      db,
      'microfinancieras',
      microfinancieraId,
      'roles',
      role.id
    );
    
    await setDoc(roleRef, {
      ...role,
      isActive: true,
      createdAt: serverTimestamp(),
    });
    
    console.log(`  ✅ Rol creado: ${role.name}`);
  }
}

/**
 * Ejemplo de uso
 */
export async function createExampleMicrofinanciera() {
  await createMicrofinanciera({
    id: 'credito-express-001',
    name: 'Crédito Express',
    legalName: 'Crédito Express S.A.C.',
    ruc: '20123456789',
    address: 'Av. Principal 123, Lima',
    phone: '+51 1 234 5678',
    email: 'contacto@creditoexpress.com',
    website: 'https://creditoexpress.com',
  });
}

// Para ejecutar desde la consola del navegador:
// import { createExampleMicrofinanciera } from './scripts/createMicrofinanciera';
// createExampleMicrofinanciera();
