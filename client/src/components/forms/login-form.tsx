import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});


// Types
type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const { user,  loginMutation} = useAuth();

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Handle form submissions
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };


  // Redirect if already logged in
  if (user) {
    const redirectTo = user.role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard";
    return <Redirect to={redirectTo} />;
  }

  return (
    <>
      <Form {...loginForm}>
        <form
          onSubmit={loginForm.handleSubmit(onLoginSubmit)}
          className='space-y-4'
        >
          <FormField
            control={loginForm.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username or Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter your username or email'
                    {...field}
                    value={(field.value || '') as string}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={loginForm.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='Enter your password'
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
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Form>
    </>
  )
}
