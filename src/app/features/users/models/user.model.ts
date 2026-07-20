export interface User {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  role: string;
  speciality?: string;
  availabilityStatus?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRequest {
  employeeCode: string;
  fullName: string;
  email: string;
  password?: string;
  roleName: string;
  speciality?: string;
  availabilityStatus?: string;
}

export interface UserProfile {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  speciality?: string;
  availabilityStatus?: string;
}