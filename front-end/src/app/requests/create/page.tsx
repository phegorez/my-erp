"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createRequest, fetchUsersByRole, fetchAllItems } from "@/services/api";

// Define interfaces (should be shared or imported if defined elsewhere)
interface ManagerUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface AvailableItem {
  id: string;
  name: string;
  is_available: boolean;
  // Add other relevant item details like category, type if needed for display/filtering
}

interface RequestedItemInput { // For the form state
    item_id: string;
    quantity: number;
}

interface CreateRequestData {
  requested_items: RequestedItemInput[]; // Array of { item_id: string, quantity: number }
  manager_id: string | null;
  start_date: string;
  end_date: string;
  comment: string;
}

export default function CreateRequestPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateRequestData>({
    requested_items: [],
    manager_id: null,
    start_date: "",
    end_date: "",
    comment: "",
  });

  // State for dynamic item selection part
  const [availableItems, setAvailableItems] = useState<AvailableItem[]>([]);
  const [selectedAvailableItemId, setSelectedAvailableItemId] = useState<string>("");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  const [managers, setManagers] = useState<ManagerUser[]>([]);
  const [isLoading, setIsLoading] = useState(false); // For form submission
  const [isLoadingManagers, setIsLoadingManagers] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      setIsLoadingManagers(true);
      try {
        const managerData = await fetchUsersByRole('manager'); // Assuming 'manager' is the role string
        setManagers(Array.isArray(managerData) ? managerData : managerData.users || []);
      } catch (err) {
        console.error("Failed to fetch managers:", err);
        setError("Could not load managers for selection."); // Show error related to managers
      } finally {
        setIsLoadingManagers(false);
      }

      setIsLoadingItems(true);
      try {
        const itemsData = await fetchAllItems(); // Fetch all items
        // Filter for available items or handle availability display
        setAvailableItems((Array.isArray(itemsData) ? itemsData : itemsData.items || []).filter(item => item.is_available));
      } catch (err) {
        console.error("Failed to fetch items:", err);
        // Append to existing error or set if no error yet
        setError(prevError => prevError ? `${prevError} | Failed to load items.` : "Failed to load items.");
      } finally {
        setIsLoadingItems(false);
      }
    };
    loadInitialData();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleManagerChange = (value: string) => {
    setFormData((prev) => ({ ...prev, manager_id: value === "none" ? null : value }));
  };

  const handleAddItemToRequest = () => {
    if (!selectedAvailableItemId || selectedQuantity <= 0) {
        alert("Please select an item and specify a valid quantity.");
        return;
    }
    // Avoid adding the same item multiple times; user should edit quantity or remove and re-add.
    if (formData.requested_items.find(item => item.item_id === selectedAvailableItemId)) {
        alert("Item already added. Please modify quantity or remove and re-add if needed.");
        return;
    }
    setFormData(prev => ({
        ...prev,
        requested_items: [...prev.requested_items, { item_id: selectedAvailableItemId, quantity: selectedQuantity }]
    }));
    setSelectedAvailableItemId(""); // Reset selection
    setSelectedQuantity(1); // Reset quantity
  };

  const handleRemoveRequestedItem = (itemIdToRemove: string) => {
    setFormData(prev => ({
        ...prev,
        requested_items: prev.requested_items.filter(item => item.item_id !== itemIdToRemove)
    }));
  };


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (formData.requested_items.length === 0) {
      setError("Please add at least one item to the request.");
      return;
    }
    if (!formData.manager_id) {
      setError("Please select a manager for approval.");
      return;
    }
    if (!formData.start_date || !formData.end_date) {
      setError("Start date and end date are required.");
      return;
    }
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
        setError("End date cannot be before the start date.");
        return;
    }
    if (new Date(formData.start_date) < new Date(new Date().toDateString())) { // Compare date parts only
        setError("Start date cannot be in the past.");
        return;
    }


    setIsLoading(true);
    try {
      await createRequest(formData);
      router.push("/requests/my-requests?requestCreated=true");
    } catch (err: any) {
      console.error("Failed to create request:", err);
      setError(err.message || "An unexpected error occurred while creating the request.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Create New Item Request</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-md">
        {error && <div className="p-3 text-sm text-red-700 bg-red-100 border-red-400 rounded-md">{error}</div>}

        {/* Items Selection Section */}
        <div className="space-y-4 p-4 border rounded-md">
            <h2 className="text-xl font-semibold">Select Items</h2>
            {isLoadingItems && <p>Loading available items...</p>}
            {!isLoadingItems && availableItems.length === 0 && <p>No items currently available for request.</p>}
            {!isLoadingItems && availableItems.length > 0 && (
                <div className="flex items-end space-x-2">
                    <div className="flex-grow">
                        <Label htmlFor="item_select">Available Items</Label>
                        <Select value={selectedAvailableItemId} onValueChange={setSelectedAvailableItemId}>
                            <SelectTrigger><SelectValue placeholder="Choose an item" /></SelectTrigger>
                            <SelectContent>
                                {availableItems.map(item => (
                                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="item_quantity">Quantity</Label>
                        <Input type="number" id="item_quantity" value={selectedQuantity} onChange={e => setSelectedQuantity(parseInt(e.target.value, 10))} min="1" className="w-20" />
                    </div>
                    <Button type="button" onClick={handleAddItemToRequest} disabled={!selectedAvailableItemId || selectedQuantity <=0}>Add Item</Button>
                </div>
            )}
            {formData.requested_items.length > 0 && (
                <div className="mt-4 space-y-2">
                    <h3 className="font-medium">Selected Items for Request:</h3>
                    <ul className="list-disc pl-5">
                        {formData.requested_items.map(item => {
                            const itemDetails = availableItems.find(ai => ai.id === item.item_id) || {name: "Unknown Item"};
                            return (
                                <li key={item.item_id} className="text-sm flex justify-between items-center">
                                    <span>{itemDetails.name} (Qty: {item.quantity})</span>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveRequestedItem(item.item_id)} className="text-red-500 hover:text-red-700">Remove</Button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>

        <div>
          <Label htmlFor="manager_id" className="font-medium">Approving Manager</Label>
          {isLoadingManagers && <p className="text-sm text-gray-500 mt-1">Loading managers...</p>}
          {!isLoadingManagers && managers.length === 0 && <p className="text-sm text-orange-500 mt-1">No managers found/available for selection.</p>}
          {!isLoadingManagers && managers.length > 0 && (
            <Select name="manager_id" value={formData.manager_id || "none"} onValueChange={handleManagerChange} disabled={isLoading}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select a manager" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none" disabled>Please select a manager</SelectItem>
                {managers.map((manager) => (
                  <SelectItem key={manager.id} value={manager.id}>
                    {manager.first_name} {manager.last_name} ({manager.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="start_date" className="font-medium">Start Date</Label>
            <Input id="start_date" name="start_date" type="date" required value={formData.start_date} onChange={handleInputChange} className="mt-1" disabled={isLoading} />
          </div>
          <div>
            <Label htmlFor="end_date" className="font-medium">End Date</Label>
            <Input id="end_date" name="end_date" type="date" required value={formData.end_date} onChange={handleInputChange} className="mt-1" disabled={isLoading} />
          </div>
        </div>

        <div>
          <Label htmlFor="comment" className="font-medium">Additional Comments (Optional)</Label>
          <Textarea id="comment" name="comment" value={formData.comment} onChange={handleInputChange} className="mt-1" disabled={isLoading} placeholder="Any specific notes for your request..." />
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Link href="/requests/my-requests">
            <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
          </Link>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isLoading || isLoadingManagers || isLoadingItems || formData.requested_items.length === 0}>
            {isLoading ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </div>
  );
}
