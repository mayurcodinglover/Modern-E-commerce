"use client";

import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCart } from "../../app/store/slices/cartSlice.js";
import { setWishlist } from "../../app/store/slices/wishlistSlice.js";

export function CartInitializer() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
   const authLoading = useSelector((state) => state.auth.loading);

  const initializeCartAndWishlist = useCallback(async () => {
    if (!user) return;
    try {
      const [cartRes, wishlistRes] = await Promise.all([
        fetch(`/api/cart?userId=${user.id}`),
        fetch(`/api/wishlist?userId=${user.id}`),
      ]);
      const [cartData, wishlistData] = await Promise.all([cartRes.json(), wishlistRes.json()]);
      if (cartData.success) dispatch(setCart(cartData));
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
      console.error("Failed to initialize cart", error);
    }
  }, [user, dispatch]);

 useEffect(() => {
    if (!authLoading && user) initializeCartAndWishlist();
  }, [user, authLoading, initializeCartAndWishlist]);

  return null;
}
