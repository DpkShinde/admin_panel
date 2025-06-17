import { z } from "zod";

//Shared utility to validate 2 decimal places
const twoDecimalPlaces = (value: number) => Number.isInteger(value * 100);

// 🔹 Backend Schema
export const etfsDirectSchema = z.object({
  fund_name: z
    .string()
    .min(1, "Fund name is required")
    .max(100, "Max 100 characters"),

  nav: z
    .number()
    .optional()
    .refine((value) => value === undefined || twoDecimalPlaces(value), {
      message: "NAV must have at most 2 decimal places",
    }),

  aum_crore: z
    .number()
    .optional()
    .refine((value) => value === undefined || twoDecimalPlaces(value), {
      message: "AUM must have at most 2 decimal places",
    }),

  sip_amount: z.number().int().optional(),

  expense_ratio: z
    .number()
    .optional()
    .refine((value) => value === undefined || twoDecimalPlaces(value), {
      message: "Expense Ratio must have at most 2 decimal places",
    }),

  return_1yr: z
    .number()
    .optional()
    .refine((value) => value === undefined || twoDecimalPlaces(value), {
      message: "1Y Return must have at most 2 decimal places",
    }),

  return_3yr: z
    .number()
    .optional()
    .refine((value) => value === undefined || twoDecimalPlaces(value), {
      message: "3Y Return must have at most 2 decimal places",
    }),

  return_5yr: z
    .number()
    .optional()
    .refine((value) => value === undefined || twoDecimalPlaces(value), {
      message: "5Y Return must have at most 2 decimal places",
    }),
});

// 🔹 Excel Bulk Schema (Array of Records)
export const etfsDirectArraySchema = z.array(etfsDirectSchema);

// 🔹 Frontend Form Schema (String-based input)
export const etfsDirectFormSchema = z.object({
  fund_name: z
    .string()
    .min(1, "Fund name is required")
    .max(100, "Max 100 characters"),

  nav: z
    .string()
    .optional()
    .refine((val) => val === undefined || /^\d+(\.\d{1,2})?$/.test(val), {
      message: "NAV must be a number with up to 2 decimal places",
    }),

  aum_crore: z
    .string()
    .optional()
    .refine((val) => val === undefined || /^\d+(\.\d{1,2})?$/.test(val), {
      message: "AUM must be a number with up to 2 decimal places",
    }),

  sip_amount: z
    .string()
    .optional()
    .refine((val) => val === undefined || /^\d+$/.test(val), {
      message: "SIP Amount must be a whole number",
    }),

  expense_ratio: z
    .string()
    .optional()
    .refine((val) => val === undefined || /^\d+(\.\d{1,2})?$/.test(val), {
      message: "Expense Ratio must be a number with up to 2 decimal places",
    }),

  return_1yr: z
    .string()
    .optional()
    .refine((val) => val === undefined || /^\d+(\.\d{1,2})?$/.test(val), {
      message: "Return 1Y must be a number with up to 2 decimal places",
    }),

  return_3yr: z
    .string()
    .optional()
    .refine((val) => val === undefined || /^\d+(\.\d{1,2})?$/.test(val), {
      message: "Return 3Y must be a number with up to 2 decimal places",
    }),

  return_5yr: z
    .string()
    .optional()
    .refine((val) => val === undefined || /^\d+(\.\d{1,2})?$/.test(val), {
      message: "Return 5Y must be a number with up to 2 decimal places",
    }),
});
