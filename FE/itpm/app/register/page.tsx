"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        studentId: "",
        emailAlerts: true,
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess(false)

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters")
            return
        }

        // Check password requirements
        const hasUpperCase = /[A-Z]/.test(formData.password)
        const hasLowerCase = /[a-z]/.test(formData.password)
        const hasNumber = /\d/.test(formData.password)
        const hasSpecial = /\W/.test(formData.password)

        if (!hasUpperCase || !hasLowerCase || (!hasNumber && !hasSpecial)) {
            setError(
                "Password must contain uppercase, lowercase, and number/special character"
            )
            return
        }

        // Validate student ID format (e.g., ITITIU22xxx)
        const studentIdPattern = /^[A-Z]{2,10}\d{5,10}$/
        if (!studentIdPattern.test(formData.studentId)) {
            setError("Invalid student ID format (e.g., ITITIU22001)")
            return
        }

        setLoading(true)

        try {
            await registerUser({
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName,
                studentId: formData.studentId,
                emailAlerts: formData.emailAlerts,
            })
            setSuccess(true)
            setTimeout(() => {
                router.push("/login")
            }, 2000)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg border-primary/10">
                <CardHeader className="space-y-2 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                            <BookOpen className="w-7 h-7 text-primary-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                    <p className="text-muted-foreground">Sign up for AcademiHub</p>
                </CardHeader>
                <CardContent>
                    {success && (
                        <Alert className="mb-4 bg-green-50 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                Account created successfully! Redirecting to login...
                            </AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                                Full Name
                            </label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="studentId" className="text-sm font-medium text-foreground">
                                Student ID
                            </label>
                            <Input
                                id="studentId"
                                type="text"
                                placeholder="ITITIU22001"
                                value={formData.studentId}
                                onChange={(e) => setFormData({ ...formData, studentId: e.target.value.toUpperCase() })}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Format: Letters followed by numbers (e.g., ITITIU22001)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-foreground">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your.email@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-foreground">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="At least 8 characters"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Must contain uppercase, lowercase, and number/special character
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                                Confirm Password
                            </label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Re-enter your password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="emailAlerts"
                                checked={formData.emailAlerts}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, emailAlerts: checked === true })
                                }
                            />
                            <label
                                htmlFor="emailAlerts"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Enable email alerts
                            </label>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading || success}>
                            {loading ? "Creating account..." : success ? "Account created!" : "Create Account"}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground mt-4">
                            Already have an account?{" "}
                            <a href="/login" className="text-primary hover:underline">
                                Sign in here
                            </a>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

