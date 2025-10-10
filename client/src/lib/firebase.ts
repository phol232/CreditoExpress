import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// IMPORTANTE: Reemplaza esta configuración con la real de Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCWNjLtw13CW-FmFa5nCMqtfrbi6sEI6KE",
  authDomain: "microfinance-3753e.firebaseapp.com",
  projectId: "microfinance-3753e",
  storageBucket: "microfinance-3753e.firebasestorage.app",
  messagingSenderId: "862824702457",
  appId: "1:862824702457:web:e67f36bbe2a1fe2d005d28"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth
export const auth = getAuth(app);

// Configurar Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Inicializar Firestore
export const db = getFirestore(app);

export default app;
