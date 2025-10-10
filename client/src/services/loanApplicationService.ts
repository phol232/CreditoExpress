import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

import type { CompleteLoanApplication } from '../types/loanApplication';

export interface LoanApplication extends CompleteLoanApplication {}

class LoanApplicationService {
    // Crear nueva solicitud completa
    async createApplication(
        userId: string,
        microfinancieraId: string,
        data: Omit<LoanApplication, 'id' | 'userId' | 'microfinancieraId' | 'status' | 'createdAt' | 'updatedAt'>
    ): Promise<{ success: boolean; applicationId?: string; message: string }> {
        try {
            // Crear referencia a la nueva solicitud
            const applicationsRef = collection(
                db,
                'microfinancieras',
                microfinancieraId,
                'loanApplications'
            );

            const newApplicationRef = doc(applicationsRef);

            const applicationData: LoanApplication = {
                id: newApplicationRef.id,
                userId,
                microfinancieraId,
                ...data,
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await setDoc(newApplicationRef, applicationData);

            console.log('✅ Solicitud creada:', newApplicationRef.id);

            return {
                success: true,
                applicationId: newApplicationRef.id,
                message: 'Solicitud enviada exitosamente'
            };
        } catch (error) {
            console.error('Error creating loan application:', error);
            throw new Error('Error al crear la solicitud');
        }
    }

    // Obtener solicitudes de un usuario
    async getUserApplications(
        userId: string,
        microfinancieraId: string
    ): Promise<LoanApplication[]> {
        try {
            const applicationsRef = collection(
                db,
                'microfinancieras',
                microfinancieraId,
                'loanApplications'
            );

            // Solo filtrar por userId, ordenar en el cliente
            const q = query(
                applicationsRef,
                where('userId', '==', userId)
            );

            const querySnapshot = await getDocs(q);

            const applications: LoanApplication[] = [];
            querySnapshot.forEach((doc) => {
                applications.push(doc.data() as LoanApplication);
            });

            // Ordenar por fecha en el cliente (más reciente primero)
            applications.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
                return dateB.getTime() - dateA.getTime();
            });

            return applications;
        } catch (error) {
            console.error('Error getting user applications:', error);
            return [];
        }
    }

    // Obtener una solicitud específica
    async getApplication(
        applicationId: string,
        microfinancieraId: string
    ): Promise<LoanApplication | null> {
        try {
            const applicationRef = doc(
                db,
                'microfinancieras',
                microfinancieraId,
                'loanApplications',
                applicationId
            );

            const applicationDoc = await getDoc(applicationRef);

            if (!applicationDoc.exists()) {
                return null;
            }

            return applicationDoc.data() as LoanApplication;
        } catch (error) {
            console.error('Error getting application:', error);
            return null;
        }
    }

    // Actualizar estado de solicitud (solo para admin)
    async updateApplicationStatus(
        applicationId: string,
        microfinancieraId: string,
        status: 'pending' | 'approved' | 'rejected' | 'in_review'
    ): Promise<{ success: boolean; message: string }> {
        try {
            const applicationRef = doc(
                db,
                'microfinancieras',
                microfinancieraId,
                'loanApplications',
                applicationId
            );

            await setDoc(
                applicationRef,
                {
                    status,
                    updatedAt: serverTimestamp()
                },
                { merge: true }
            );

            return {
                success: true,
                message: 'Estado actualizado exitosamente'
            };
        } catch (error) {
            console.error('Error updating application status:', error);
            throw new Error('Error al actualizar el estado');
        }
    }
}

export const loanApplicationService = new LoanApplicationService();
export default loanApplicationService;
