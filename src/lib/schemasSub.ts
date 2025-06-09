import { z } from "zod";

export const subscriptionSchema = z.object({
  email: z.string().email("Invalid email"),
  plan_id: z.coerce.number().int().min(1, "Plan ID is required"),
  billing_cycle: z.string().min(1, "Billing cycle is required"),
  payment_method: z.string().min(1, "Payment method is required"),
  card_num: z.string().optional(),
  card_expiry_date: z.string().optional(),
  upi_id: z.string().optional(),
  price_payed: z.coerce.number().optional(),
  payment_date_time: z.string().min(1, "Payment date/time is required"),
  initail_date: z.string().optional(),
  ending_date: z.string().min(1, "Ending date is required"),

  order_name: z.string().optional(),
  order_date: z.string().optional(),
  Amount: z.string().optional(),
  Status: z.string().optional(),
  order_ending_date: z.string().optional(),
});
