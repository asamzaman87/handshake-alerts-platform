"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/api";
import { SiteFooter } from "./SiteFooter";

export function ConditionalFooter() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(!!getToken());
  }, []);

  if (signedIn) return null;
  return <SiteFooter />;
}
