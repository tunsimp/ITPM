export interface TuitionRecord {
  id: string
  semester: string
  amount: number
  status: "paid" | "due" | "overdue"
  dueDate: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "alert"
  date: string
}

const MOCK_TUITION: TuitionRecord[] = [
  { id: "1", semester: "Fall 2025", amount: 5000, status: "paid", dueDate: "2025-08-31" },
  { id: "2", semester: "Spring 2025", amount: 5000, status: "paid", dueDate: "2025-01-15" },
  { id: "3", semester: "Fall 2024", amount: 5000, status: "paid", dueDate: "2024-08-31" },
]

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Tuition Payment Confirmed",
    message: "Your Fall 2025 tuition has been successfully processed.",
    type: "info",
    date: "2025-08-20",
  },
  {
    id: "2",
    title: "Payment Reminder",
    message: "Spring 2026 tuition will be due on January 15, 2026.",
    type: "warning",
    date: "2025-11-01",
  },
]

export const getTuitionRecords = async (): Promise<TuitionRecord[]> => {
  console.log("Using mock data for tuition")
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_TUITION)
    }, 500)
  })
}

export const getTuitionNotifications = async (): Promise<Notification[]> => {
  console.log("Using mock data for notifications")
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_NOTIFICATIONS)
    }, 500)
  })
}

/*
// Real API endpoints (commented out for future use)
const API_URL = process.env.NEXT_PUBLIC_API_URL

export const getTuitionRecords_real = async (): Promise<TuitionRecord[]> => {
  const { data } = await axios.get(`${API_URL}/api/tuition`)
  return data
}

export const getTuitionNotifications_real = async (): Promise<Notification[]> => {
  const { data } = await axios.get(`${API_URL}/api/tuition/notifications`)
  return data
}
*/
