"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function useAuthGuard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setCompanyName(localStorage.getItem("companyName") || "");
    setReady(true);
  }, [router]);

  return { ready, companyName };
}
