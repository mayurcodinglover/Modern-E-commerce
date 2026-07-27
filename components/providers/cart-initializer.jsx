"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCart } from "../../app/store/slices/cartSlice.js";
import { setWishlist } from "../../app/store/slices/wishlistSlice.js";

export function CartInitializer() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
   const authLoading = useSelector((state) => state.auth.loading);

 useEffect(() => {
    // Wait until auth is done loading
    // Then load cart + wishlist if user exists
    if (!authLoading && user) {
      initializeCartAndWishlist();
    }
  }, [user, authLoading]);

    async function initializeCartAndWishlist() {
    try {
      // Load cart
      const cartRes = await fetch(`/api/cart?userId=${user.id}`);
      const cartData = await cartRes.json();
      if (cartData.success) {
        dispatch(setCart(cartData));
      }

      // Load wishlist
      const wishlistRes = await fetch(`/api/whishlist?userId=${user.id}`);
      const wishlistData = await wishlistRes.json();
      if (wishlistData.success) {
        dispatch(
          setWishlist(
            wishlistData.data.map((item) => ({
              id: item.id,
              productId: item.productId,
            }))
          )
        );
      }
    } catch (error) {
      console.error("Failed to initialize cart/wishlist", error);
    }
  }

  return null;
}