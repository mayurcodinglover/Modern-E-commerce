import {z} from "zod";

export const loginSchema=z.object({
    email:z
    .string()
    .min(1,"Email is required")
    .email("Please Enter a valid email"),
    password:z
    .string()
    .min(1,"Password is required")
    .min(6,"Password must me atleast 6 characters"),
});

export const registerSchema=z.object({
    firstName:z
    .string()
    .min(1,"First name is required")
    .max(100,"First name must be less than 100 characters"),
    lastName:z
    .string()
    .min(1,"Last name is required")
    .max(100,"Last name nust be less than 100 characters"),
    email:z
    .string()
    .min(1,"Email is required")
    .email("Please enter valid email"),
    password:z
    .string()
    .min(6,"Password must be atleast 6 characters")
    .max(100,"Password must be less than 100 characters"),
    confirmPassword:z.string().min(1,"Please confirm your password"),
})
.refine((data)=>data.password===data.confirmPassword,{
    message:"Passwrod do not match",
    path:["confirmPassword"],
});

export const checkoutSchema=z.object({
    addressId:z.string().min(1,"Please select a delivery address"),
    notes:z.string().optional()
});

export const newAddressSchema=z.object({
    addressLine1:z
    .string()
    .min(1,"Address is required")
    .max(255,"Address must be less than 255 characters"),
    addressLine2:z.string().max(255).optional().or(z.literal("")),
    city:z.string().min(1,"City is required").max(100),
    state:z.string().min(1,"State is required").max(100),
    postalCode:z
    .string()
    .min(1,"Pincode is required")
    .max(20)
    .regex(/^[0-9]{6}$/, "Enter a valid 6-digit pincode"),
  country: z.string().min(1, "Country is required").max(100),
});