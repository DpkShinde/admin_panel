'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Plan {
    plan_id: number;
    plan: string;
    halfyearly_price: number;
    annually_price: number;
    features: string;
    additional_benefits: string;
    created_date: string | null;
}

const SubscriptionPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [editedPlan, setEditedPlan] = useState<Plan | null>(null);
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const router = useRouter();

    useEffect(() => {
        getPlans();
    }, []);

    useEffect(() => {
        if (selectedPlan) {
            setEditedPlan({...selectedPlan});
        }
    }, [selectedPlan]);

    // Clear notification after 3 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const getPlans = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/subscription", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) {
                throw new Error("Failed to fetch Plans");
            }
            const data = await response.json();
            setPlans(Array.isArray(data) ? data : []);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (plan: Plan) => {
        setSelectedPlan(plan);
        setShowEditDialog(true);
    };

    const handleDelete = (plan: Plan) => {
        setSelectedPlan(plan);
        setShowDeleteDialog(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!editedPlan) return;
        
        const { name, value } = e.target;
        setEditedPlan({
            ...editedPlan,
            [name]: name === 'halfyearly_price' || name === 'annually_price' 
                ? parseFloat(value) || 0 
                : value
        });
    };

    const updatePlan = async () => {
        if (!editedPlan) return;
        
        setLoading(true);
        try {
            const response = await fetch(`/api/subscription/${editedPlan.plan_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editedPlan)
            });
            
            if (!response.ok) {
                throw new Error("Failed to update plan");
            }
            
            // Update local state
            setPlans(plans.map(plan => 
                plan.plan_id === editedPlan.plan_id ? editedPlan : plan
            ));
            
            setNotification({
                message: "Plan updated successfully",
                type: "success"
            });
            
            setShowEditDialog(false);
        } catch (err) {
            setError((err as Error).message);
            setNotification({
                message: (err as Error).message,
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const deletePlan = async () => {
        if (!selectedPlan) return;
        
        setLoading(true);
        try {
            const response = await fetch(`/api/subscription/${selectedPlan.plan_id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan_id: selectedPlan.plan_id })
            });

            console.log(selectedPlan.plan_id)
            
            if (!response.ok) {
                throw new Error("Failed to delete plan");
            }
            // Update local state
            setPlans(plans.filter(plan => plan.plan_id !== selectedPlan.plan_id));
            
            setNotification({
                message: "Plan deleted successfully",
                type: "success"
            });
            
            setShowDeleteDialog(false);
        } catch (err) {
            setError((err as Error).message);
            setNotification({
                message: (err as Error).message,
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Subscription Plans</h1>
                <Button onClick={() => router.push('/database/subscription/addplan')}>Add New Plan</Button>
            </div>

            {/* Notification banner */}
            {notification && (
                <div className={`p-4 mb-4 rounded-md ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {notification.message}
                </div>
            )}

            {loading && <p className="text-center text-gray-600">Loading...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}

            {!loading && !error && (
                <div className="overflow-x-auto shadow-md rounded-lg">
                    <table className="w-full bg-white border border-gray-200 shadow-lg min-w-max">
                        <thead className="bg-green-600 text-white">
                            <tr>
                                {["Plan ID", "Plan", "Half Yearly Price", "Annually Price", "Features", "Additional Features", "Created Date", "Actions"].map(header => (
                                    <th key={header} className="px-6 py-3 text-sm font-semibold border border-gray-300 text-center" >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {plans.length > 0 ? (
                                plans.map((plan) => (
                                    <tr key={plan.plan_id} className="even:bg-gray-100 text-center hover:bg-gray-200 transition">
                                        <td className="px-4 py-2 border border-gray-300">{plan.plan_id}</td>
                                        <td className="px-4 py-2 border border-gray-300">{plan.plan}</td>
                                        <td className="px-4 py-2 border border-gray-300">₹{plan.halfyearly_price}</td>
                                        <td className="px-4 py-2 border border-gray-300">₹{plan.annually_price}</td>
                                        <td className="px-4 py-2 border border-gray-300 w-[300px]" >{plan.features}</td>
                                        <td className="px-4 py-2 border border-gray-300 w-[300px]">{plan.additional_benefits}</td>
                                        <td className="px-4 py-2 border border-gray-300">{plan.created_date ? new Date(plan.created_date).toLocaleDateString() : "N/A"}</td>
                                        <td className="px-4 py-2 border border-gray-300">
                                            <Button className="mr-2 bg-green-600 text-white" onClick={() => handleEdit(plan)}>Edit</Button>
                                            <Button variant="destructive" onClick={() => handleDelete(plan)}>Delete</Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="text-center py-4 text-gray-500">No Plans found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Plan Dialog */}
            {editedPlan && (
                <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                    <DialogContent className="text-black">
                        <DialogHeader>
                            <DialogTitle className="text-black">Edit Plan</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-1">Plan Name</label>
                                <Input 
                                    name="plan"
                                    placeholder="Plan Name" 
                                    value={editedPlan.plan} 
                                    onChange={handleInputChange}
                                    className="text-black" 
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block mb-1">Half Yearly Price</label>
                                    <Input 
                                        name="halfyearly_price"
                                        type="number"
                                        placeholder="Half Yearly Price" 
                                        value={editedPlan.halfyearly_price} 
                                        onChange={handleInputChange}
                                        className="text-black" 
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block mb-1">Annually Price</label>
                                    <Input 
                                        name="annually_price"
                                        type="number"
                                        placeholder="Annually Price" 
                                        value={editedPlan.annually_price} 
                                        onChange={handleInputChange}
                                        className="text-black" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1">Features</label>
                                <textarea 
                                    name="features"
                                    placeholder="Features" 
                                    value={editedPlan.features} 
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded text-black min-h-[100px]" 
                                />
                            </div>
                            <div>
                                <label className="block mb-1">Additional Benefits</label>
                                <textarea 
                                    name="additional_benefits"
                                    placeholder="Additional Benefits" 
                                    value={editedPlan.additional_benefits} 
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded text-black min-h-[100px]" 
                                />
                            </div>
                            <div className="flex justify-end space-x-2 pt-2">
                                <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
                                <Button 
                                    className='bg-green-600 text-white' 
                                    onClick={updatePlan}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Confirmation Dialog */}
            {selectedPlan && (
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogContent className="text-black">
                        <DialogHeader>
                            <DialogTitle className="text-black">Confirm Delete</DialogTitle>
                            <DialogDescription className="text-black">
                                Are you sure you want to delete the plan "{selectedPlan.plan}"? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                            <Button 
                                variant="destructive" 
                                onClick={deletePlan}
                                disabled={loading}
                            >
                                {loading ? 'Deleting...' : 'Delete'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

export default SubscriptionPage;