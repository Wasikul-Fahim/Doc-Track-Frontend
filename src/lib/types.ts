export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiEnvelope<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?:
    | { field: string; message: string }[]
    | Record<string, unknown>;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  area: string;
  phone: string;
  email: string;
  patientCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorOption {
  _id: string;
  name: string;
  specialization: string;
}

export const PATIENT_STATUSES = ["admitted", "discharged", "critical"] as const;
export type PatientStatus = (typeof PATIENT_STATUSES)[number];

export const STATUS_ENUM = PATIENT_STATUSES;

export const GENDERS = ["male", "female", "other"] as const;
export type Gender = (typeof GENDERS)[number];

export const SPECIALIZATIONS = [
  "Allergy & Immunology",
  "Anesthesiology",
  "Cardiac Surgery",
  "Cardiology",
  "Dentistry",
  "Dermatology",
  "Diabetology",
  "Emergency Medicine",
  "Endocrinology",
  "ENT (Otolaryngology)",
  "Family Medicine",
  "Gastroenterology",
  "General Medicine",
  "General Surgery",
  "Geriatrics",
  "Gynecology & Obstetrics",
  "Hematology",
  "Hepatology",
  "Infectious Disease",
  "Nephrology",
  "Neurology",
  "Neurosurgery",
  "Nutrition & Dietetics",
  "Oncology",
  "Ophthalmology",
  "Oral & Maxillofacial Surgery",
  "Orthopedics",
  "Pathology",
  "Pediatric Surgery",
  "Pediatrics",
  "Physical Medicine & Rehabilitation",
  "Plastic Surgery",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Sports Medicine",
  "Urology",
  "Vascular Surgery",
] as const;

export type Specialization = (typeof SPECIALIZATIONS)[number];

export interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  condition: string;
  status: PatientStatus;
  admittedAt: string;
  doctorId: DoctorOption | string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardOverview {
  totals: {
    doctors: number;
    patients: number;
    critical: number;
    admitted: number;
    discharged: number;
    avgAge: number | null;
  };
  statusBreakdown: { status: PatientStatus; count: number }[];
  admissionsByMonth: { month: string; count: number }[];
  topConditions: { condition: string; count: number }[];
  patientsPerDoctor: {
    doctorId: string;
    name: string;
    specialization: string;
    area?: string;
    count: number;
  }[];
  specializationBreakdown: { specialization: string; count: number }[];
}
