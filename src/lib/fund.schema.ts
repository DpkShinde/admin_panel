import { z } from "zod";

//Shared decimal validation utility
const twoDecimalPlaces = (value: number) => {
  return Number.isInteger(value * 100);
};

export const fundSchema = z.object({
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
      message: "aum must have at most 2 decimal places",
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
      message: "1 Year Return must have at most 2 decimal places",
    }),

  return_3yr: z
    .number()
    .optional()
    .refine((value) => value === undefined || twoDecimalPlaces(value), {
      message: "3 Year Return must have at most 2 decimal places",
    }),

  return_5yr: z
    .number()
    .optional()
    .refine((value) => value === undefined || twoDecimalPlaces(value), {
      message: "5 Year Return must have at most 2 decimal places",
    }),
});

//Excel schema: for bulk validation (array of funds)
export const excelFundArraySchema = z.array(fundSchema);

//Frontend form schema (uses strings).
export const fundFormSchema = z.object({
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
      message: "Expense Ratio must be up to 2 decimal places",
    }),

  return_1yr: z
    .string()
    .optional()
    .refine((val) => val === undefined || /^\d+(\.\d{1,2})?$/.test(val), {
      message: "Return 1yr must be up to 2 decimal places",
    }),

  return_3yr: z
    .string()
    .optional()
    .refine((val) => val === undefined || /^\d+(\.\d{1,2})?$/.test(val), {
      message: "Return 3yr must be up to 2 decimal places",
    }),

  return_5yr: z
    .string()
    .optional()
    .refine((val) => val === undefined || /^\d+(\.\d{1,2})?$/.test(val), {
      message: "Return 5yr must be up to 2 decimal places",
    }),
});
