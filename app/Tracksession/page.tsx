
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const officerId = localStorage.getItem("officer_id");

    if (!officerId) {
      router.replace("/"); // redirect to login
    } else {
      setChecking(false); // stop loading if ID exists
    }
  }, []);

  if (checking) {
    return (
      <div>
      </div>
    );
  }
}
