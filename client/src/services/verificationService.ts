import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface VerificationCode {
    code: string;
    email: string;
    userId: string;
    microfinancieraId: string;
    expiresAt: Timestamp;
    verified: boolean;
    createdAt: any;
}

class VerificationService {
    // Enviar código de verificación por email usando Brevo
    async sendVerificationCode(
        email: string,
        userId?: string,
        microfinancieraId?: string
    ): Promise<{ success: boolean; message: string; expiresIn?: number }> {
        try {
            // Usar ruta relativa (mismo servidor)
            const response = await fetch('/api/auth/send-verification-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al enviar el código');
            }

            // Si se proporcionan userId y microfinancieraId, también guardar en Firestore
            if (userId && microfinancieraId) {
                const verificationRef = doc(
                    db,
                    'microfinancieras',
                    microfinancieraId,
                    'verifications',
                    userId
                );

                await setDoc(verificationRef, {
                    email,
                    userId,
                    microfinancieraId,
                    sentAt: serverTimestamp(),
                });
            }

            return {
                success: true,
                message: data.message || 'Código enviado exitosamente',
                expiresIn: 600, // 10 minutos en segundos
            };
        } catch (error) {
            console.error('Error sending verification code:', error);
            throw new Error('Error al enviar el código de verificación');
        }
    }

    // Verificar código usando el backend
    async verifyCode(
        code: string,
        email: string,
        userId?: string,
        microfinancieraId?: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            // Usar ruta relativa (mismo servidor)
            const response = await fetch('/api/auth/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, code }),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Código incorrecto',
                };
            }

            // Si se proporcionan userId y microfinancieraId, actualizar Firestore
            if (userId && microfinancieraId) {
                const verificationRef = doc(
                    db,
                    'microfinancieras',
                    microfinancieraId,
                    'verifications',
                    userId
                );

                await setDoc(
                    verificationRef,
                    {
                        verified: true,
                        verifiedAt: serverTimestamp(),
                    },
                    { merge: true }
                );

                const userRef = doc(
                    db,
                    'microfinancieras',
                    microfinancieraId,
                    'users',
                    userId
                );

                await setDoc(
                    userRef,
                    {
                        emailVerified: true,
                        emailVerifiedAt: serverTimestamp(),
                    },
                    { merge: true }
                );
            }

            return {
                success: true,
                message: data.message || 'Email verificado exitosamente',
            };
        } catch (error) {
            console.error('Error verifying code:', error);
            throw new Error('Error al verificar el código');
        }
    }

    // Verificar si el usuario ya tiene el email verificado
    async isEmailVerified(
        userId: string,
        microfinancieraId: string
    ): Promise<boolean> {
        try {
            const userRef = doc(
                db,
                'microfinancieras',
                microfinancieraId,
                'users',
                userId
            );

            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                return false;
            }

            const userData = userDoc.data();
            return userData.emailVerified === true;
        } catch (error) {
            console.error('Error checking email verification:', error);
            return false;
        }
    }
}

export const verificationService = new VerificationService();
export default verificationService;
