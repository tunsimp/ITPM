"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Calendar, ClipboardList, GraduationCap, TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const { user } = useAuthStore()

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const features = [
    {
      icon: TrendingUp,
      title: "Track Your GPA",
      description: "Monitor your academic progress with real-time grade tracking and GPA calculations",
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
    {
      icon: Calendar,
      title: "Class Schedule",
      description: "View your weekly schedule, class times, and room assignments at a glance",
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: ClipboardList,
      title: "Task Management",
      description: "Stay on top of assignments, projects, and deadlines with smart task tracking",
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
  ]

  const benefits = [
    "Access your academic information anytime, anywhere",
    "Real-time updates on grades and assignments",
    "Easy-to-use interface designed for students",
    "Secure and reliable platform",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">AcademiHub</span>
            </div>
            <Link href="/login">
              <Button variant="default" size="sm" className="gap-2">
                Sign In
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <GraduationCap className="w-4 h-4" />
            Your Academic Journey Starts Here
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Manage Your Studies
            <br />
            <span className="text-primary">Effortlessly</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            AcademiHub brings all your academic information together in one place.
            Track grades, manage tasks, view schedules, and stay on top of your education.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="gap-2 text-base px-8 py-6">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Benefits List */}
          <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-secondary/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              All your academic tools in one powerful platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 group"
              >
                <CardContent className="pt-6 pb-6">
                  <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-primary/20">
            <CardContent className="py-12 px-8 text-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Sign in to access your personalized academic dashboard and take control of your educational journey.
              </p>
              <Link href="/login">
                <Button size="lg" className="gap-2 px-8">
                  Sign In Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">AcademiHub</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AcademiHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
