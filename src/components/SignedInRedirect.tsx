"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/api";

export function SignedInRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (getToken()) {
      router.replace("/dashboard/");
    }
  }, [router]);

  return null;
}
