"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedLayout } from "@/components/protected-layout"
import { useAuthStore } from "@/lib/store"
import {
  getGrades,
  predictGpa,
  analyzeGrades,
  gradeToGpa,
  type ProcessedGradesData,
  type GradeRecord,
} from "@/lib/grades"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GradesSkeleton } from "@/components/skeletons"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  PolarAngleAxis,
} from "recharts"

export default function GradesPage() {
  const router = useRouter()
  const { credentials, isAuthenticated } = useAuthStore()
  const [gradesData, setGradesData] = useState<ProcessedGradesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [predictor, setPredictor] = useState({
    currentGpa: 2.72,
    totalCredits: 115,
    targetGpa: 3.2,
  })
  const [prediction, setPrediction] = useState("")
  const [predictorLoading, setPredictorLoading] = useState(false)
  const [selectedSemester, setSelectedSemester] = useState<string>("all")

  useEffect(() => {
    if (!isAuthenticated || !credentials) {
      router.push("/login")
      return
    }

    const fetchGrades = async () => {
      try {
        const data = await getGrades({
          username: credentials.username,
          password: credentials.password,
        })
        setGradesData(data)
        if (data.gradeProjection) {
          setPredictor({
            currentGpa: data.gradeProjection.current_cgpa,
            totalCredits: data.gradeProjection.total_credits,
            targetGpa: 3.2,
          })
        }
      } catch (err) {
        console.error("Failed to fetch grades:", err)
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch grades. Please make sure the API server is running."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchGrades()
  }, [credentials, isAuthenticated, router])

  const handlePredict = async () => {
    setPredictorLoading(true)
    try {
      const result = await predictGpa(predictor)
      setPrediction(result)
    } catch (err) {
      console.error("Failed to predict:", err)
    } finally {
      setPredictorLoading(false)
    }
  }

  const getGradeColor = (grade: string) => {
    if (["A", "A+"].includes(grade)) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
    if (["A-", "B+"].includes(grade)) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    if (["B", "B-"].includes(grade)) return "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200"
    if (["C+", "C"].includes(grade)) return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
    if (["C-", "D+", "D", "D-"].includes(grade)) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
    if (grade === "F") return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
  }

  const getGradeHexColor = (grade: string) => {
    if (["A", "A+"].includes(grade)) return "#10b981"
    if (["A-", "B+"].includes(grade)) return "#3b82f6"
    if (["B", "B-"].includes(grade)) return "#0ea5e9"
    if (["C+", "C"].includes(grade)) return "#f59e0b"
    if (["C-", "D+", "D", "D-"].includes(grade)) return "#f97316"
    if (grade === "F") return "#ef4444"
    return "#6b7280"
  }

  const getProjectionStatusColor = (status: string, achievable: boolean) => {
    if (!achievable) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    if (status === "current") return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    if (status === "higher") return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
  }

  const getDisplayedCourses = (): GradeRecord[] => {
    if (!gradesData) return []
    if (selectedSemester === "all") return gradesData.allCourses
    const semester = gradesData.semesters.find((s) => s.semester === selectedSemester)
    return semester?.courses.filter((c) => c.grade && c.grade !== "" && c.grade !== "NA") || []
  }

  const getGpaChartData = () => {
    if (!gradesData) return []
    return gradesData.semesters
      .filter((s) => s.semesterGpa !== undefined)
      .map((s, idx) => ({
        name: `Sem ${idx + 1}`,
        fullName: s.semester,
        gpa: s.semesterGpa,
        cumulative: s.cumulativeGpa,
        credits: s.creditsPassed,
      }))
  }

  const getGradeDistribution = () => {
    const courses = getDisplayedCourses()
    const dist: Record<string, number> = {}
    courses.forEach((g) => {
      if (g.grade && g.grade !== "NA") {
        dist[g.grade] = (dist[g.grade] || 0) + 1
      }
    })
    return Object.entries(dist)
      .map(([name, value]) => ({ 
        name, 
        value,
        fill: getGradeHexColor(name),
      }))
      .sort((a, b) => gradeToGpa(b.name) - gradeToGpa(a.name))
  }

  const getCreditsByGrade = () => {
    const courses = getDisplayedCourses()
    const creditMap: Record<string, number> = {}
    courses.forEach((g) => {
      if (g.grade && g.grade !== "NA") {
        creditMap[g.grade] = (creditMap[g.grade] || 0) + g.credits
      }
    })
    return Object.entries(creditMap)
      .map(([grade, credits]) => ({ 
        grade, 
        credits,
        fill: getGradeHexColor(grade),
      }))
      .sort((a, b) => gradeToGpa(b.grade) - gradeToGpa(a.grade))
  }

  const getGpaProgressData = () => {
    if (!gradesData) return []
    const cgpa = gradesData.gradeProjection.current_cgpa
    const percentage = (cgpa / 4.0) * 100
    return [
      {
        name: "GPA",
        value: percentage,
        fill: cgpa >= 3.6 ? "#10b981" : cgpa >= 3.2 ? "#3b82f6" : cgpa >= 2.5 ? "#f59e0b" : "#ef4444",
      },
    ]
  }

  const getCreditsProgressData = () => {
    if (!gradesData) return []
    const total = gradesData.gradeProjection.total_credits
    const remaining = gradesData.gradeProjection.remaining_credits
    const target = total + remaining
    const percentage = (total / target) * 100
    return [
      {
        name: "Credits",
        value: percentage,
        fill: "#8b5cf6",
      },
    ]
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-sm text-foreground">{payload[0]?.payload?.fullName || label}</p>
          {payload.map((entry: { name: string; value: number; color: string }, idx: number) => (
            <p key={idx} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value?.toFixed(2)}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="p-8">
          <GradesSkeleton />
        </div>
      </ProtectedLayout>
    )
  }

  if (error) {
    return (
      <ProtectedLayout>
        <div className="p-8">
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedLayout>
    )
  }

  if (!gradesData) return null

  const { studentInfo, semesters, gradeProjection, lastUpdated } = gradesData

  return (
    <ProtectedLayout>
      <div className="p-8">
        {/* Header with Student Info */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Academic Grades</h1>
              <p className="text-muted-foreground mt-1">
                {studentInfo.ten_sinh_vien} • {studentInfo.ma_sinh_vien}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-sm">
                {studentInfo.khoa}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {studentInfo.nganh}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {studentInfo.khoa_hoc}
              </Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{lastUpdated}</p>
        </div>

        {/* Progress Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* GPA Gauge */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current CGPA</p>
                  <p className="text-4xl font-bold mt-1">{gradeProjection.current_cgpa.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground mt-1">{gradeProjection.current_classification_en}</p>
                </div>
                <div className="w-20 h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      innerRadius="70%"
                      outerRadius="100%"
                      data={getGpaProgressData()}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                      <RadialBar
                        background={{ fill: "hsl(var(--muted))" }}
                        dataKey="value"
                        cornerRadius={10}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${(gradeProjection.current_cgpa / 4) * 100}%`,
                    background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0.00</span>
                <span>4.00</span>
              </div>
            </CardContent>
          </Card>

          {/* Credits Progress */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Credits Progress</p>
                  <p className="text-4xl font-bold mt-1">{gradeProjection.total_credits}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    of {gradeProjection.total_credits + gradeProjection.remaining_credits} total
                  </p>
                </div>
                <div className="w-20 h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      innerRadius="70%"
                      outerRadius="100%"
                      data={getCreditsProgressData()}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                      <RadialBar
                        background={{ fill: "hsl(var(--muted))" }}
                        dataKey="value"
                        cornerRadius={10}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${(gradeProjection.total_credits / (gradeProjection.total_credits + gradeProjection.remaining_credits)) * 100}%`,
                    background: "linear-gradient(90deg, #8b5cf6, #ec4899)",
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0</span>
                <span>{gradeProjection.total_credits + gradeProjection.remaining_credits}</span>
              </div>
            </CardContent>
          </Card>

          {/* Remaining Credits */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10" />
            <CardContent className="pt-6 relative">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-4xl font-bold mt-1">{gradeProjection.remaining_credits}</p>
              <p className="text-sm text-muted-foreground mt-1">credits to graduate</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${(gradeProjection.remaining_credits / (gradeProjection.total_credits + gradeProjection.remaining_credits)) * 100}%`,
                      background: "linear-gradient(90deg, #f59e0b, #f97316)",
                    }}
                  />
                </div>
                <span className="text-xs font-medium">
                  {Math.round((gradeProjection.remaining_credits / (gradeProjection.total_credits + gradeProjection.remaining_credits)) * 100)}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Classification */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10" />
            <CardContent className="pt-6 relative">
              <p className="text-sm text-muted-foreground">Classification</p>
              <p className="text-3xl font-bold mt-1">{gradeProjection.current_classification}</p>
              <p className="text-sm text-muted-foreground mt-1">{gradeProjection.current_classification_en}</p>
              <div className="mt-4">
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                  {semesters.length} Semesters Completed
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="grades" className="mt-8">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="projection">Projection</TabsTrigger>
            <TabsTrigger value="predictor">Predictor</TabsTrigger>
            <TabsTrigger value="charts">Analytics</TabsTrigger>
          </TabsList>

          {/* All Grades Tab */}
          <TabsContent value="grades" className="mt-6 space-y-6">
            {/* Semester Filter */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
              <Button
                variant={selectedSemester === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSemester("all")}
              >
                All Semesters
              </Button>
              {semesters.map((sem) => (
                <Button
                  key={sem.semester}
                  variant={selectedSemester === sem.semester ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSemester(sem.semester)}
                >
                  {sem.semester.replace("Học kỳ ", "HK").replace(" - Năm học ", " ")}
                </Button>
              ))}
            </div>

            {/* Grades Table */}
            <Card>
              <CardHeader>
                <CardTitle>Course Grades</CardTitle>
                <CardDescription>
                  {selectedSemester === "all"
                    ? `Showing all ${getDisplayedCourses().length} completed courses`
                    : `Showing courses for ${selectedSemester}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border">
                      <tr>
                        <th className="text-left py-3 px-2 font-medium">#</th>
                        <th className="text-left py-3 px-2 font-medium">Course Code</th>
                        <th className="text-left py-3 px-2 font-medium">Course Name</th>
                        <th className="text-center py-3 px-2 font-medium">Credits</th>
                        <th className="text-center py-3 px-2 font-medium">Score</th>
                        <th className="text-center py-3 px-2 font-medium">Grade</th>
                        <th className="text-center py-3 px-2 font-medium">GPA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getDisplayedCourses().map((course, idx) => (
                        <tr key={`${course.courseCode}-${idx}`} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-2 text-muted-foreground">{idx + 1}</td>
                          <td className="py-3 px-2 font-mono text-sm">{course.courseCode}</td>
                          <td className="py-3 px-2">{course.courseName}</td>
                          <td className="py-3 px-2 text-center">{course.credits}</td>
                          <td className="py-3 px-2 text-center font-medium">{course.score || "-"}</td>
                          <td className="py-3 px-2 text-center">
                            <Badge className={getGradeColor(course.grade)}>{course.grade}</Badge>
                          </td>
                          <td className="py-3 px-2 text-center font-medium">{gradeToGpa(course.grade).toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Grade Projection Tab */}
          <TabsContent value="projection" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Grade Classification Projections</CardTitle>
                <CardDescription>
                  Based on your current CGPA of {gradeProjection.current_cgpa.toFixed(2)} with{" "}
                  {gradeProjection.remaining_credits} remaining credits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(gradeProjection.projections)
                    .sort(([, a], [, b]) => b.target_min_gpa - a.target_min_gpa)
                    .map(([classification, details]) => (
                      <Card
                        key={classification}
                        className={`${
                          details.status === "current" ? "ring-2 ring-primary" : ""
                        }`}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">{classification}</h3>
                            <Badge className={getProjectionStatusColor(details.status, details.achievable)}>
                              {details.achievable ? "Achievable" : "Not Achievable"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{details.classification_en}</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Target Min GPA:</span>
                              <span className="font-medium">{details.target_min_gpa.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Required GPA (Remaining):</span>
                              <span
                                className={`font-medium ${
                                  details.required_gpa_remaining > 4.0 ? "text-red-500" : ""
                                }`}
                              >
                                {details.required_gpa_remaining.toFixed(2)}
                              </span>
                            </div>
                            {details.status === "current" && (
                              <div className="mt-2 pt-2 border-t border-border">
                                <span className="text-primary font-medium">← Current Classification</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GPA Predictor Tab */}
          <TabsContent value="predictor" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>GPA Predictor</CardTitle>
                <CardDescription>Calculate what GPA you need to achieve your target</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 max-w-lg">
                  <div>
                    <label className="text-sm font-medium text-foreground">Current CGPA</label>
                    <Input
                      type="number"
                      min="0"
                      max="4"
                      step="0.01"
                      value={predictor.currentGpa}
                      onChange={(e) => setPredictor({ ...predictor, currentGpa: Number.parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Total Credits Passed</label>
                    <Input
                      type="number"
                      min="0"
                      value={predictor.totalCredits}
                      onChange={(e) => setPredictor({ ...predictor, totalCredits: Number.parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Target GPA</label>
                    <Input
                      type="number"
                      min="0"
                      max="4"
                      step="0.01"
                      value={predictor.targetGpa}
                      onChange={(e) => setPredictor({ ...predictor, targetGpa: Number.parseFloat(e.target.value) })}
                    />
                  </div>
                  <Button onClick={handlePredict} disabled={predictorLoading} className="w-full">
                    {predictorLoading ? "Calculating..." : "Calculate"}
                  </Button>
                  {prediction && (
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-foreground">{prediction}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="charts" className="mt-6 space-y-6">
            {/* GPA Trend - Area Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📈 GPA Journey</CardTitle>
                <CardDescription>Track your academic progress over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getGpaChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="name" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        domain={[0, 4]}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value.toFixed(1)}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="gpa"
                        name="Semester GPA"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorGpa)"
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 8, stroke: "#fff", strokeWidth: 2 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="cumulative"
                        name="Cumulative GPA"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorCumulative)"
                        dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 8, stroke: "#fff", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Grade Distribution - Horizontal Bar */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📊 Grade Distribution</CardTitle>
                  <CardDescription>Number of courses per grade</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={getGradeDistribution()} 
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          stroke="hsl(var(--muted-foreground))" 
                          fontSize={12}
                          width={40}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--background))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`${value} courses`, "Count"]}
                        />
                        <Bar 
                          dataKey="value" 
                          radius={[0, 8, 8, 0]}
                          barSize={24}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Credits by Grade - Styled Bar */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📚 Credits Earned</CardTitle>
                  <CardDescription>Total credits per grade category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getCreditsByGrade()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                          {getCreditsByGrade().map((entry, index) => (
                            <linearGradient key={index} id={`gradient-${entry.grade}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={entry.fill} stopOpacity={1}/>
                              <stop offset="100%" stopColor={entry.fill} stopOpacity={0.6}/>
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis 
                          dataKey="grade" 
                          stroke="hsl(var(--muted-foreground))" 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))" 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--background))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`${value} credits`, "Credits"]}
                        />
                        <Bar 
                          dataKey="credits" 
                          radius={[8, 8, 0, 0]}
                          barSize={40}
                        >
                          {getCreditsByGrade().map((entry, index) => (
                            <defs key={`cell-def-${index}`}>
                              <linearGradient id={`bar-gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={entry.fill} stopOpacity={1}/>
                                <stop offset="100%" stopColor={entry.fill} stopOpacity={0.7}/>
                              </linearGradient>
                            </defs>
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📋 Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 rounded-lg">
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {getDisplayedCourses().filter(c => ["A", "A+", "A-"].includes(c.grade)).length}
                    </p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">A Grades</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {getDisplayedCourses().filter(c => ["B", "B+", "B-"].includes(c.grade)).length}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">B Grades</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 rounded-lg">
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                      {getDisplayedCourses().filter(c => ["C", "C+", "C-"].includes(c.grade)).length}
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">C Grades</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg">
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {getDisplayedCourses().reduce((sum, c) => sum + c.credits, 0)}
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Total Credits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedLayout>
  )
}
