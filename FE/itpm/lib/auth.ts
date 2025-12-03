// API URL - can be overridden via NEXT_PUBLIC_API_URL environment variable
const getApiUrl = (): string => {
  if (typeof window === 'undefined') return 'http://localhost:4000';
  // @ts-ignore - Next.js provides process.env in client-side code
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
};

const API_URL = getApiUrl();

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  studentId: string;
  emailAlerts?: boolean;
}

export interface User {
  id: string;
  studentId: string;
  name: string;
  email: string;
  fullName: string;
  role: string;
  verified: boolean;
  preferences?: {
    emailAlerts: boolean;
  };
}

export interface LoginResult {
  user: User;
  accessToken: string;
  credentials: {
    username: string;
    password: string;
  };
}

export interface RegisterResult {
  success: boolean;
  message: string;
  user: Omit<User, 'passwordHash'>;
}

// Register function - creates a new user account
export const registerUser = async (data: RegisterRequest): Promise<RegisterResult> => {
  try {
    const url = `${API_URL}/auth/register`;
    console.log('Registering user at:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(error.message || error.error || `Registration failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend at ${API_URL}. Make sure the backend server is running.`);
    }
    throw error;
  }
};

// Login function - authenticates user and returns token
export const loginUser = async (credentials: LoginRequest): Promise<LoginResult> => {
  try {
    const url = `${API_URL}/auth/login`;
    console.log('Logging in at:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || error.error || `Login failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    // Transform backend user to frontend user format
    const user: User = {
      id: result.user.id,
      studentId: result.user.studentId,
      name: result.user.fullName,
      email: result.user.email,
      fullName: result.user.fullName,
      role: result.user.role,
      verified: result.user.verified,
      preferences: result.user.preferences,
    };

    return {
      user,
      accessToken: result.accessToken,
      credentials: {
        username: credentials.email,
        password: credentials.password,
      },
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend at ${API_URL}. Make sure the backend server is running.`);
    }
    throw error;
  }
};

// Get current user from storage
export const getCurrentUser = async (): Promise<User | null> => {
  // This will be handled by the store now
  return null;
};
