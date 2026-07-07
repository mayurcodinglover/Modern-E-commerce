import {z} from "zod"

export const createProductSchema=z.object({
    name:z
    .string()
    .min(1,"Product name is required")
    .max(255,"Product must be less then 255 character"),
    title:z.string().max(500).optional().or(z.literal("")),
    description:z.string().optional(),
    categoryId:z.string().min(1,"Category is required"),
    subcategoryId:z.string().optional().or(z.literal("")),
    basePrice:z
    .string()
    .min(1,"Base Price is required")
    .refine((val)=>!isNaN(Number(val)) && Number(val)>0,{
        message:"Base price must be positive number"
    }),
    discountPrice:z
    .string()
    .optional()
    .refine((val)=>!val || (!isNaN(Number(val)) && Number(val)>0),{
        message:"Discount price must be positive number"
    }),
});

export const updateProductSchema=createProductSchema.partial();

export const createVariantSchema=z.object({
    sku:z.string()
    .min(1,"SKU is required")
    .max(100,"SKU must be less than 100 character"),
    sizeId:z.string().optional().or(z.literal("")),
    colorId:z.string().optional().or(z.literal("")),
    stockQuantity:z
    .string()
    .refine((val)=>!isNaN(Number(val)) && Number(val)>0,{
        message:"Stock must be 0 or more"
    }),
    extraPrice:z
    .string()
    .refine((val)=>!isNaN(Number(val)) && Number(val) > 0,{
        message:"Extra price must be 0 or more"
    })
})

export const createImageSchema=z.object({
    imageUrl:z.string()
    .min(1,"Image url is required")
    .url("Must be a valid Url"),
    altText:z.string().max(255).optional().or(z.literal("")),
    displayOrder:z.string().optional(),
    isPrimary:z.boolean().default(false),
})