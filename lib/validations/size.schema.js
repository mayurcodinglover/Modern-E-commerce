import {z} from "zod";
export const createSizeSchema=z.object({
    name:z.string().min(1,"Size name is required").max(50,"Size name must be at most 50 characters"),
});

export const updateSizeSchema=createSizeSchema;