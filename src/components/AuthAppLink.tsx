"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getToken } from "@/lib/api";

export function AuthAppLink({
  signedOutLabel,
  signedInLabel = "Open dashboard",
  className = "btn-primary mt-6",
  hideWhenSignedIn = false,
}: {
  signedOutLabel: string;
  signedInLabel?: string;
  className?: string;
  hideWhenSignedIn?: boolean;
}) {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(!!getToken());
  }, []);

  if (signedIn && hideWhenSignedIn) return null;

  if (signedIn) {
    return (
      <Link href="/dashboard/" className={className}>
        {signedInLabel}
      </Link>
    );
  }

  return (
    <Link href="/sign-in/" className={className}>
      {signedOutLabel}
    </Link>
  );
}
