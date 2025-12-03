"use client"

import { useEffect, useState } from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { getSchedule, syncScheduleToTasks, createSchedule, deleteSchedule, updateSchedule } from "@/lib/schedule"
import { getTasks } from "@/lib/tasks"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertCircle, Plus, X, ChevronLeft, ChevronRight, Pencil } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScheduleSkeleton } from "@/components/skeletons"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

interface ScheduleEvent {
  id: string
  course: string
  code: string
  professor: string
  room: string
  time: string
  day: string
  isRecurring?: boolean
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export default function SchedulePage() {
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncSuccess, setSyncSuccess] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null)
  const [viewMode, setViewMode] = useState<"week" | "year">("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [newEvent, setNewEvent] = useState({
    course: "",
    code: "",
    professor: "",
    room: "",
    time: "",
    day: "Monday",
    isRecurring: false,
  })

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        // Fetch both schedule events and tasks
        const [schedule, tasks] = await Promise.all([
          getSchedule().catch(() => []),
          getTasks().catch(() => []),
        ])

        // Convert tasks with course codes and due dates to schedule events
        const taskEvents: ScheduleEvent[] = tasks
          .filter((task) => task.status === "PENDING" && task.course && task.dueDate)
          .map((task) => {
            const dueDate = new Date(task.dueDate!)
            const dayName = dueDate.toLocaleDateString('en-US', { weekday: 'long' })
            const timeStr = dueDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

            return {
              id: `task-${task.id}`,
              course: task.title,
              code: task.course || "",
              professor: "",
              room: "",
              time: timeStr,
              day: dayName,
              isRecurring: false,
            }
          })

        // Combine schedule events and task events
        setEvents([...schedule, ...taskEvents])
      } catch (error) {
        console.error("Failed to fetch schedule:", error)
        toast.error("Failed to load schedule")
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [])

  const handleSync = async () => {
    setSyncing(true)
    try {
      // Fetch both schedule events and tasks
      const [schedule, tasks] = await Promise.all([
        getSchedule().catch(() => []),
        getTasks().catch(() => []),
      ])

      // Convert tasks with course codes and due dates to schedule events
      const taskEvents: ScheduleEvent[] = tasks
        .filter((task) => task.status === "PENDING" && task.course && task.dueDate)
        .map((task) => {
          const dueDate = new Date(task.dueDate!)
          const dayName = dueDate.toLocaleDateString('en-US', { weekday: 'long' })
          const timeStr = dueDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

          return {
            id: `task-${task.id}`,
            course: task.title,
            code: task.course || "",
            professor: "",
            room: "",
            time: timeStr,
            day: dayName,
            isRecurring: false,
          }
        })

      // Combine schedule events and task events
      setEvents([...schedule, ...taskEvents])

      await syncScheduleToTasks()
      setSyncSuccess(true)
      setTimeout(() => setSyncSuccess(false), 3000)
      toast.success("Schedule synced with tasks successfully")
    } catch (error) {
      console.error("Failed to sync schedule:", error)
      toast.error("Failed to refresh schedule")
    } finally {
      setSyncing(false)
    }
  }

  const handleAddEvent = async () => {
    if (!newEvent.course || !newEvent.time || !newEvent.day) {
      toast.error("Please fill in course, time, and day")
      return
    }

    try {
      // Create schedule event in database
      const created = await createSchedule({
        course: newEvent.course,
        code: newEvent.code || "",
        professor: newEvent.professor || "",
        room: newEvent.room || "",
        time: newEvent.time,
        day: newEvent.day,
        isRecurring: newEvent.isRecurring,
      })

      // Add event to local state
      const event: ScheduleEvent = {
        id: created.id,
        ...newEvent,
      }

      setEvents([...events, event])
      setNewEvent({
        course: "",
        code: "",
        professor: "",
        room: "",
        time: "",
        day: "Monday",
        isRecurring: false,
      })
      setDialogOpen(false)
      toast.success("Event added successfully")
    } catch (error) {
      console.error("Failed to add event:", error)
      toast.error("Failed to save event to database")
    }
  }

  const handleRemoveEvent = async (id: string) => {
    try {
      // Only delete schedule events from database, not task events
      if (!id.startsWith("task-")) {
        await deleteSchedule(id)
      }
      setEvents(events.filter((e) => e.id !== id))
      toast.success("Event removed")
    } catch (error) {
      console.error("Failed to delete event:", error)
      toast.error("Failed to delete event")
    }
  }

  const handleEditEvent = (event: ScheduleEvent) => {
    // Don't allow editing task events
    if (event.id.startsWith("task-")) {
      toast.error("Cannot edit task events. Edit the task instead.")
      return
    }
    setEditingEvent(event)
    setNewEvent({
      course: event.course,
      code: event.code || "",
      professor: event.professor || "",
      room: event.room || "",
      time: event.time,
      day: event.day,
      isRecurring: event.isRecurring || false,
    })
    setEditDialogOpen(true)
  }

  const handleUpdateEvent = async () => {
    if (!editingEvent || !newEvent.course || !newEvent.time || !newEvent.day) {
      toast.error("Please fill in course, time, and day")
      return
    }

    try {
      const updated = await updateSchedule(editingEvent.id, {
        course: newEvent.course,
        code: newEvent.code || "",
        professor: newEvent.professor || "",
        room: newEvent.room || "",
        time: newEvent.time,
        day: newEvent.day,
        isRecurring: newEvent.isRecurring,
      })

      setEvents(events.map((e) => (e.id === editingEvent.id ? updated : e)))
      setEditingEvent(null)
      setNewEvent({
        course: "",
        code: "",
        professor: "",
        room: "",
        time: "",
        day: "Monday",
        isRecurring: false,
      })
      setEditDialogOpen(false)
      toast.success("Event updated successfully")
    } catch (error) {
      console.error("Failed to update event:", error)
      toast.error("Failed to update event")
    }
  }

  const getEventsByDay = (day: string) => {
    // Get events for this specific day (recurring events will show on their day every week)
    return events.filter((e) => e.day === day)
  }

  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const diff = d.getDate() - day // Go back to Sunday
    return new Date(d.setDate(diff))
  }

  const getWeekDays = (startDate: Date) => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      days.push(d)
    }
    return days
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const weekStart = getWeekStart(currentDate)
  const weekDays = getWeekDays(weekStart)

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const getDayName = (date: Date) => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return dayNames[date.getDay()]
  }

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="p-8">
          <ScheduleSkeleton />
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Schedule</h1>
            <p className="text-muted-foreground mt-1">Manage your classes and events</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Plus className="w-4 h-4" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Course/Event Name</label>
                    <Input
                      placeholder="E.g., Physics Lab"
                      value={newEvent.course}
                      onChange={(e) => setNewEvent({ ...newEvent, course: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Course Code</label>
                    <Input
                      placeholder="E.g., PHYS101"
                      value={newEvent.code}
                      onChange={(e) => setNewEvent({ ...newEvent, code: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Professor/Instructor</label>
                    <Input
                      placeholder="E.g., Dr. Smith"
                      value={newEvent.professor}
                      onChange={(e) => setNewEvent({ ...newEvent, professor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Room/Location</label>
                    <Input
                      placeholder="E.g., Room 101"
                      value={newEvent.room}
                      onChange={(e) => setNewEvent({ ...newEvent, room: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Time</label>
                    <Input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Day</label>
                    <Select value={newEvent.day} onValueChange={(value) => setNewEvent({ ...newEvent, day: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Checkbox
                      id="recurring"
                      checked={newEvent.isRecurring}
                      onCheckedChange={(checked) => setNewEvent({ ...newEvent, isRecurring: checked as boolean })}
                    />
                    <label htmlFor="recurring" className="text-sm font-medium text-foreground cursor-pointer">
                      Repeat weekly
                    </label>
                  </div>
                  <Button onClick={handleAddEvent} className="w-full">
                    Add Event
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Course/Event Name</label>
                    <Input
                      placeholder="E.g., Physics Lab"
                      value={newEvent.course}
                      onChange={(e) => setNewEvent({ ...newEvent, course: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Course Code</label>
                    <Input
                      placeholder="E.g., PHYS101"
                      value={newEvent.code}
                      onChange={(e) => setNewEvent({ ...newEvent, code: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Professor/Instructor</label>
                    <Input
                      placeholder="E.g., Dr. Smith"
                      value={newEvent.professor}
                      onChange={(e) => setNewEvent({ ...newEvent, professor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Room/Location</label>
                    <Input
                      placeholder="E.g., Room 101"
                      value={newEvent.room}
                      onChange={(e) => setNewEvent({ ...newEvent, room: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Time</label>
                    <Input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Day</label>
                    <Select value={newEvent.day} onValueChange={(value) => setNewEvent({ ...newEvent, day: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Checkbox
                      id="edit-recurring"
                      checked={newEvent.isRecurring}
                      onCheckedChange={(checked) => setNewEvent({ ...newEvent, isRecurring: checked as boolean })}
                    />
                    <label htmlFor="edit-recurring" className="text-sm font-medium text-foreground cursor-pointer">
                      Repeat weekly
                    </label>
                  </div>
                  <Button onClick={handleUpdateEvent} className="w-full">
                    Update Event
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={handleSync} disabled={syncing}>
              {syncing ? "Syncing..." : "Sync to Tasks"}
            </Button>
          </div>
        </div>

        {syncSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">Schedule synced to tasks successfully!</AlertDescription>
          </Alert>
        )}

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "week" | "year")} className="mt-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="week">Week View</TabsTrigger>
            <TabsTrigger value="year">Year View</TabsTrigger>
          </TabsList>

          <TabsContent value="week" className="mt-6 space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-muted-foreground">
                  {weekStart.toLocaleDateString()} -{" "}
                  {new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="px-4">
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
              {weekDays.map((day, idx) => (
                <Card key={idx} className="lg:min-h-96">
                  <CardHeader className="pb-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {getDayName(day).slice(0, 3).toUpperCase()}
                      </p>
                      <p className="text-2xl font-bold text-foreground">{day.getDate()}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getEventsByDay(getDayName(day)).length > 0 ? (
                        getEventsByDay(getDayName(day)).map((event) => (
                          <Dialog key={event.id}>
                            <DialogTrigger asChild>
                              <div className={`w-full text-left p-3 rounded-lg transition-colors cursor-pointer relative group ${event.id.startsWith("task-")
                                ? "bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20"
                                : "bg-primary/10 hover:bg-primary/15"
                                }`}>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium text-foreground text-sm truncate">{event.course}</p>
                                      {event.id.startsWith("task-") && (
                                        <span className="text-xs bg-blue-500/20 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded">Task</span>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{event.time}</p>
                                    {event.isRecurring && (
                                      <p className="text-xs text-primary mt-1">🔄 Recurring</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!event.id.startsWith("task-") && (
                                      <button
                                        className="p-1 hover:bg-secondary rounded transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleEditEvent(event)
                                        }}
                                        title="Edit event"
                                      >
                                        <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                                      </button>
                                    )}
                                    <button
                                      className="p-1 hover:bg-secondary rounded transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleRemoveEvent(event.id)
                                      }}
                                      title="Remove event"
                                    >
                                      <X className="w-3.5 h-3.5 text-destructive" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{event.course}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Course Code</p>
                                  <p className="font-medium text-foreground">{event.code || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Professor</p>
                                  <p className="font-medium text-foreground">{event.professor || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Location</p>
                                  <p className="font-medium text-foreground">Room {event.room || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Time</p>
                                  <p className="font-medium text-foreground">{event.time}</p>
                                </div>
                                {event.isRecurring && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">Recurrence</p>
                                    <p className="font-medium text-foreground">🔄 Repeats weekly on {event.day}</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">No events</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="year" className="mt-6 space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">{currentDate.getFullYear()}</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth()))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="px-4">
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth()))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MONTHS.map((month, monthIdx) => {
                const monthDate = new Date(currentDate.getFullYear(), monthIdx)
                const daysInMonth = getDaysInMonth(monthDate)
                const firstDay = getFirstDayOfMonth(monthDate)
                const monthDays = []

                for (let i = 0; i < firstDay; i++) {
                  monthDays.push(null)
                }
                for (let i = 1; i <= daysInMonth; i++) {
                  monthDays.push(i)
                }

                return (
                  <Card key={monthIdx}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{month}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-7 gap-1">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                            {day}
                          </div>
                        ))}
                        {monthDays.map((day, idx) => {
                          const hasEvent = day
                            ? getEventsByDay(
                              DAYS[new Date(currentDate.getFullYear(), monthIdx, day || 1).getDay() - 1] || "Monday",
                            ).length > 0
                            : false

                          return (
                            <div
                              key={idx}
                              className={`text-center text-sm py-2 rounded transition-colors ${day
                                ? `hover:bg-secondary/50 cursor-pointer ${hasEvent ? "bg-primary/20 font-bold text-foreground" : "text-muted-foreground"}`
                                : ""
                                }`}
                            >
                              {day}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedLayout>
  )
}
