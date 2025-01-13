export interface ClinicianInfo {
  name: string;
  email: string;
  clinicName: string;
  childFirstName: string;
  childLastName: string;
  childName?: string; // Optional since it will be derived from first and last name
  childAge: string;
  childGender: string;
  chataId?: string;
} 