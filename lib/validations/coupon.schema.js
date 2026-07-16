import {z} from "zod";
export const createCouponSchema=z.object({
    code:z
    .string()
    .min(3,"Code must be atleast 3 Character")
    .max(50,"Code must be less thatn 50 Chracter")
    .regex(/^[A-Z0-9_-]+$/, {
      message: "Code must be uppercase letters, numbers, hyphens or underscores only",
    }),
    discountType:z.enum(["percentage","fixed"],{
         message: "Please select a discount type",
    }),
    discountValue:z
    .string()
    .min(1,"Dashboard value is required")
    .refine((val)=>!isNaN(Number(val)) && Number(val)>0 ,{
        message:"Discount value must be greater than 0",
    }),
    minOrderAmount:z
    .string()
    .optional()
    .refine((val)=>!val || (!isNaN(Number(val)) && Number(val)>=0),{
          message: "Minimum order amount must be 0 or more",
    }),
    maxUses:z
    .string()
    .optional()
     .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: "Max uses must be greater than 0",
    }),
     expiresAt: z.string().optional().or(z.literal("")),
});
export const updateCouponSchema=createCouponSchema.partial();