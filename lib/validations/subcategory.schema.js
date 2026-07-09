import {z} from "zod";

export const createSubcategorySchema=z.object({
    categoryId:z.string().min(1,"Category ID is required"),
    name:z
    .string()
    .min(1,"Subcategory name is required")
    .max(50,"Subcategory name must be at most 50 characters"),
    slug:z
    .string()
    .min(1, "Slug is required")
    .max(150, "Slug must be less than 150 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens")
});

export const updateSubcategorySchema=createSubcategorySchema.partial();