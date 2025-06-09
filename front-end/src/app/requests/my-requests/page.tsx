"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { findUserRequests, returnItems as apiReturnItems } from "@/services/api";
import { Badge } from "@/components/ui/badge"; // For status display

// Define an interface for the request data (adjust based on your actual API response)
interface RequestedItem {
  item_id: string;
  item_name: string; // Or fetch item details separately
  quantity: number;
}

interface Request {
  id: string;
  request_items: RequestedItem[]; // Simplified for display
  start_date: string;
  end_date: string;
  status: string; // e.g., PENDING_MANAGER_APPROVAL, PENDING_PIC_APPROVAL, APPROVED, REJECTED, RETURNED, COLLECTED
  // Add other fields like manager_name, pic_name if available directly
}

// Helper to format dates
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

// Helper to get status badge variant
const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status.toUpperCase()) {
    case "PENDING_MANAGER_APPROVAL":
    case "PENDING_PIC_APPROVAL":
      return "outline";
    case "APPROVED_AND_PENDING_COLLECTION":
    case "COLLECTED": // Or a success/green variant if available
      return "default"; // Default often maps to primary color (e.g. green/blue)
    case "REJECTED":
    case "CANCELLED":
      return "destructive";
    case "RETURNED":
      return "secondary";
    default:
      return "secondary";
  }
};


export default function MyRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      const data = await findUserRequests();
      setRequests(Array.isArray(data) ? data : data.requests || []); // Adjust based on API response
    } catch (err: any) {
      console.error("Failed to fetch user requests:", err);
      setError(err.message || "Could not load your requests.");
      if (err.status === 401 || err.status === 403) {
        router.push('/auth/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserRequests();
  }, [router]);

  const handleReturnItems = async (requestId: string) => {
    if (!confirm("Are you sure you want to mark these items as returned?")) return;
    try {
      await apiReturnItems(requestId);
      alert("Items marked as returned successfully. Awaiting confirmation from PIC/Admin.");
      // Refresh the list or update the specific request's status
      loadUserRequests();
    } catch (err: any) {
      console.error("Failed to return items:", err);
      alert(`Error returning items: ${err.message || "Unknown error"}`);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><p>Loading your requests...</p></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <p className="text-lg text-red-600 mb-4">{error}</p>
        <Button onClick={loadUserRequests}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Requests</h1>
        <Link href="/requests/create">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Create New Request
          </Button>
        </Link>
      </div>

      {requests.length === 0 && !isLoading ? (
        <div className="text-center text-gray-500 py-10">
            <p className="text-xl">You haven't made any requests yet.</p>
        </div>
      ) : (
        <Table>
          <TableCaption>A list of your item requests.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-mono text-xs">
                    <Link href={`/requests/${request.id}`} className="hover:underline">
                        {request.id.substring(0, 8)}...
                    </Link>
                </TableCell>
                <TableCell>
                  {request.request_items.map(ri => `${ri.item_name} (Qty: ${ri.quantity})`).join(', ') || "N/A"}
                </TableCell>
                <TableCell>{formatDate(request.start_date)}</TableCell>
                <TableCell>{formatDate(request.end_date)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(request.status)}>
                    {request.status.replace(/_/g, ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/requests/${request.id}`}>
                    <Button variant="outline" size="sm">View Details</Button>
                  </Link>
                  {/* Example: Show "Return Items" button if status is 'COLLECTED' or similar */}
                  {(request.status.toUpperCase() === "COLLECTED" || request.status.toUpperCase() === "APPROVED_AND_COLLECTED") && (
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleReturnItems(request.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Return Items
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
