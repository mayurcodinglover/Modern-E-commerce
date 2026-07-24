import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      {/* Simple header */}
      <header className="bg-background border-b py-4 px-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <ShoppingBag className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">ShopApp</span>
        </Link>
      </header>

        {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}