"use client";

import { BrandMark } from "@/brand/brand-mark";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function HeaderLogo() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <Link
      href={isDashboard ? "/dashboard" : "/"}
      className="flex gap-2 items-center text-xl"
    >
      <BrandMark />
    </Link>
  );
}
