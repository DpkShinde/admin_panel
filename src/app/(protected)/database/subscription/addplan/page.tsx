'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const AddPlan: React.FC = () => {
    const [plan, setPlan] = useState({
        plan: '',
        halfyearly_price: '',
        annually_price: '',
        features: '',
        additional_benefits: ''
    });
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPlan({ ...plan, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        try {
            const response = await fetch('/api/subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(plan)
            });
            
            if (!response.ok) {
                throw new Error('Failed to add plan');
            }
            
            router.push('/');
        } catch (err) {
            setError((err as Error).message);
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold text-center mb-6">Add New Plan</h1>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="plan" placeholder="Plan Name" value={plan.plan} onChange={handleChange} required className="w-full p-2 border rounded" />
                <input type="number" name="halfyearly_price" placeholder="Half-Yearly Price" value={plan.halfyearly_price} onChange={handleChange} required className="w-full p-2 border rounded" />
                <input type="number" name="annually_price" placeholder="Annually Price" value={plan.annually_price} onChange={handleChange} required className="w-full p-2 border rounded" />
                <textarea name="features" placeholder="Features" value={plan.features} onChange={handleChange} required className="w-full p-2 border rounded"></textarea>
                <textarea name="additional_benefits" placeholder="Additional Benefits" value={plan.additional_benefits} onChange={handleChange} required className="w-full p-2 border rounded"></textarea>
                <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">Add Plan</button>
            </form>
        </div>
    );
};

export default AddPlan;