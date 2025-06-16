"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { subscriptionSchema } from "@/lib/schemasSub";
import { CancelButtonSvg } from "../../../news/(utils)/assets";
import { useRouter } from "next/navigation";

type FormData = z.infer<typeof subscriptionSchema>;

export default function SubscriptionForm() {
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(subscriptionSchema),
  });

  //using next router
  const router = useRouter();

  const paymentMethod = watch("payment_method");

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch(`/api/asign-subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        showToast(result.error, "error");
        return;
      }
      showToast(result.message, "success");
      reset();
      router.push(`/super-admin/database/subscription`);
    } catch (err) {
      console.error("Submission Error:", err);
      showToast("Something went wrong", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 -mt-8">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          <div className="flex items-center space-x-2">
            {toast.type === "success" ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header - Matching your green theme */}
          <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">
              Subscription & Order Management
            </h1>
            <p className="text-green-100 mt-1 text-sm">
              Assign a subscription plan to a specific user.
            </p>
          </div>

          <div className="p-6">
            {/* Subscription Details Section */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-sm">
                    1
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Subscription Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    User Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="Enter user email"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 placeholder-gray-400 text-sm"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs flex items-center space-x-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{errors.email.message}</span>
                    </p>
                  )}
                </div>

                {/* Plan ID */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Plan <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("plan_id")}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white text-sm"
                  >
                    <option value="">Select Plan</option>
                    <option value="1">Elite</option>
                    <option value="2">Premium</option>
                  </select>
                  {errors.plan_id && (
                    <p className="text-red-500 text-xs flex items-center space-x-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{errors.plan_id.message}</span>
                    </p>
                  )}
                </div>

                {/* Billing Cycle */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Billing Cycle <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("billing_cycle")}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white text-sm"
                  >
                    <option value="">Select Billing Cycle</option>
                    <option value="yearly">Yearly</option>
                    <option value="half-yearly">Half-Yearly</option>
                  </select>
                  {errors.billing_cycle && (
                    <p className="text-red-500 text-xs flex items-center space-x-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{errors.billing_cycle.message}</span>
                    </p>
                  )}
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("payment_method")}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white text-sm"
                  >
                    <option value="">Select Payment Method</option>
                    <option value="card">Card</option>
                    <option value="upi">Upi</option>
                  </select>
                  {errors.payment_method && (
                    <p className="text-red-500 text-xs flex items-center space-x-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{errors.payment_method.message}</span>
                    </p>
                  )}
                </div>

                {/* Price Paid */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Price Paid <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 text-sm">
                      ₹
                    </span>
                    <input
                      {...register("price_payed")}
                      type="number"
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 placeholder-gray-400 text-sm"
                    />
                  </div>
                  {errors.price_payed && (
                    <p className="text-red-500 text-xs flex items-center space-x-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{errors.price_payed.message}</span>
                    </p>
                  )}
                </div>

                {/* Payment DateTime */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("payment_date_time")}
                    type="datetime-local"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm"
                  />
                  {errors.payment_date_time && (
                    <p className="text-red-500 text-xs flex items-center space-x-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{errors.payment_date_time.message}</span>
                    </p>
                  )}
                </div>

                {/* Initial Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Initial Date
                  </label>
                  <input
                    {...register("initail_date")}
                    type="datetime-local"
                    placeholder="Initial Date (optional)"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 placeholder-gray-400 text-sm"
                  />
                </div>

                {/* Ending Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Ending Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("ending_date")}
                    placeholder="Ending Date"
                    type="datetime-local"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 placeholder-gray-400 text-sm"
                  />
                  {errors.ending_date && (
                    <p className="text-red-500 text-xs flex items-center space-x-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{errors.ending_date.message}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Details Section */}
            <div className="border-t border-gray-200 pt-5">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Order Details
                  <span className="text-xs font-normal text-gray-500 ml-2">
                    (Optional)
                  </span>
                </h2>
              </div>

              {/* Using flexbox instead of grid for better control */}
              <div className="flex flex-wrap gap-6">
                {/* Order Name */}
                <div className="space-y-2 w-full sm:w-60">
                  <label className="block text-sm font-medium text-gray-700">
                    Order Name
                  </label>
                  <select
                    {...register("order_name")}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm"
                  >
                    <option value="">Select Order</option>
                    <option value="Elite yearly">Elite yearly</option>
                    <option value="Premium yearly">Premium yearly</option>
                  </select>
                </div>

                {/* Order Date */}
                <div className="space-y-2 w-full sm:w-60">
                  <label className="block text-sm font-medium text-gray-700">
                    Order Date
                  </label>
                  <input
                    {...register("order_date")}
                    placeholder="Order Date (YYYY-MM-DDTHH:mm:ss)"
                    type="datetime-local"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-between pt-8 mt-5 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={handleSubmit(onSubmit)}
                className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transform hover:scale-105"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Submit Details"
                )}
              </button>
              <button
                type="button"
                onClick={() =>
                  router.push(`/super-admin/database/subscription`)
                }
                className="w-full sm:w-auto px-8 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 
                                         border-2 border-gray-300 hover:border-gray-400 rounded-xl font-semibold
                                         transition-all duration-200 flex items-center justify-center space-x-2
                                         focus:ring-4 focus:ring-gray-200"
              >
                <CancelButtonSvg />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}