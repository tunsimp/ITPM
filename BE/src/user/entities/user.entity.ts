export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  studentId: string;
  role: string;
  verified: boolean;
  preferences: {
    emailAlerts: boolean;
  };
  createdAt: string;
}
