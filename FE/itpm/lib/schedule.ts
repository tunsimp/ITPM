export interface ScheduleEvent {
  id: string
  course: string
  code: string
  professor: string
  room: string
  time: string
  day: string
}

const MOCK_SCHEDULE: ScheduleEvent[] = [
  {
    id: "1",
    course: "Calculus I",
    code: "MATH101",
    professor: "Dr. Smith",
    room: "101",
    time: "09:00 AM",
    day: "Monday",
  },
  {
    id: "2",
    course: "Physics II",
    code: "PHYS102",
    professor: "Dr. Johnson",
    room: "205",
    time: "02:00 PM",
    day: "Monday",
  },
  {
    id: "3",
    course: "English Literature",
    code: "ENG101",
    professor: "Prof. Williams",
    room: "301",
    time: "10:30 AM",
    day: "Tuesday",
  },
  {
    id: "4",
    course: "Chemistry I",
    code: "CHEM101",
    professor: "Dr. Brown",
    room: "110",
    time: "01:00 PM",
    day: "Wednesday",
  },
  {
    id: "5",
    course: "History of Science",
    code: "HIST101",
    professor: "Prof. Davis",
    room: "202",
    time: "03:00 PM",
    day: "Thursday",
  },
  {
    id: "6",
    course: "Calculus I",
    code: "MATH101",
    professor: "Dr. Smith",
    room: "101",
    time: "09:00 AM",
    day: "Wednesday",
  },
  {
    id: "7",
    course: "Physics II",
    code: "PHYS102",
    professor: "Dr. Johnson",
    room: "205",
    time: "02:00 PM",
    day: "Friday",
  },
]

export const getSchedule = async (): Promise<ScheduleEvent[]> => {
  console.log("Using mock data for schedule")
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_SCHEDULE)
    }, 500)
  })
}

export const syncScheduleToTasks = async (): Promise<void> => {
  console.log("Syncing schedule to tasks (mock)")
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 1000)
  })
}

/*
// Real API endpoints (commented out for future use)
const API_URL = process.env.NEXT_PUBLIC_API_URL

export const getSchedule_real = async (): Promise<ScheduleEvent[]> => {
  const { data } = await axios.get(`${API_URL}/api/schedule`)
  return data
}

export const syncScheduleToTasks_real = async (): Promise<void> => {
  await axios.post(`${API_URL}/api/schedule/sync`)
}
*/
