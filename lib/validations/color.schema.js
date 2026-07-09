import {z} from "zod";

export const createColorSchema=z.object({
    name:z.string().min(1,"Color name is required").max(50,"Color name must be at most 50 characters"),
    hexCode:z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex code e.g. #FF0000")
    .optional()
    .or(z.literal("")),
});

export const updateColorSchema = createColorSchema;