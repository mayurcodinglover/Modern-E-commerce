import {z} from "zod";

export const createCategorySchema=z.object({
    name:z
    .string()
    .min(1,"Name is required")
    .max(150,"Name must be at most 150 characters"),
    slug:z
    .string()
    .min(1,"Slug is required")
    .max(150,"Slug must be at most 150 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens"),
    description:z.string().optional(),
    imageUrl:z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export const updateCategorySchema=createCategorySchema.partial();