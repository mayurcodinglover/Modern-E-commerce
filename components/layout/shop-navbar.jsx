"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { ShoppingBag, Heart, ShoppingCart, User, Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function ShopNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const cartItemCount=useSelector((state)=>state.cart.itemCount);
  const wishlistCount=useSelector((state)=>state.wishlist.itemCount);
  const user = useSelector((state) => state.auth.user);

   useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleSearch(e){
        e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  }
   const navLinks = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "New Arrivals", href: "/products?sort=newest" },
    { label: "Sale", href: "/products?sale=true" },
  ];

   return (
    <header
      className={`sticky top-0 z-50 bg-background transition-shadow ${
        scrolled ? "shadow-sm" : ""
      } border-b`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16 gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg hidden sm:block">
              ShopApp
            </span>
          </Link>

            {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-6 ml-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
            {/* Spacer */}
          <div className="flex-1" />

          {/* Search bar desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center relative w-64"
          >
            <Search className="h-4 w-4 absolute left-3 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-9 h-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

           {/* Action icons */}
          <div className="flex items-center gap-1">
            {/* Search mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

             <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

              {/* User */}
            {user ? (
              <Link href="/account">
                <Button variant="ghost" size="icon">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
                    {user.firstName?.[0]?.toUpperCase()}
                  </div>
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {/* Mobile menu */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
         {/* Mobile search */}
        {searchOpen && (
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <Button type="submit" size="sm">
                Search
              </Button>
            </form>
          </div>
        )}
          {/* Mobile menu */}
        {menuOpen && (
          <nav className="md:hidden border-t py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-2 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}