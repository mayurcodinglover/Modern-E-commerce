"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCouponSchema } from "@/lib/validations/coupon.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Percent, IndianRupee, Info } from "lucide-react";

export function CouponForm({ onSubmit, defaultValues, isLoading, onCancel }) {
     const form = useForm({
    resolver: zodResolver(createCouponSchema),
    defaultValues: defaultValues || {
      code: "",
      discountType: "",
      discountValue: "",
      minOrderAmount: "",
      maxUses: "",
      expiresAt: "",
    },
  });

  const discountType= form.watch("discountType");
  const discountValue = form.watch("discountValue");

  function handleSubmit(data){
    onSubmit(data);
  }
  
   // Auto uppercase the code
  function handleCodeChange(e, field) {
    field.onChange(e.target.value.toUpperCase());
  }
    return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
             {/* Coupon code */}
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coupon code *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. SAVE20, FLAT200"
                  {...field}
                  onChange={(e) => handleCodeChange(e, field)}
                  className="font-mono uppercase"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
          <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount type *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="percentage">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Percentage
                      </div>
                    </SelectItem>
                    <SelectItem value="fixed">
                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4" />
                        Fixed amount
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="discountValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {discountType === "percentage"
                    ? "Discount % *"
                    : "Discount amount (₹) *"}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      min="1"
                      max={discountType === "percentage" ? "100" : undefined}
                      placeholder={
                        discountType === "percentage" ? "e.g. 20" : "e.g. 200"
                      }
                      {...field}
                    />
                    {discountType && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        {discountType === "percentage" ? "%" : "₹"}
                      </span>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         {/* Live preview */}
        {discountType && discountValue && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
            <Info className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-700">
              {discountType === "percentage"
                ? `Customer gets ${discountValue}% off. e.g. ₹1000 order → save ₹${(
                    1000 *
                    (Number(discountValue) / 100)
                  ).toFixed(0)}`
                : `Customer gets flat ₹${discountValue} off on their order`}
            </p>
          </div>
        )}
         {/* Min order + max uses */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="minOrderAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min order amount (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 500 (optional)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxUses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max uses</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 100 (optional)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Expiry date */}
        <FormField
          control={form.control}
          name="expiresAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiry date (optional)</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
          <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : defaultValues
              ? "Update coupon"
              : "Create coupon"}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
    )
}