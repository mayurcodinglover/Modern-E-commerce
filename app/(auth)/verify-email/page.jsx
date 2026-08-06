"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Mail,
} from "lucide-react";

const statusConfig = {
  success: {
    icon: CheckCircle,
    iconClass: "text-green-500",
    bgClass: "bg-green-100",
    title: "Email verified!",
    description:
      "Your email has been verified successfully. You can now login to your account.",
    action: { label: "Login now", href: "/login" },
  },
  "already-verified": {
    icon: CheckCircle,
    iconClass: "text-blue-500",
    bgClass: "bg-blue-100",
    title: "Already verified",
    description:
      "Your email is already verified. You can login to your account.",
    action: { label: "Go to login", href: "/login" },
  },
  expired: {
    icon: Clock,
    iconClass: "text-orange-500",
    bgClass: "bg-orange-100",
    title: "Link expired",
    description:
      "Your verification link has expired. Please request a new one.",
    action: { label: "Resend verification", href: "/resend-verification" },
  },
  invalid: {
    icon: XCircle,
    iconClass: "text-red-500",
    bgClass: "bg-red-100",
    title: "Invalid link",
    description:
      "This verification link is invalid or has already been used.",
    action: { label: "Resend verification", href: "/resend-verification" },
  },
  error: {
    icon: AlertCircle,
    iconClass: "text-red-500",
    bgClass: "bg-red-100",
    title: "Something went wrong",
    description:
      "An error occurred while verifying your email. Please try again.",
    action: { label: "Try again", href: "/resend-verification" },
  },
};

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  // No status — user landed directly without token
  if (!status) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-background border rounded-2xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Check your email</h1>
          <p className="text-muted-foreground text-sm mb-6">
            We sent a verification link to your email. Click the link to
            verify your account.
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Didn't receive it? Check your spam folder or request a new link.
          </p>
          <div className="space-y-3">
            <Link href="/resend-verification">
              <Button variant="outline" className="w-full">
                Resend verification email
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="w-full">
                Back to login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const config = statusConfig[status] || statusConfig.error;
  const Icon = config.icon;

  return (
    <div className="w-full max-w-md">
      <div className="bg-background border rounded-2xl p-8 shadow-sm text-center">
        <div
          className={`w-16 h-16 ${config.bgClass} rounded-full flex items-center justify-center mx-auto mb-4`}
        >
          <Icon className={`h-8 w-8 ${config.iconClass}`} />
        </div>
        <h1 className="text-2xl font-semibold mb-2">{config.title}</h1>
        <p className="text-muted-foreground text-sm mb-6">
          {config.description}
        </p>
        <div className="space-y-3">
          <Link href={config.action.href}>
            <Button className="w-full">{config.action.label}</Button>
          </Link>
          {status !== "success" && (
            <Link href="/">
              <Button variant="ghost" className="w-full">
                Go to homepage
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md">
          <div className="bg-background border rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}