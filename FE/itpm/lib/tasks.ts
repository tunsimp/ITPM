export interface Task {
  id: string
  title: string
  course: string
  dueDate: string
  status: "pending" | "completed"
  priority: "low" | "medium" | "high"
  reminder?: boolean
}

const MOCK_TASKS: Task[] = [
  {
    id: "1",
    title: "Calculus Assignment 1",
    course: "MATH101",
    dueDate: "2025-11-20",
    status: "pending",
    priority: "high",
  },
  {
    id: "2",
    title: "Physics Lab Report",
    course: "PHYS102",
    dueDate: "2025-11-18",
    status: "completed",
    priority: "high",
  },
  {
    id: "3",
    title: "English Essay Draft",
    course: "ENG101",
    dueDate: "2025-11-25",
    status: "pending",
    priority: "medium",
  },
  {
    id: "4",
    title: "Chemistry Quiz Prep",
    course: "CHEM101",
    dueDate: "2025-11-17",
    status: "pending",
    priority: "medium",
  },
  { id: "5", title: "History Reading", course: "HIST101", dueDate: "2025-11-30", status: "pending", priority: "low" },
]

export const getTasks = async (): Promise<Task[]> => {
  console.log("Using mock data for tasks")
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_TASKS)
    }, 500)
  })
}

export const createTask = async (task: Omit<Task, "id">): Promise<Task> => {
  console.log("Creating task (mock)")
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...task, id: Math.random().toString() })
    }, 300)
  })
}

export const updateTask = async (id: string, task: Partial<Task>): Promise<Task> => {
  console.log("Updating task (mock)")
  return new Promise((resolve) => {
    setTimeout(() => {
      const existing = MOCK_TASKS.find((t) => t.id === id) || {
        id,
        title: "",
        course: "",
        dueDate: "",
        status: "pending" as const,
        priority: "medium" as const,
      }
      resolve({ ...existing, ...task })
    }, 300)
  })
}

/*
// Real API endpoints (commented out for future use)
const API_URL = process.env.NEXT_PUBLIC_API_URL

export const getTasks_real = async (): Promise<Task[]> => {
  const { data } = await axios.get(`${API_URL}/api/tasks`)
  return data
}

export const createTask_real = async (task: Omit<Task, 'id'>): Promise<Task> => {
  const { data } = await axios.post(`${API_URL}/api/tasks`, task)
  return data
}

export const updateTask_real = async (id: string, task: Partial<Task>): Promise<Task> => {
  const { data } = await axios.put(`${API_URL}/api/tasks/${id}`, task)
  return data
}
*/
