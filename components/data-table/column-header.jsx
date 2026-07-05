"use client";

import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function ColumnHeader({column,title,className}) {
    if(!column.getCanSort()) {
         return <div className={cn("text-sm", className)}>{title}</div>;
    }
      return (
    <div
      className={cn(
        "flex items-center gap-1 cursor-pointer select-none text-sm",
        className
      )}
      onClick={column.getToggleSortingHandler()}
    >
      {title}
      {column.getIsSorted() === "asc" ? (
        <ChevronUp className="h-3 w-3" />
      ) : column.getIsSorted() === "desc" ? (
        <ChevronDown className="h-3 w-3" />
      ) : (
        <ChevronsUpDown className="h-3 w-3 opacity-50" />
      )}
    </div>
  );
}