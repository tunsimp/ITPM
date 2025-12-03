const getApiUrl = (): string => {
  if (typeof window === 'undefined') return 'http://localhost:4000';
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
};

const API_URL = getApiUrl();

export interface ScheduleEvent {
  id: string
  course: string
  code: string
  professor: string
  room: string
  time: string
  day: string
  isRecurring?: boolean
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

export const getSchedule = async (): Promise<ScheduleEvent[]> => {
  try {
    const result = await fetchAPI<any[]>(`/schedule`);
    return result.map(schedule => ({
      id: schedule.id,
      course: schedule.course,
      code: schedule.code || "",
      professor: schedule.professor || "",
      room: schedule.room || "",
      time: schedule.time,
      day: schedule.day,
      isRecurring: schedule.isRecurring || false,
    }));
  } catch (error) {
    console.error("Failed to fetch schedule:", error);
    // Return empty array on error instead of throwing
    return [];
  }
};

export const createSchedule = async (schedule: Omit<ScheduleEvent, "id">): Promise<ScheduleEvent> => {
  try {
    const result = await fetchAPI<any>(`/schedule`, {
      method: 'POST',
      body: JSON.stringify({
        course: schedule.course,
        code: schedule.code,
        professor: schedule.professor,
        room: schedule.room,
        time: schedule.time,
        day: schedule.day,
        isRecurring: schedule.isRecurring || false,
      }),
    });
    return {
      id: result.id,
      course: result.course,
      code: result.code || "",
      professor: result.professor || "",
      room: result.room || "",
      time: result.time,
      day: result.day,
      isRecurring: result.isRecurring || false,
    };
  } catch (error) {
    console.error("Failed to create schedule:", error);
    throw error;
  }
};

export const updateSchedule = async (id: string, schedule: Partial<ScheduleEvent>): Promise<ScheduleEvent> => {
  try {
    const result = await fetchAPI<any>(`/schedule/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        course: schedule.course,
        code: schedule.code,
        professor: schedule.professor,
        room: schedule.room,
        time: schedule.time,
        day: schedule.day,
        isRecurring: schedule.isRecurring,
      }),
    });
    return {
      id: result.id,
      course: result.course,
      code: result.code || "",
      professor: result.professor || "",
      room: result.room || "",
      time: result.time,
      day: result.day,
      isRecurring: result.isRecurring || false,
    };
  } catch (error) {
    console.error("Failed to update schedule:", error);
    throw error;
  }
};

export const deleteSchedule = async (id: string): Promise<void> => {
  try {
    await fetchAPI(`/schedule/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error("Failed to delete schedule:", error);
    throw error;
  }
};

export const syncScheduleToTasks = async (): Promise<void> => {
  // This function can be used to sync schedule events to tasks if needed
  // For now, it's a no-op since tasks are created separately
  console.log("Schedule sync to tasks - tasks are managed separately");
}
