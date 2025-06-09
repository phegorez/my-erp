"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { findRequestById } from "@/services/api";
import { Separator } from "@/components/ui/separator"; // For visual separation

// Interfaces (should be shared or imported if defined elsewhere, and expanded based on API response)
interface UserInfo {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department?: { name: string };
  job_title?: string;
}

interface RequestedItemDetail {
  item_id: string;
  item_name: string; // Name of the item
  quantity: number;
  serial_number?: string | null; // Populated after PIC approval/assignment
  imei?: string | null;          // Populated after PIC approval/assignment
  item_category?: string;        // Category name
  item_type?: string;            // Item Type name
}

interface ApprovalLog {
  approver_type: 'manager' | 'pic'; // 'manager' or 'pic'
  approver_name: string; // Name of the approver
  status: string; // e.g., APPROVED, REJECTED, REVISION_REQUESTED
  comment: string | null;
  approved_at: string;
}

interface RequestDetails {
  id: string;
  requester_user: UserInfo;
  manager_user: UserInfo; // Approving manager
  pic_user?: UserInfo | null; // PIC, if applicable for the items/category
  request_items: RequestedItemDetail[];
  start_date: string;
  end_date: string;
  status: string;
  comment: string | null; // Requester's comment
  manager_approval_comment: string | null;
  pic_approval_comment: string | null;
  approval_logs?: ApprovalLog[]; // For a more detailed history
  created_at: string;
  updated_at: string;
}

// Helper to format dates
const formatDate = (dateString: string | null | undefined, includeTime = false) => {
  if (!dateString) return "N/A";
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Helper for status badge
const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  // (Same as in MyRequestsPage, consider moving to a shared utils file)
   switch (status?.toUpperCase()) {
    case "PENDING_MANAGER_APPROVAL":
    case "PENDING_PIC_APPROVAL":
      return "outline";
    case "APPROVED_AND_PENDING_COLLECTION":
    case "COLLECTED":
      return "default";
    case "REJECTED":
    case "CANCELLED":
      return "destructive";
    case "RETURNED":
      return "secondary";
    default:
      return "secondary";
  }
};

export default function RequestDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;

  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) {
      setError("Request ID is missing.");
      setIsLoading(false);
      return;
    }
    const loadRequestDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/auth/login');
          return;
        }
        const data = await findRequestById(requestId);
        setRequest(data);
      } catch (err: any) {
        console.error("Failed to fetch request details:", err);
        setError(err.message || "Could not load request details.");
        if (err.status === 401 || err.status === 403) router.push('/auth/login');
        if (err.status === 404) setError("Request not found.");
      } finally {
        setIsLoading(false);
      }
    };
    loadRequestDetails();
  }, [requestId, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><p>Loading request details...</p></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <p className="text-lg text-red-600 mb-4">{error}</p>
        <Link href="/requests/my-requests">
          <Button variant="outline">Back to My Requests</Button>
        </Link>
      </div>
    );
  }

  if (!request) {
    return <div className="text-center py-10"><p>Request data is not available.</p></div>;
  }

  const renderUserInfo = (user: UserInfo | null | undefined, title: string) => {
    if (!user) return <p>{title}: N/A</p>;
    return (
        <div>
            <h3 className="font-semibold text-gray-700">{title}</h3>
            <p>Name: {user.first_name} {user.last_name}</p>
            <p>Email: {user.email}</p>
            {user.department && <p>Department: {user.department.name}</p>}
            {user.job_title && <p>Job Title: {user.job_title}</p>}
        </div>
    );
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader className="bg-gray-50">
          <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-2xl font-bold text-gray-800">Request Details</CardTitle>
                <CardDescription>ID: <span className="font-mono text-xs">{request.id}</span></CardDescription>
            </div>
            <Badge variant={getStatusVariant(request.status)} className="text-sm px-3 py-1">
                {request.status.replace(/_/g, ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                    <h3 className="font-semibold text-gray-700">Request Dates</h3>
                    <p>Start Date: {formatDate(request.start_date)}</p>
                    <p>End Date: {formatDate(request.end_date)}</p>
                </div>
                 <div className="space-y-1">
                    <h3 className="font-semibold text-gray-700">Timestamps</h3>
                    <p>Created: {formatDate(request.created_at, true)}</p>
                    <p>Last Updated: {formatDate(request.updated_at, true)}</p>
                </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderUserInfo(request.requester_user, "Requester Information")}
                {renderUserInfo(request.manager_user, "Manager for Approval")}
            </div>

            {request.pic_user && <Separator />}
            {request.pic_user && renderUserInfo(request.pic_user, "PIC (Person In Charge)")}

            {request.comment && (
                <>
                    <Separator />
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-1">Requester's Comment</h3>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{request.comment}</p>
                    </div>
                </>
            )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Requested Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>IMEI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {request.request_items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.item_name}</TableCell>
                  <TableCell>{item.item_category || 'N/A'}</TableCell>
                  <TableCell>{item.item_type || 'N/A'}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.serial_number || (request.status.toUpperCase().includes("APPROVED") ? "To be assigned" : "N/A")}</TableCell>
                  <TableCell>{item.imei || (request.status.toUpperCase().includes("APPROVED") ? "To be assigned" : "N/A")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {(request.manager_approval_comment || request.pic_approval_comment || (request.approval_logs && request.approval_logs.length > 0)) && (
          <Card>
            <CardHeader><CardTitle>Approval Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {request.manager_approval_comment && (
                    <div>
                        <h3 className="font-semibold">Manager's Comment:</h3>
                        <p className="text-gray-600 bg-gray-50 p-2 rounded-md whitespace-pre-wrap">{request.manager_approval_comment}</p>
                    </div>
                )}
                {request.pic_approval_comment && (
                     <div>
                        <h3 className="font-semibold">PIC's Comment:</h3>
                        <p className="text-gray-600 bg-gray-50 p-2 rounded-md whitespace-pre-wrap">{request.pic_approval_comment}</p>
                    </div>
                )}
                {request.approval_logs && request.approval_logs.length > 0 && (
                    <div>
                        <h3 className="font-semibold mb-2">Detailed Approval History:</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Approver Type</TableHead>
                                    <TableHead>Approver Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Comment</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {request.approval_logs.map((log, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="capitalize">{log.approver_type}</TableCell>
                                        <TableCell>{log.approver_name}</TableCell>
                                        <TableCell><Badge variant={getStatusVariant(log.status)}>{log.status.replace(/_/g, ' ')}</Badge></TableCell>
                                        <TableCell>{formatDate(log.approved_at, true)}</TableCell>
                                        <TableCell className="whitespace-pre-wrap">{log.comment || "N/A"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
          </Card>
      )}

      <div className="mt-8 text-center">
        <Link href="/requests/my-requests">
          <Button variant="outline">Back to My Requests List</Button>
        </Link>
        {/* Add other relevant action buttons here based on user role and request status */}
      </div>
    </div>
  );
}

// Need to add Separator to Shadcn/ui components if not already done
// npx shadcn-ui@latest add separator
