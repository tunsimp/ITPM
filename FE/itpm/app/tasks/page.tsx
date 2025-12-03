"use client"

import { useEffect, useState } from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { getTasks, updateTask, createTask } from "@/lib/tasks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Clock, AlertCircle } from "lucide-react"
import { TasksSkeleton } from "@/components/skeletons"

interface Task {
  id: string
  title: string
  course: string
  dueDate: string
  status: "pending" | "completed"
  priority: "low" | "medium" | "high"
  reminder?: boolean
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("pending")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    course: "",
    dueDate: "",
    priority: "medium",
    reminder: false,
  })

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getTasks()
        setTasks(data)
      } catch (error) {
        console.error("Failed to fetch tasks:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const handleToggleTask = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed"
    const updated = await updateTask(id, { status: newStatus as "pending" | "completed" })
    setTasks(tasks.map((t) => (t.id === id ? updated : t)))
  }

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.course || !newTask.dueDate) return

    const created = await createTask({
      title: newTask.title,
      course: newTask.course,
      dueDate: newTask.dueDate,
      status: "pending",
      priority: newTask.priority as "low" | "medium" | "high",
      reminder: newTask.reminder,
    })

    setTasks([...tasks, created])
    setNewTask({ title: "", course: "", dueDate: "", priority: "medium", reminder: false })
    setDialogOpen(false)
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true
    return task.status === filter
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.status !== b.status) return a.status === "pending" ? -1 : 1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diff = due.getTime() - today.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
  }

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case "high":
        return <div className="w-1 h-6 bg-red-500 rounded-full" />
      case "medium":
        return <div className="w-1 h-6 bg-yellow-500 rounded-full" />
      default:
        return <div className="w-1 h-6 bg-blue-500 rounded-full" />
    }
  }

  const getDueDateColor = (daysLeft: number) => {
    if (daysLeft < 0) return "text-red-600"
    if (daysLeft <= 3) return "text-red-500"
    if (daysLeft <= 7) return "text-orange-500"
    return "text-muted-foreground"
  }

  const getDueDateLabel = (daysLeft: number) => {
    if (daysLeft < 0) return "Overdue"
    if (daysLeft === 0) return "Today"
    if (daysLeft === 1) return "Tomorrow"
    if (daysLeft <= 7) return `In ${daysLeft} days`
    return new Date(new Date().getTime() + daysLeft * 24 * 60 * 60 * 1000).toLocaleDateString()
  }

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="p-8">
          <TasksSkeleton />
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="p-8 max-w-3xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Tasks</h1>
            <p className="text-muted-foreground mt-1">
              {filteredTasks.length} {filter === "completed" ? "completed" : filter === "pending" ? "pending" : "total"}
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-full w-14 h-14 p-0 flex items-center justify-center">
                <Plus className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Title</label>
                  <Input
                    placeholder="What do you need to do?"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Course</label>
                  <Input
                    placeholder="MATH101"
                    value={newTask.course}
                    onChange={(e) => setNewTask({ ...newTask, course: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Due Date</label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Priority</label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Checkbox
                    id="reminder"
                    checked={newTask.reminder}
                    onCheckedChange={(checked) => setNewTask({ ...newTask, reminder: checked as boolean })}
                  />
                  <label htmlFor="reminder" className="text-sm font-medium text-foreground cursor-pointer">
                    Add reminder
                  </label>
                </div>
                <Button onClick={handleCreateTask} className="w-full mt-6">
                  Add Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {["pending", "completed", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as "all" | "pending" | "completed")}
              className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-foreground hover:bg-secondary"
              }`}
            >
              {f === "all" ? "All" : f === "pending" ? "Pending" : "Completed"}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {sortedTasks.length > 0 ? (
            sortedTasks.map((task) => {
              const daysLeft = getDaysUntilDue(task.dueDate)
              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                    task.status === "completed"
                      ? "bg-muted/50 opacity-60"
                      : "bg-card hover:bg-secondary/50 border border-border"
                  }`}
                >
                  <Checkbox
                    checked={task.status === "completed"}
                    onCheckedChange={() => handleToggleTask(task.id, task.status)}
                    className="w-6 h-6"
                  />

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-medium text-foreground ${
                        task.status === "completed" ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground font-medium">{task.course}</span>
                      <span className={`text-xs font-medium ${getDueDateColor(daysLeft)}`}>
                        {getDueDateLabel(daysLeft)}
                      </span>
                    </div>
                  </div>

                  {/* Priority indicator */}
                  <div className="flex items-center gap-3">
                    {task.reminder && <Clock className="w-4 h-4 text-primary" />}
                    {getPriorityIndicator(task.priority)}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground text-lg">
                {filter === "completed" ? "No completed tasks" : "All done!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  )
}
