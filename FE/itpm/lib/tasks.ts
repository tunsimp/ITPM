const getApiUrl = (): string => {
  if (typeof window === 'undefined') return 'http://localhost:4000';
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
};

const API_URL = getApiUrl();

export interface Task {
  id: string
  title: string
  course?: string
  dueDate?: string
  status: "PENDING" | "COMPLETED"
  priority: "LOW" | "MEDIUM" | "HIGH"
  reminder?: boolean
  createdAt?: string
  updatedAt?: string
}

const fetchAPI = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const getTasks = async (): Promise<Task[]> => {
  try {
    const result = await fetchAPI<Task[]>(`/tasks`);
    return result.map(task => ({
      ...task,
      status: task.status as "PENDING" | "COMPLETED",
      priority: task.priority as "LOW" | "MEDIUM" | "HIGH",
    }));
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    throw error;
  }
};

export const createTask = async (task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> => {
  try {
    const result = await fetchAPI<Task>(`/tasks`, {
      method: 'POST',
      body: JSON.stringify({
        title: task.title,
        course: task.course,
        dueDate: task.dueDate,
        status: task.status || 'PENDING',
        priority: task.priority || 'MEDIUM',
        reminder: task.reminder || false,
      }),
    });
    return result;
  } catch (error) {
    console.error("Failed to create task:", error);
    throw error;
  }
};

export const updateTask = async (id: string, task: Partial<Task>): Promise<Task> => {
  try {
    const result = await fetchAPI<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: task.title,
        course: task.course,
        dueDate: task.dueDate,
        status: task.status,
        priority: task.priority,
        reminder: task.reminder,
      }),
    });
    return result;
  } catch (error) {
    console.error("Failed to update task:", error);
    throw error;
  }
};

export const deleteTask = async (id: string): Promise<void> => {
  try {
    await fetchAPI(`/tasks/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error("Failed to delete task:", error);
    throw error;
  }
};
