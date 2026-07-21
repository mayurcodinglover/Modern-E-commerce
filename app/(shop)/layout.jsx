import { ShopNavbar } from "../../components/layout/shop-navbar";


export default function ShopLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <ShopNavbar/>
      <main>{children}</main>
      <footer className="border-t mt-16 py-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 ShopApp. All rights reserved.
        </div>
      </footer>
    </div>
  );
}