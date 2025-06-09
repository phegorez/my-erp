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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    findAllManagerApprovals,
    findAllPicApprovals,
    processManagerApproval, // For actual actions later
    processPicApproval      // For actual actions later
} from "@/services/api";
import { withAuth } from '@/hoc/withAuth'; // Import HOC
// TODO: Add Dialog/AlertDialog for approval actions later
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
// import { Textarea } from "@/components/ui/textarea";


// Interfaces (should be shared or imported)
interface RequesterInfo {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface ApprovalRequestItem { // Simplified item representation for the list
  item_name: string;
  quantity: number;
}

interface ApprovalRequest {
  id: string; // This would be the request_id or a specific approval_task_id
  requester_user: RequesterInfo;
  request_items: ApprovalRequestItem[];
  start_date: string;
  end_date: string;
  status: string; // The current status of the main request
  // Potentially fields like 'submitted_at' or 'assigned_to_approver_at'
}

// Helper to format dates (consider moving to a shared utils file)
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

// Placeholder for user role detection - in a real app, this would come from auth context/token
const useUserRoles = () => {
    // This is a mock. Replace with actual role detection from your auth system.
    // For testing, you might toggle these or use localStorage.
    const [roles, setRoles] = useState<{ isManager: boolean; isPic: boolean }>({ isManager: false, isPic: false });
    useEffect(() => {
        // Simulate fetching user roles or decoding from token
        // const userToken = jwt_decode(localStorage.getItem('authToken'));
        // setRoles({ isManager: userToken.roles.includes('manager'), isPic: userToken.roles.includes('pic') });
        // For now, assume user can be both for structure demonstration
        setRoles({ isManager: true, isPic: true });
    }, []);
    return roles;
};

// Original component renamed
function ApprovalsPageInternal() {
  const router = useRouter();
  const userRoles = useUserRoles(); // { isManager: boolean, isPic: boolean }
  // const { user } = useAuth(); // from HOC, or useAuth() directly

  const [managerApprovals, setManagerApprovals] = useState<ApprovalRequest[]>([]);
  const [picApprovals, setPicApprovals] = useState<ApprovalRequest[]>([]);
  const [isLoadingManager, setIsLoadingManager] = useState(false);
  const [isLoadingPic, setIsLoadingPic] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for handling approval/rejection modal (to be implemented)
  // const [selectedRequestForAction, setSelectedRequestForAction] = useState<ApprovalRequest | null>(null);
  // const [actionType, setActionType] = useState<'approve' | 'reject' | 'revise' | null>(null);
  // const [actionComment, setActionComment] = useState("");
  // const [isActionModalOpen, setIsActionModalOpen] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    if (userRoles.isManager) {
      setIsLoadingManager(true);
      findAllManagerApprovals()
        .then(data => setManagerApprovals(Array.isArray(data) ? data : data.requests || []))
        .catch(err => {
          console.error("Failed to fetch manager approvals:", err);
          setError(prev => prev ? `${prev} | Manager Approvals: ${err.message}` : `Manager Approvals: ${err.message}`);
        })
        .finally(() => setIsLoadingManager(false));
    }

    if (userRoles.isPic) {
      setIsLoadingPic(true);
      findAllPicApprovals()
        .then(data => setPicApprovals(Array.isArray(data) ? data : data.requests || []))
        .catch(err => {
          console.error("Failed to fetch PIC approvals:", err);
          setError(prev => prev ? `${prev} | PIC Approvals: ${err.message}` : `PIC Approvals: ${err.message}`);
        })
        .finally(() => setIsLoadingPic(false));
    }
  }, [router, userRoles.isManager, userRoles.isPic]);

  const handleAction = (request: ApprovalRequest, action: 'approve' | 'reject' | 'revise', approverType: 'manager' | 'pic') => {
    // setSelectedRequestForAction(request);
    // setActionType(action);
    // setIsActionModalOpen(true);
    // For now, just an alert. Modal and API call will be implemented later.
    alert(`Action: ${action} for request ${request.id} by ${approverType}. Comment and API call to be implemented.`);
    // Example API call structure (actual implementation later)
    /*
    const approvalData = { status: action.toUpperCase(), comment: actionComment };
    try {
      if (approverType === 'manager') {
        await processManagerApproval(request.id, approvalData);
      } else {
        await processPicApproval(request.id, approvalData);
      }
      // Refresh lists
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
    */
  };

  const renderApprovalTable = (title: string, requests: ApprovalRequest[], isLoading: boolean, approverType: 'manager' | 'pic') => {
    if (isLoading) return <div className="py-4"><p>Loading {title.toLowerCase()}...</p></div>;
    if (!requests || requests.length === 0) return <div className="py-4"><p>No requests awaiting your {title.toLowerCase().split(' ')[0]} approval.</p></div>;

    return (
      <Table>
        <TableCaption>Requests awaiting your {title.toLowerCase().split(' ')[0]} action.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Request ID</TableHead>
            <TableHead>Requester</TableHead>
            <TableHead>Items (Summary)</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => (
            <TableRow key={req.id}>
              <TableCell className="font-mono text-xs">
                <Link href={`/requests/${req.id}`} className="hover:underline">{req.id.substring(0,8)}...</Link>
              </TableCell>
              <TableCell>{req.requester_user.first_name} {req.requester_user.last_name}</TableCell>
              <TableCell>{req.request_items.map(ri => `${ri.item_name} (Qty: ${ri.quantity})`).join(', ')}</TableCell>
              <TableCell>{formatDate(req.start_date)} - {formatDate(req.end_date)}</TableCell>
              <TableCell className="text-right space-x-1">
                <Link href={`/requests/${req.id}`} passHref>
                  <Button variant="outline" size="sm">Details</Button>
                </Link>
                <Button variant="success" size="sm" onClick={() => handleAction(req, 'approve', approverType)}>Approve</Button>
                <Button variant="destructive" size="sm" onClick={() => handleAction(req, 'reject', approverType)}>Reject</Button>
                <Button variant="secondary" size="sm" onClick={() => handleAction(req, 'revise', approverType)}>Revise</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  // Determine default tab based on roles
  let defaultTab = "";
  if (userRoles.isManager) defaultTab = "manager";
  else if (userRoles.isPic) defaultTab = "pic";


  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Approve Requests</h1>

      {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 border-red-400 rounded-md">{error}</div>}

      {(!userRoles.isManager && !userRoles.isPic && !isLoadingManager && !isLoadingPic) && (
          <p>You do not have manager or PIC roles assigned to approve requests.</p>
      )}

      {(userRoles.isManager || userRoles.isPic) && (
        <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:max-w-md">
            {userRoles.isManager && <TabsTrigger value="manager" disabled={isLoadingManager}>Manager Approvals</TabsTrigger>}
            {userRoles.isPic && <TabsTrigger value="pic" disabled={isLoadingPic}>PIC Approvals</TabsTrigger>}
          </TabsList>
          {userRoles.isManager && (
            <TabsContent value="manager">
              {renderApprovalTable("Manager Approvals", managerApprovals, isLoadingManager, 'manager')}
            </TabsContent>
          )}
          {userRoles.isPic && (
            <TabsContent value="pic">
              {renderApprovalTable("PIC Approvals", picApprovals, isLoadingPic, 'pic')}
            </TabsContent>
          )}
        </Tabs>
      )}

      {/* Modal for actions would go here */}
      {/* Example: <ApprovalActionModal isOpen={isActionModalOpen} onRequestClose={() => setIsActionModalOpen(false)} ... /> */}
    </div>
  );
}

const ApprovalsPage = withAuth(ApprovalsPageInternal, ['manager', 'pic']);
export default ApprovalsPage;
