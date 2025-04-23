import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/app-layout";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft, Send, UserPlus, CheckSquare } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function SendDocumentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/documents/:id/send");
  
  const documentId = match ? parseInt(params.id) : 0;
  const [selectedUsers, setSelectedUsers] = useState<Array<{ userId: number, verificationMethod: string }>>([]);
  
  // Redirect if not landlord
  if (user && user.role !== "landlord" && user.role !== "admin") {
    navigate("/documents");
    return null;
  }
  
  // Fetch document
  const { data: document, isLoading: isLoadingDocument } = useQuery({
    queryKey: ["/api/documents", documentId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/documents/${documentId}`);
      return response.json();
    },
    enabled: !!documentId,
  });
  
  // Fetch tenants for landlord
  const { data: tenants, isLoading: isLoadingTenants } = useQuery({
    queryKey: ["/api/users/tenants"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/users/tenants");
      return response.json();
    },
  });
  
  // Send document mutation
  const sendDocumentMutation = useMutation({
    mutationFn: async () => {
      if (selectedUsers.length === 0) {
        throw new Error("Please select at least one tenant to sign the document.");
      }
      
      const response = await apiRequest("POST", `/api/documents/${documentId}/send`, {
        signatories: selectedUsers,
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Document sent successfully",
        description: "The signatories will be notified to sign the document.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      navigate("/documents");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send document",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Toggle user selection
  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prevSelected) => {
      const isAlreadySelected = prevSelected.some((item) => item.userId === userId);
      
      if (isAlreadySelected) {
        return prevSelected.filter((item) => item.userId !== userId);
      } else {
        return [...prevSelected, { userId, verificationMethod: "email" }];
      }
    });
  };
  
  // Update verification method
  const updateVerificationMethod = (userId: number, method: string) => {
    setSelectedUsers((prevSelected) => {
      return prevSelected.map((item) => {
        if (item.userId === userId) {
          return { ...item, verificationMethod: method };
        }
        return item;
      });
    });
  };
  
  // Handle send
  const handleSendDocument = () => {
    sendDocumentMutation.mutate();
  };
  
  if (isLoadingDocument || isLoadingTenants) {
    return (
      <AppLayout>
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading...</span>
        </div>
      </AppLayout>
    );
  }
  
  if (!document) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Not Found</CardTitle>
              <CardDescription>
                The document you're looking for doesn't exist or you don't have permission to access it.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate("/documents")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Documents
              </Button>
            </CardFooter>
          </Card>
        </div>
      </AppLayout>
    );
  }
  
  // Check if document can be sent
  if (document.status !== "draft") {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Cannot Be Sent</CardTitle>
              <CardDescription>
                This document has already been sent for signatures or is already completed.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate("/documents")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Documents
              </Button>
            </CardFooter>
          </Card>
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
          <h1 className="text-3xl font-bold ml-2">Send Document for Signature</h1>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{document.title}</CardTitle>
              <CardDescription>
                Document Type: {document.documentType.replace(/_/g, " ")}
                <br />
                Created on: {formatDate(document.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded p-4 max-h-[300px] overflow-y-auto whitespace-pre-wrap mb-6">
                {document.content}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                Select Signatories
              </CardTitle>
              <CardDescription>
                Choose the tenants who need to sign this document.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tenants && tenants.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Select</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Verification Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenants.map((tenant: any) => (
                      <TableRow key={tenant.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.some((item) => item.userId === tenant.id)}
                            onCheckedChange={() => toggleUserSelection(tenant.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {tenant.firstName} {tenant.lastName}
                        </TableCell>
                        <TableCell>{tenant.email || "No email"}</TableCell>
                        <TableCell>
                          {selectedUsers.some((item) => item.userId === tenant.id) && (
                            <Select
                              defaultValue="email"
                              onValueChange={(value) => updateVerificationMethod(tenant.id, value)}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="sms">SMS</SelectItem>
                                <SelectItem value="none">None (In Person)</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <p>No tenants found. You need to add tenants first.</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                {selectedUsers.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {selectedUsers.length} {selectedUsers.length === 1 ? "tenant" : "tenants"} selected
                  </p>
                )}
              </div>
              <Button
                onClick={handleSendDocument}
                disabled={selectedUsers.length === 0 || sendDocumentMutation.isPending}
              >
                {sendDocumentMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send for Signature
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}