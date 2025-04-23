import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/app-layout";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, ArrowLeft } from "lucide-react";

// Create form schema
const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  documentType: z.string({
    required_error: "Please select a document type.",
  }),
  content: z.string().min(50, {
    message: "Document content must be at least 50 characters.",
  }),
  templateId: z.string().optional(),
});

export default function CreateDocumentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isUsingTemplate, setIsUsingTemplate] = useState(false);

  // Redirect if not landlord
  if (user && user.role !== "landlord" && user.role !== "admin") {
    navigate("/documents");
    return null;
  }

  // Fetch templates
  const { data: templates, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["/api/document-templates"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/document-templates");
      return response.json();
    },
  });

  // Create document mutation
  const createDocumentMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/documents", values);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Document created successfully",
        description: "You can now send it for signatures.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      navigate("/documents");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create document",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      documentType: "",
      content: "",
      templateId: undefined,
    },
  });

  // Handle template selection
  const handleTemplateChange = (templateId: string) => {
    if (templateId) {
      setIsUsingTemplate(true);
      const selectedTemplate = templates.find((t: any) => t.id.toString() === templateId);
      if (selectedTemplate) {
        form.setValue("title", selectedTemplate.title);
        form.setValue("documentType", selectedTemplate.documentType);
        form.setValue("content", selectedTemplate.content);
        form.setValue("templateId", templateId);
      }
    } else {
      setIsUsingTemplate(false);
      form.reset({
        title: "",
        documentType: "",
        content: "",
        templateId: undefined,
      });
    }
  };

  // Form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createDocumentMutation.mutate(values);
  };

  if (isLoadingTemplates) {
    return (
      <AppLayout>
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading templates...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate("/documents")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold ml-2">Create Document</h1>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Start with a Template</CardTitle>
              <CardDescription>
                Choose a template or start from scratch.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-- Create from scratch --</SelectItem>
                  {templates?.map((template: any) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.title} ({template.documentType.replace(/_/g, " ")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document Details</CardTitle>
              <CardDescription>
                Fill in the document information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter document title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="documentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="lease_agreement">Lease Agreement</SelectItem>
                            <SelectItem value="rental_application">Rental Application</SelectItem>
                            <SelectItem value="notice_of_rent_increase">Notice of Rent Increase</SelectItem>
                            <SelectItem value="maintenance_request">Maintenance Request</SelectItem>
                            <SelectItem value="property_inspection">Property Inspection</SelectItem>
                            <SelectItem value="eviction_notice">Eviction Notice</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter document content" 
                            {...field} 
                            className="min-h-[400px]"
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the full content of your document.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createDocumentMutation.isPending}
                  >
                    {createDocumentMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Document
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}