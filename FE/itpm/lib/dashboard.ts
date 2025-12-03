import { getTasks, Task } from "./tasks"
import { getSchedule, ScheduleEvent } from "./schedule"

// Re-export Task type for use in dashboard
export type { Task } from "./tasks"

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
  currentGpa: number
}

const getApiUrl = (): string => {
  if (typeof window === 'undefined') return 'http://localhost:4000';
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
};

const API_URL = getApiUrl();

// Helper function to get today's day name
const getTodayDayName = (): string => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  return days[new Date().getDay()]
}

// Helper function to format time from schedule event
const formatTime = (time: string): string => {
  // If time is already formatted (e.g., "09:00 AM"), return as is
  if (time.includes("AM") || time.includes("PM")) return time
  // Otherwise, try to parse and format
  try {
    const [hours, minutes] = time.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  } catch {
    return time
  }
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  try {
    // Fetch tasks and schedule in parallel
    const [tasks, scheduleEvents] = await Promise.all([
      getTasks().catch(() => [] as Task[]),
      getSchedule().catch(() => [] as ScheduleEvent[]),
    ])

    // Get today's day name
    const todayDayName = getTodayDayName()

    // Filter upcoming tasks (pending tasks with due dates in the future)
    const now = new Date()
    const upcomingTasks = tasks
      .filter((task) => {
        if (task.status !== "PENDING") return false
        if (!task.dueDate) return false
        const dueDate = new Date(task.dueDate)
        return dueDate >= now
      })
      .sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0
        return dateA - dateB
      })
      .slice(0, 5) // Get top 5 upcoming tasks
      .map((task) => ({
        id: task.id,
        title: task.title,
        dueDate: task.dueDate || "",
        course: task.course || "General",
      }))

    // Filter today's schedule events from schedule
    const todayScheduleFromSchedule = scheduleEvents
      .filter((event) => event.day === todayDayName)
      .map((event) => ({
        id: event.id,
        course: event.course,
        time: formatTime(event.time),
        room: event.room || "TBA",
      }))

    // Also get today's tasks that have a due date today and convert them to schedule events
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const todayTasksAsSchedule = tasks
      .filter((task) => {
        if (task.status === "COMPLETED") return false
        if (!task.dueDate) return false
        const dueDate = new Date(task.dueDate)
        return dueDate >= todayStart && dueDate < todayEnd
      })
      .map((task) => ({
        id: `task-${task.id}`,
        course: task.title,
        time: task.dueDate ? new Date(task.dueDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "All Day",
        room: task.course || "Task",
      }))

    // Combine schedule events and today's tasks, sort by time
    const todaySchedule = [...todayScheduleFromSchedule, ...todayTasksAsSchedule].sort((a, b) => {
      const timeA = a.time ? a.time : ""
      const timeB = b.time ? b.time : ""
      return timeA.localeCompare(timeB)
    })

    // For GPA, we'll set it to 0 for now since grades require EduSoft credentials
    // In the future, this could be fetched from a stored grades cache or user preference
    const currentGpa = 0

    return {
      upcomingTasks,
      todaySchedule,
      currentGpa,
    }
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error)
    // Return empty data on error
    return {
      upcomingTasks: [],
      todaySchedule: [],
      currentGpa: 0,
    }
  }
}
