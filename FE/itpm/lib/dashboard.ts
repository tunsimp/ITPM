export interface DashboardSummary {
  upcomingTasks: Array<{
    id: string
    title: string
    dueDate: string
    course: string
  }>
  todaySchedule: Array<{
    id: string
    course: string
    time: string
    room: string
  }>
  tuitionStatus: {
    status: "paid" | "due" | "overdue"
    amount?: number
  }
  currentGpa: number
}

const MOCK_SUMMARY: DashboardSummary = {
  upcomingTasks: [
    { id: "1", title: "Calculus Assignment", dueDate: "2025-11-20", course: "MATH101" },
    { id: "2", title: "Physics Lab Report", dueDate: "2025-11-22", course: "PHYS102" },
    { id: "3", title: "English Essay", dueDate: "2025-11-25", course: "ENG101" },
  ],
  todaySchedule: [
    { id: "1", course: "Calculus", time: "09:00 AM", room: "101" },
    { id: "2", course: "Physics", time: "02:00 PM", room: "205" },
  ],
  tuitionStatus: {
    status: "paid",
  },
  currentGpa: 3.75,
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  console.log("Using mock data for dashboard")
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_SUMMARY)
    }, 500)
  })
}

/*
// Real API endpoint (commented out for future use)
const API_URL = process.env.NEXT_PUBLIC_API_URL

export const getDashboardSummary_real = async (): Promise<DashboardSummary> => {
  const { data } = await axios.get(`${API_URL}/api/dashboard/summary`)
  return data
}
*/
