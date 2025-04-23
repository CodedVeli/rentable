import { useAuth } from '@/hooks/use-auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { Redirect } from 'wouter'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { insertUserSchema } from '@shared/schema'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SignIn, SignUp, useUser } from '@clerk/clerk-react'
import { RoleSelect, UserRole } from '@/components/auth/RoleSelect'
import { useClerkRoleSync } from '@/hooks/use-clerk-role-sync'

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

// Register form schema (extends insertUserSchema from shared schema)
const registerSchema = insertUserSchema
  .extend({
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// Types
type LoginFormValues = z.infer<typeof loginSchema>
type RegisterFormValues = z.infer<typeof registerSchema>

import { useLocation } from 'wouter'

export default function AuthPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const { user: clerkUser } = useUser()
  useClerkRoleSync(selectedRole)

  // Set selectedRole from ?role=... in URL if present
  const [location] = useLocation()
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlRole = params.get('role')
    if (
      (urlRole === 'tenant' || urlRole === 'landlord') &&
      selectedRole !== urlRole
    ) {
      setSelectedRole(urlRole as UserRole)
      localStorage.setItem('selectedRole', urlRole)
    }
  }, [selectedRole])

  const { isLoading, loginMutation, registerMutation } = useAuth()
  const [activeTab, setActiveTab] = useState<string>('login')

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'tenant',
      clerkId: '',
    },
  })

  // Handle form submissions
  //const onLoginSubmit = (data: LoginFormValues) => {
  //loginMutation.mutate(data)
  //}

  // Remove confirmPassword as it's not in the backend schema
  //const onRegisterSubmit = (data: RegisterFormValues) => {
  //const { confirmPassword, ...userData } = data
  //registerMutation.mutate(userData)
  //}

  // Redirect if already logged in
  // Redirect for legacy auth (non-Clerk)

  // Redirect after Clerk registration if role is selected and Clerk user is present
  if (clerkUser && selectedRole) {
    const redirectTo =
      selectedRole === 'landlord' ? '/landlord/dashboard' : '/tenant/dashboard'
    return <Redirect to={redirectTo} />
  }
  useEffect(() => {
    let didSync = false
    if (clerkUser && selectedRole && !didSync) {
      console.log('Syncing Clerk user to backend...')
      const userData = {
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        role: selectedRole,
        clerkId: clerkUser.id,
      }
      fetch('/api/clerk-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      }).catch((err) => {
        // Optionally show a toast or error message
        console.error('Failed to sync Clerk user to backend:', err)
      })
      didSync = true
    }
  }, [clerkUser, selectedRole])

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 dashboard-container'>
      <div className='w-full  max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Hero Section */}
        <div className='hidden lg:flex flex-col justify-center p-8 bg-primary-700 text-black rounded-lg'>
          <div className='mb-4'>
            <div className='w-12 h-12 rounded bg-white flex items-center justify-center text-primary-700 font-bold text-xl mb-6'>
              R
            </div>
            <h1 className='text-4xl font-bold mb-4'>Rentr</h1>
            <p className='text-xl mb-6'>
              Ontario's premier platform for landlords and tenants
            </p>
          </div>

          <div className='space-y-6'>
            <div className='flex items-start space-x-4'>
              <div className='bg-primary-600 p-2 rounded-full'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
                  <polyline points='22 4 12 14.01 9 11.01' />
                </svg>
              </div>
              <div>
                <h3 className='text-lg font-medium'>
                  Streamlined Property Management
                </h3>
                <p className='text-primary-100'>
                  Manage all your properties, leases, and tenants in one place
                </p>
              </div>
            </div>

            <div className='flex items-start space-x-4'>
              <div className='bg-primary-600 p-2 rounded-full'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
                  <polyline points='22 4 12 14.01 9 11.01' />
                </svg>
              </div>
              <div>
                <h3 className='text-lg font-medium'>
                  Secure Ontario-Compliant Leases
                </h3>
                <p className='text-primary-100'>
                  Digital lease agreements compliant with Ontario regulations
                </p>
              </div>
            </div>

            <div className='flex items-start space-x-4'>
              <div className='bg-primary-600 p-2 rounded-full'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
                  <polyline points='22 4 12 14.01 9 11.01' />
                </svg>
              </div>
              <div>
                <h3 className='text-lg font-medium'>
                  Seamless Rent Collection
                </h3>
                <p className='text-primary-100'>
                  Automated rent collection and payment tracking
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Forms */}
        <div>
          <Card className='border-none shadow-lg'>
            <CardHeader className='text-center'>
              <div className='flex items-center justify-center lg:hidden mb-4'>
                <div className='w-10 h-10 rounded bg-primary-600 flex items-center justify-center text-white font-bold text-xl mr-2'>
                  R
                </div>
                <CardTitle className='text-2xl'>Rentr</CardTitle>
              </div>
              <CardTitle className='text-2xl'>Welcome to Rentr</CardTitle>
              <CardDescription>
                Manage your real estate journey in Ontario with ease
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className='w-full'
              >
                <TabsList className='grid w-full grid-cols-2 mb-6'>
                  <TabsTrigger value='login'>Login</TabsTrigger>
                  <TabsTrigger value='register'>Register</TabsTrigger>
                </TabsList>

                {/* Login Form */}
                <TabsContent
                  value='login'
                  className='flex items-center justify-center'
                >
                  <SignIn fallbackRedirectUrl="/auth-redirect" />
                </TabsContent>

                {/* Register Form */}
                <TabsContent
                  value='register'
                  className='flex flex-col items-center justify-center gap-6'
                >
                  {!selectedRole && (
                    <RoleSelect
                      value={selectedRole}
                      onChange={(role) => {
                        setSelectedRole(role)
                        localStorage.setItem('selectedRole', role)
                      }}
                    />
                  )}
                  {selectedRole && <SignUp fallbackRedirectUrl='/onboard' />}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className='flex flex-col space-y-4'>
              <div className='text-xs text-center text-gray-500 mt-2'>
                By signing up, you agree to our Terms of Service and Privacy
                Policy
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
