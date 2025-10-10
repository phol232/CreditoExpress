// Tipos completos para solicitud de crédito formal

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  documentType: 'DNI' | 'CE' | 'PASAPORTE';
  documentNumber: string;
  birthDate: string;
  nationality: string;
  maritalStatus: 'soltero' | 'casado' | 'divorciado' | 'viudo' | 'conviviente';
  dependents?: number;
}

export interface ContactInfo {
  address: string;
  district: string;
  province: string;
  department: string;
  mobilePhone: string;
  email: string;
  homeReference?: string;
}

export interface EmploymentInfo {
  employmentType: 'empleado' | 'independiente' | 'empresario' | 'jubilado' | 'estudiante' | 'desempleado';
  employerName?: string;
  position?: string;
  yearsEmployed?: number;
  monthsEmployed?: number;
  contractType?: 'indefinido' | 'temporal' | 'independiente';
  workPhone?: string;
}

export interface FinancialInfo {
  monthlyIncome: number;
  otherIncome?: number;
  otherIncomeSource?: string;
  monthlyExpenses?: number;
  currentDebts?: number;
  currentDebtsEntity?: string;
  loanAmount: number;
  loanTermMonths: number;
  loanPurpose: string;
}

export interface AdditionalInfo {
  hasCreditHistory: boolean;
  hasBankAccount: boolean;
  bankName?: string;
  hasGuarantee: boolean;
  guaranteeDescription?: string;
  additionalComments?: string;
}

export interface Consents {
  acceptTerms: boolean;
  authorizeCreditCheck: boolean;
  confirmTruthfulness: boolean;
}

export interface CompleteLoanApplication {
  id?: string;
  userId: string;
  microfinancieraId: string;
  
  // Secciones del formulario
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  employmentInfo: EmploymentInfo;
  financialInfo: FinancialInfo;
  additionalInfo: AdditionalInfo;
  consents: Consents;
  
  // Geolocalización
  location?: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
  
  // Estado
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  
  // Timestamps
  createdAt: any;
  updatedAt: any;
}
