import { useAuth } from '@/hooks/use-auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {  useState } from 'react'
import { Redirect } from 'wouter'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { insertUserSchema } from '@shared/schema'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'


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
type RegisterFormValues = z.infer<typeof registerSchema>

export const RegisterForm = () => {
  const { user, isLoading, loginMutation, registerMutation } = useAuth()


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
      phoneNumber: '',
      role: 'tenant',
      addressStreet: '',
      addressCity: '',
      addressProvince: '',
      addressPostalCode: '',
    },
  })

  const onRegisterSubmit = (data: RegisterFormValues) => {
    const { confirmPassword, ...userData } = data
    registerMutation.mutate(userData)
  }

  // Redirect if already logged in
  if (user) {
    const redirectTo =
      user.role === 'landlord' ? '/landlord/dashboard' : '/tenant/dashboard'
    return <Redirect to={redirectTo} />
  }

  return (
    <>
      <Form {...registerForm}>
        <form
          onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
          className='space-y-4'
        >
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              control={registerForm.control}
              name='firstName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='John'
                      {...field}
                      value={(field.value || '') as string}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={registerForm.control}
              name='lastName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Doe'
                      {...field}
                      value={(field.value || '') as string}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={registerForm.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder='john.doe@example.com'
                    {...field}
                    value={(field.value || '') as string}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={registerForm.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder='johndoe123'
                    {...field}
                    value={(field.value || '') as string}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              control={registerForm.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Create a password'
                      {...field}
                      value={(field.value || '') as string}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={registerForm.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Confirm your password'
                      {...field}
                      value={(field.value || '') as string}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={registerForm.control}
            name='phoneNumber'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder='416-555-1234'
                    {...field}
                    value={(field.value || '') as string}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={registerForm.control}
            name='role'
            render={({ field }) => (
              <FormItem>
                <FormLabel>I am a</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={(field.value || '') as string}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select your role' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='tenant'>Tenant</SelectItem>
                    <SelectItem value='landlord'>Landlord</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={registerForm.control}
            name='addressStreet'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder='123 Main St'
                    {...field}
                    value={(field.value || '') as string}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={registerForm.control}
              name='addressCity'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Toronto'
                      {...field}
                      value={(field.value || '') as string}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={registerForm.control}
              name='addressProvince'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Province</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={(field.value || '') as string}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select province' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='ON'>Ontario</SelectItem>
                      <SelectItem value='BC'>British Columbia</SelectItem>
                      <SelectItem value='AB'>Alberta</SelectItem>
                      <SelectItem value='QC'>Quebec</SelectItem>
                      <SelectItem value='MB'>Manitoba</SelectItem>
                      <SelectItem value='SK'>Saskatchewan</SelectItem>
                      <SelectItem value='NS'>Nova Scotia</SelectItem>
                      <SelectItem value='NB'>New Brunswick</SelectItem>
                      <SelectItem value='NL'>
                        Newfoundland and Labrador
                      </SelectItem>
                      <SelectItem value='PE'>Prince Edward Island</SelectItem>
                      <SelectItem value='NT'>Northwest Territories</SelectItem>
                      <SelectItem value='YT'>Yukon</SelectItem>
                      <SelectItem value='NU'>Nunavut</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={registerForm.control}
            name='addressPostalCode'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder='M5V 2A1'
                    {...field}
                    value={(field.value || '') as string}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type='submit'
            className='w-full'
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending
              ? 'Creating Account...'
              : 'Create Account'}
          </Button>
        </form>
      </Form>
    </>
  )
}
