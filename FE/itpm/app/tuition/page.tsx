"use client"

import { useEffect, useState } from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { getTuitionRecords, getTuitionNotifications } from "@/lib/tuition"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert } from "@/components/ui/alert"
import { Bell } from "lucide-react"

interface TuitionRecord {
  id: string
  semester: string
  amount: number
  status: "paid" | "due" | "overdue"
  dueDate: string
}

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "alert"
  date: string
}

export default function TuitionPage() {
  const [records, setRecords] = useState<TuitionRecord[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tuition, notifs] = await Promise.all([getTuitionRecords(), getTuitionNotifications()])
        setRecords(tuition)
        setNotifications(notifs)
      } catch (error) {
        console.error("Failed to fetch tuition data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "due":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-50 border-blue-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "alert":
        return "bg-red-50 border-red-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="p-8">Loading...</div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="p-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tuition</h1>
          <p className="text-muted-foreground mt-2">Manage your tuition payments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Notifications */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-foreground mb-4">Notifications</h2>
            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <Alert key={notif.id} className={`${getNotificationStyle(notif.type)} border`}>
                    <Bell className="h-4 w-4" />
                    <div className="ml-2">
                      <p className="font-medium text-sm">{notif.title}</p>
                      <p className="text-xs mt-1 opacity-90">{notif.message}</p>
                      <p className="text-xs mt-2 opacity-75">{new Date(notif.date).toLocaleDateString()}</p>
                    </div>
                  </Alert>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No notifications</p>
              )}
            </div>
          </div>

          {/* Tuition History */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-foreground mb-4">Tuition History</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border">
                      <tr>
                        <th className="text-left py-2 font-medium">Semester</th>
                        <th className="text-left py-2 font-medium">Amount</th>
                        <th className="text-left py-2 font-medium">Status</th>
                        <th className="text-left py-2 font-medium">Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record) => (
                        <tr key={record.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 font-medium">{record.semester}</td>
                          <td className="py-3 font-medium">${record.amount.toLocaleString()}</td>
                          <td className="py-3">
                            <Badge className={getStatusColor(record.status)} variant="outline">
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3">{new Date(record.dueDate).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
