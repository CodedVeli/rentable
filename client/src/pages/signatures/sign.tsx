import { useState, useRef, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, X, ArrowLeft, Pen, Type, Upload } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function SignDocumentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/signatures/:id/sign");
  
  const signatureId = match ? parseInt(params.id) : 0;
  const [signatureType, setSignatureType] = useState("typed");
  const [typedSignature, setTypedSignature] = useState("");
  const [drawnSignature, setDrawnSignature] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  
  // Fetch signature request
  const { data: signature, isLoading: isLoadingSignature } = useQuery({
    queryKey: ["/api/signatures", signatureId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/signatures/${signatureId}`);
      return response.json();
    },
    enabled: !!signatureId,
  });
  
  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "black";
        setContext(ctx);
      }
    }
  }, [canvasRef]);
  
  // Drawing handlers
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!context) return;
    
    setIsDrawing(true);
    context.beginPath();
    
    const clientX = 'touches' in e 
      ? e.touches[0].clientX
      : e.clientX;
    const clientY = 'touches' in e 
      ? e.touches[0].clientY
      : e.clientY;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      
      context.moveTo(x, y);
    }
  };
  
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!context || !isDrawing) return;
    
    e.preventDefault();
    
    const clientX = 'touches' in e 
      ? e.touches[0].clientX
      : e.clientX;
    const clientY = 'touches' in e 
      ? e.touches[0].clientY
      : e.clientY;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      
      context.lineTo(x, y);
      context.stroke();
    }
  };
  
  const stopDrawing = () => {
    if (!context || !isDrawing) return;
    
    setIsDrawing(false);
    context.closePath();
    
    // Save the signature as data URL
    const canvas = canvasRef.current;
    if (canvas) {
      setDrawnSignature(canvas.toDataURL("image/png"));
    }
  };
  
  const clearCanvas = () => {
    if (!context || !canvasRef.current) return;
    
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setDrawnSignature("");
  };
  
  // Sign document mutation
  const signDocumentMutation = useMutation({
    mutationFn: async () => {
      let signatureImage;
      
      if (signatureType === "drawn") {
        signatureImage = drawnSignature;
      } else if (signatureType === "typed") {
        // For demo purposes, create a text-based signature image
        signatureImage = typedSignature;
      } else {
        // In a real app, this would be an uploaded image
        signatureImage = "uploaded-signature";
      }
      
      if (!signatureImage) {
        throw new Error("Please provide a signature.");
      }
      
      const response = await apiRequest("POST", `/api/signatures/${signatureId}/sign`, {
        signatureImage,
        signatureType,
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Document signed successfully",
        description: "Your signature has been recorded.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/signatures/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      navigate("/documents");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to sign document",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Reject signature mutation
  const rejectDocumentMutation = useMutation({
    mutationFn: async (reason: string) => {
      const response = await apiRequest("POST", `/api/signatures/${signatureId}/reject`, {
        reason,
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Document rejected",
        description: "Your rejection has been recorded.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/signatures/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      navigate("/documents");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reject document",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        // In a real app, we would validate this is an image
        setSignatureType("uploaded");
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleSign = () => {
    if (signatureType === "typed" && !typedSignature) {
      toast({
        title: "Signature required",
        description: "Please type your signature.",
        variant: "destructive",
      });
      return;
    }
    
    if (signatureType === "drawn" && !drawnSignature) {
      toast({
        title: "Signature required",
        description: "Please draw your signature.",
        variant: "destructive",
      });
      return;
    }
    
    signDocumentMutation.mutate();
  };
  
  const handleReject = () => {
    // In a real app, we would prompt for a reason
    const reason = "Rejected by user";
    rejectDocumentMutation.mutate(reason);
  };
  
  if (isLoadingSignature) {
    return (
      <AppLayout>
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading document for signature...</span>
        </div>
      </AppLayout>
    );
  }
  
  if (!signature) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Not Found</CardTitle>
              <CardDescription>
                The document you're looking for doesn't exist or has already been signed.
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
          <h1 className="text-3xl font-bold ml-2">Sign Document</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{signature.document?.title}</CardTitle>
                <CardDescription>
                  Document Type: {signature.document?.documentType.replace(/_/g, " ")}
                  <br />
                  Requested on: {formatDate(signature.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded p-4 max-h-[500px] overflow-y-auto whitespace-pre-wrap">
                  {signature.document?.content}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Sign Document</CardTitle>
                <CardDescription>
                  Please sign the document using one of the methods below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="typed" onValueChange={(value) => setSignatureType(value)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="typed">
                      <Type className="h-4 w-4 mr-2" />
                      Type
                    </TabsTrigger>
                    <TabsTrigger value="drawn">
                      <Pen className="h-4 w-4 mr-2" />
                      Draw
                    </TabsTrigger>
                    <TabsTrigger value="uploaded">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="typed" className="p-4">
                    <Label htmlFor="typed-signature">Type your full name:</Label>
                    <Input
                      id="typed-signature"
                      className="my-2 font-serif text-xl"
                      value={typedSignature}
                      onChange={(e) => setTypedSignature(e.target.value)}
                      placeholder="Type your name here"
                    />
                    {typedSignature && (
                      <div className="mt-4 p-4 border rounded text-center">
                        <p className="text-sm text-muted-foreground">Preview:</p>
                        <p className="font-serif text-2xl my-2">{typedSignature}</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="drawn" className="p-4">
                    <div className="border rounded p-2 bg-gray-50">
                      <canvas
                        ref={canvasRef}
                        width={400}
                        height={200}
                        className="border rounded touch-none bg-white"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                      />
                      <div className="flex justify-end mt-2">
                        <Button variant="outline" size="sm" onClick={clearCanvas}>
                          Clear
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="uploaded" className="p-4">
                    <Label htmlFor="signature-upload">Upload a signature image:</Label>
                    <Input
                      id="signature-upload"
                      type="file"
                      accept="image/*"
                      className="my-2"
                      onChange={handleFileUpload}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Accepted formats: JPG, PNG, GIF. Maximum size: 5MB.
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={rejectDocumentMutation.isPending}
                >
                  {rejectDocumentMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  Reject
                </Button>
                <Button
                  onClick={handleSign}
                  disabled={signDocumentMutation.isPending}
                >
                  {signDocumentMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Sign Document
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}