import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/app-layout";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Loader2, MoreVertical, FileText, Eye, CheckCircle, Clock, AlertCircle, Send, XCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function DocumentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("my-documents");

  // Fetch documents
  const { data: documents, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ["/api/documents"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/documents");
      return response.json();
    },
  });

  // Fetch pending signatures
  const { data: pendingSignatures, isLoading: isLoadingSignatures } = useQuery({
    queryKey: ["/api/signatures/pending"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/signatures/pending");
      return response.json();
    },
  });

  // Status badge component
  const DocumentStatusBadge = ({ status }: { status: string }) => {
    const statusMapping: Record<string, { label: string; variant: "default" | "outline" | "secondary" | "destructive" | "success" }> = {
      draft: { label: "Draft", variant: "outline" },
      pending_signatures: { label: "Awaiting Signatures", variant: "secondary" },
      completed: { label: "Completed", variant: "success" },
      rejected: { label: "Rejected", variant: "destructive" },
      expired: { label: "Expired", variant: "destructive" },
    };

    const { label, variant } = statusMapping[status] || { label: status, variant: "default" };

    return <Badge variant={variant}>{label}</Badge>;
  };

  if (isLoadingDocuments || isLoadingSignatures) {
    return (
      <AppLayout>
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading documents...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Documents</h1>
          {user?.role === "landlord" && (
            <Button asChild>
              <a href="/documents/create">Create Document</a>
            </Button>
          )}
        </div>

        <Tabs defaultValue="my-documents" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="my-documents">My Documents</TabsTrigger>
            <TabsTrigger value="pending-signatures">
              Pending Signatures
              {pendingSignatures?.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {pendingSignatures.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-documents" className="space-y-4">
            {documents?.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc: any) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.title}</TableCell>
                          <TableCell>{doc.documentType.replace(/_/g, " ")}</TableCell>
                          <TableCell>
                            <DocumentStatusBadge status={doc.status} />
                          </TableCell>
                          <TableCell>{formatDate(doc.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" /> View
                                </DropdownMenuItem>
                                {user?.role === "landlord" && doc.status === "draft" && (
                                  <DropdownMenuItem asChild>
                                    <a href={`/documents/${doc.id}/send`}>
                                      <Send className="h-4 w-4 mr-2" /> Send for Signature
                                    </a>
                                  </DropdownMenuItem>
                                )}
                                {user?.role === "landlord" && (
                                  <DropdownMenuItem asChild>
                                    <a href={`/documents/${doc.id}/edit`}>
                                      <FileText className="h-4 w-4 mr-2" /> Edit
                                    </a>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Documents Found</CardTitle>
                  <CardDescription>
                    {user?.role === "landlord"
                      ? "You haven't created any documents yet."
                      : "You don't have any documents available."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user?.role === "landlord" && (
                    <Button asChild>
                      <a href="/documents/create">Create Your First Document</a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending-signatures" className="space-y-4">
            {pendingSignatures?.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Requested By</TableHead>
                        <TableHead>Requested On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingSignatures.map((sig: any) => (
                        <TableRow key={sig.id}>
                          <TableCell className="font-medium">{sig.document?.title}</TableCell>
                          <TableCell>{sig.document?.documentType.replace(/_/g, " ")}</TableCell>
                          <TableCell>
                            {/* In a real app, we'd show the name of the user who requested the signature */}
                            {sig.document?.creatorId === user?.id ? "You" : "User #" + sig.document?.creatorId}
                          </TableCell>
                          <TableCell>{formatDate(sig.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <a href={`/signatures/${sig.id}/sign`}>
                              <Button size="sm">
                                <CheckCircle className="h-4 w-4 mr-2" /> Sign
                              </Button>
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Pending Signatures</CardTitle>
                  <CardDescription>
                    You don't have any documents waiting for your signature.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}