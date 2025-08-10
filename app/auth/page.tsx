"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight, User, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"

// Validation types
interface ValidationResult {
  isValid: boolean
  message: string
}

interface SignUpValidation {
  name: ValidationResult
  email: ValidationResult
  password: ValidationResult
  confirmPassword: ValidationResult
}

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
    rememberMe: false
  })
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: ""
  })
  const [willBeAdmin, setWillBeAdmin] = useState<{ willBeAdmin: boolean; reason: 'first_user' | 'env_match' | null } | null>(null)

  // Validation state for signup
  const [validation, setValidation] = useState<SignUpValidation>({
    name: { isValid: false, message: "" },
    email: { isValid: false, message: "" },
    password: { isValid: false, message: "" },
    confirmPassword: { isValid: false, message: "" }
  })
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  })

  // Validation functions
  const validateName = (name: string): ValidationResult => {
    if (!name.trim()) {
      return { isValid: false, message: "Name is required" }
    }
    if (name.trim().length < 2) {
      return { isValid: false, message: "Name must be at least 2 characters" }
    }
    if (name.trim().length > 50) {
      return { isValid: false, message: "Name must be less than 50 characters" }
    }
    return { isValid: true, message: "Good!" }
  }

  const validateEmail = (email: string): ValidationResult => {
    if (!email) {
      return { isValid: false, message: "Email is required" }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { isValid: false, message: "Please enter a valid email address" }
    }
    return { isValid: true, message: "Valid email format" }
  }

  const validatePassword = (password: string): ValidationResult => {
    if (!password) {
      return { isValid: false, message: "Password is required" }
    }
    if (password.length < 8) {
      return { isValid: false, message: "Password must be at least 8 characters" }
    }
    
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    const missingRequirements = []
    if (!hasUppercase) missingRequirements.push("uppercase letter")
    if (!hasLowercase) missingRequirements.push("lowercase letter")
    if (!hasNumbers) missingRequirements.push("number")
    if (!hasSpecialChar) missingRequirements.push("special character")
    
    if (missingRequirements.length > 0) {
      return { 
        isValid: false, 
        message: `Password needs: ${missingRequirements.join(", ")}` 
      }
    }
    
    return { isValid: true, message: "Strong password!" }
  }

  const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
    if (!confirmPassword) {
      return { isValid: false, message: "Please confirm your password" }
    }
    if (password !== confirmPassword) {
      return { isValid: false, message: "Passwords don't match" }
    }
    return { isValid: true, message: "Passwords match!" }
  }

  // Real-time validation effect
  useEffect(() => {
    setValidation({
      name: validateName(signUpData.name),
      email: validateEmail(signUpData.email),
      password: validatePassword(signUpData.password),
      confirmPassword: validateConfirmPassword(signUpData.password, signUpData.confirmPassword)
    })
  }, [signUpData])

  // Check if this signup will create an admin
  useEffect(() => {
    const run = async () => {
      const email = signUpData.email.trim()
      if (!email) { setWillBeAdmin(null); return }
      try {
        const res = await fetch(`/api/auth/will-be-admin?email=${encodeURIComponent(email)}`)
        if (!res.ok) return
        const data = await res.json()
        if (data?.success) {
          setWillBeAdmin(data.data)
        }
      } catch {
        // ignore
      }
    }
    run()
  }, [signUpData.email])

  const handleFieldBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const isFormValid = () => {
    return Object.values(validation).every(field => field.isValid)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: signInData.email,
          password: signInData.password,
          rememberMe: signInData.rememberMe
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Login failed')
      }

      if (data.success) {
        // Redirect to main page
        setTimeout(() => {
          window.location.href = '/'
        }, 100) // Small delay to ensure cookies are set
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      setError(error.message || 'An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Mark all fields as touched to show validation errors
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    })

    if (!isFormValid()) {
      setError("Please fix the validation errors below")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: signUpData.email,
          password: signUpData.password,
          confirmPassword: signUpData.confirmPassword,
          name: signUpData.name
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Registration failed')
      }

      if (data.success) {
        // Redirect to main page
        setTimeout(() => {
          window.location.href = '/'
        }, 100) // Small delay to ensure cookies are set
      }
    } catch (error: any) {
      console.error('Sign up error:', error)
      setError(error.message || 'An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to get input classes based on validation state
  const getInputClasses = (field: keyof typeof validation, baseClasses: string) => {
    if (!touched[field]) return baseClasses
    
    const fieldValidation = validation[field]
    if (fieldValidation.isValid) {
      return `${baseClasses} border-green-300 focus:border-green-500 focus:ring-green-200`
    } else {
      return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-200`
    }
  }

  // Helper function to render validation message
  const renderValidationMessage = (field: keyof typeof validation) => {
    if (!touched[field]) return null
    
    const fieldValidation = validation[field]
    const isValid = fieldValidation.isValid
    
    return (
      <div className={`flex items-center gap-1 text-xs mt-1 ${isValid ? 'text-green-600' : 'text-red-600'}`}>
        {isValid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
        <span>{fieldValidation.message}</span>
      </div>
    )
  }

  return (
    <div className="app-page flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="icon-brand shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl text-brand">
              WishNest
            </h1>
          </div>
          <p className="text-slate-600">Welcome back! Sign in to your account or create a new one.</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Auth Card */}
        <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-none">
              <TabsTrigger
                value="signin"
                className="rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin" className="mt-0">
              <CardHeader className="pb-4 pt-8 px-8">
                <CardTitle className="text-2xl font-bold text-slate-800">Welcome back</CardTitle>
                <CardDescription className="text-slate-600">Sign in to access your family wishlist</CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-slate-700 font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signInData.email}
                        onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                        className="pl-10 border-slate-300 rounded-xl h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-slate-700 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={signInData.password}
                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                        className="pl-10 pr-10 border-slate-300 rounded-xl h-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember-me" 
                      checked={signInData.rememberMe}
                      onCheckedChange={(checked) => setSignInData({ ...signInData, rememberMe: !!checked })}
                    />
                    <Label htmlFor="remember-me" className="text-sm text-slate-700">
                      Remember me
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary text-white h-12 shadow-lg hover:shadow-xl font-medium"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                    Forgot your password?
                  </button>
                </div>
              </CardContent>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup" className="mt-0">
              <CardHeader className="pb-4 pt-8 px-8">
                <CardTitle className="text-2xl font-bold text-slate-800">Create account</CardTitle>
                <CardDescription className="text-slate-600">Join your family's wishlist community</CardDescription>
                {willBeAdmin?.willBeAdmin && (
                  <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                    You are creating an admin account
                    {willBeAdmin.reason === 'first_user' && ' (first user)'}
                    {willBeAdmin.reason === 'env_match' && ' (admin email matched)'}.
                  </div>
                )}
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-slate-700 font-medium">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={signUpData.name}
                        onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                        onBlur={() => handleFieldBlur('name')}
                        className={getInputClasses('name', "pl-10 rounded-xl h-12")}
                        required
                      />
                      {touched.name && validation.name.isValid && (
                        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                      )}
                    </div>
                    {renderValidationMessage('name')}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-slate-700 font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        onBlur={() => handleFieldBlur('email')}
                        className={getInputClasses('email', "pl-10 rounded-xl h-12")}
                        required
                      />
                      {touched.email && validation.email.isValid && (
                        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                      )}
                    </div>
                    {renderValidationMessage('email')}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-slate-700 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        onBlur={() => handleFieldBlur('password')}
                        className={getInputClasses('password', "pl-10 pr-10 rounded-xl h-12")}
                        required
                        minLength={8}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        {touched.password && validation.password.isValid && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    {renderValidationMessage('password')}
                    {!touched.password && (
                      <p className="text-xs text-slate-500">
                        Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-slate-700 font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                        onBlur={() => handleFieldBlur('confirmPassword')}
                        className={getInputClasses('confirmPassword', "pl-10 rounded-xl h-12")}
                        required
                        minLength={8}
                      />
                      {touched.confirmPassword && validation.confirmPassword.isValid && (
                        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                      )}
                    </div>
                    {renderValidationMessage('confirmPassword')}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !isFormValid()}
                    className="w-full btn-primary text-white h-12 shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating account...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Create Account
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-xs text-slate-500">
                    By creating an account, you agree to our{" "}
                    <button className="text-purple-600 hover:text-purple-700 font-medium">Terms of Service</button> and{" "}
                    <button className="text-purple-600 hover:text-purple-700 font-medium">Privacy Policy</button>
                  </p>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-slate-500">
            Need help? Contact{" "}
            <button className="text-purple-600 hover:text-purple-700 font-medium">support@wishnest.com</button>
          </p>
        </div>
      </div>
    </div>
  )
}
