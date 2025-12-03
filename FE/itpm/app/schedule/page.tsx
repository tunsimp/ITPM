"use client"

import { useEffect, useState } from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { getSchedule, syncScheduleToTasks } from "@/lib/schedule"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertCircle, Plus, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScheduleSkeleton } from "@/components/skeletons"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ScheduleEvent {
  id: string
  course: string
  code: string
  professor: string
  room: string
  time: string
  day: string
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
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
  const [viewMode, setViewMode] = useState<"week" | "year">("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [newEvent, setNewEvent] = useState({
    course: "",
    code: "",
    professor: "",
    room: "",
    time: "",
    day: "Monday",
  })

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const schedule = await getSchedule()
        setEvents(schedule)
      } catch (error) {
        console.error("Failed to fetch schedule:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [])

  const handleSync = async () => {
    setSyncing(true)
    try {
      await syncScheduleToTasks()
      setSyncSuccess(true)
      setTimeout(() => setSyncSuccess(false), 3000)
    } catch (error) {
      console.error("Failed to sync schedule:", error)
    } finally {
      setSyncing(false)
    }
  }

  const handleAddEvent = () => {
    if (!newEvent.course || !newEvent.time || !newEvent.day) {
      alert("Please fill in course, time, and day")
      return
    }

    const event: ScheduleEvent = {
      id: `custom-${Date.now()}`,
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
    })
    setDialogOpen(false)
  }

  const handleRemoveEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id))
  }

  const getEventsByDay = (day: string) => events.filter((e) => e.day === day)

  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  const getWeekDays = (startDate: Date) => {
    const days = []
    for (let i = 0; i < 5; i++) {
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
                  <Button onClick={handleAddEvent} className="w-full">
                    Add Event
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
                  {new Date(weekStart.getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString()}
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

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
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
                              <div className="w-full text-left p-3 bg-primary/10 hover:bg-primary/15 rounded-lg transition-colors cursor-pointer relative group">
                                <p className="font-medium text-foreground text-sm truncate">{event.course}</p>
                                <p className="text-xs text-muted-foreground mt-1">{event.time}</p>
                                {event.id.startsWith("custom-") && (
                                  <button
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRemoveEvent(event.id)
                                    }}
                                  >
                                    <X className="w-4 h-4 text-destructive" />
                                  </button>
                                )}
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
                              className={`text-center text-sm py-2 rounded transition-colors ${
                                day
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
