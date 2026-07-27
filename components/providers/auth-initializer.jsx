"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, logout, setAuthLoading } from "../../app/store/slices/authSlice";

export function AuthInitializer(){
     const dispatch = useDispatch();
      useEffect(() => {
    initializeAuth();   
  }, []);

    async function initializeAuth() {
    try {
      dispatch(setAuthLoading(true));

      // Read token and user from localStorage
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (!token || !savedUser) {
        dispatch(logout());
        return;
      }

      // Verify token is still valid
      const res = await fetch("/api/auth/verify-token", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        // Token valid → restore user to Redux
        dispatch(setUser(JSON.parse(savedUser)));
      } else {
        // Token expired → clear everything
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        dispatch(logout());
      }
    } catch (error) {
      console.error("Auth init failed", error);
      dispatch(logout());
    } finally {
      dispatch(setAuthLoading(false));
    }
  }

  return null;
}