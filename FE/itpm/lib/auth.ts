export interface LoginRequest {
  studentId: string;
  password: string;
}

export interface User {
  id: string;
  studentId: string;
  name: string;
  email: string;
  gpa: number;
}

export interface LoginResult {
  user: User;
  credentials: {
    username: string;
    password: string;
  };
}

// Login function - returns user and credentials for storage
export const loginUser = async (credentials: LoginRequest): Promise<LoginResult> => {
  // For now, we create a mock user but store the real credentials
  // These credentials will be used for API calls like grades
  const mockUser: User = {
    id: "1",
    studentId: credentials.studentId,
    name: credentials.studentId, // Will be updated when we fetch real data
    email: `${credentials.studentId.toLowerCase()}@university.edu`,
    gpa: 0,
  };

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        user: mockUser,
        credentials: {
          username: credentials.studentId,
          password: credentials.password,
        },
      });
    }, 500);
  });
};

// Get current user from storage
export const getCurrentUser = async (): Promise<User | null> => {
  // This will be handled by the store now
  return null;
};
