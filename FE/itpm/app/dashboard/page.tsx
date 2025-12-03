"use client"

import { useEffect, useState } from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { DashboardSkeleton } from "@/components/skeletons"
import { useAuthStore } from "@/lib/store"
import { getDashboardSummary } from "@/lib/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Clock, TrendingUp } from "lucide-react"

interface DashboardData {
  upcomingTasks: Array<{ id: string; title: string; dueDate: string; course: string }>
  todaySchedule: Array<{ id: string; course: string; time: string; room: string }>
  currentGpa: number
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summary = await getDashboardSummary()
        setData(summary)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="p-8">
          <DashboardSkeleton />
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground mt-2">Here's what's happening with your studies today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current GPA</p>
                  <p className="text-2xl font-bold text-foreground">
                    {data?.currentGpa ? data.currentGpa.toFixed(2) : "N/A"}
                  </p>
                  {!data?.currentGpa && (
                    <p className="text-xs text-muted-foreground mt-1">View grades to see GPA</p>
                  )}
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/5 to-blue-600/5 border-blue-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Tasks</p>
                  <p className="text-2xl font-bold text-foreground">{data?.upcomingTasks.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 border-emerald-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Classes</p>
                  <p className="text-2xl font-bold text-foreground">{data?.todaySchedule.length}</p>
                </div>
                <Clock className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.upcomingTasks && data.upcomingTasks.length > 0 ? (
                  data.upcomingTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-4 pb-4 border-b border-border last:border-0">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.course}</p>
                        {task.dueDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No upcoming tasks</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.todaySchedule && data.todaySchedule.length > 0 ? (
                  data.todaySchedule.map((event) => (
                    <div key={event.id} className="flex items-start gap-4 pb-4 border-b border-border last:border-0">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{event.course}</p>
                        {event.time && <p className="text-sm text-muted-foreground">{event.time}</p>}
                        {event.room && <p className="text-xs text-muted-foreground mt-1">Room {event.room}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No classes scheduled for today</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  )
}
