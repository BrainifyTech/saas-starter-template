import { ModeToggle } from "@/components/mode-toggle";
import { BrandMark } from "@/brand/brand-mark";
import Link from "next/link";

export function ComingSoonHeader() {
  return (
    <div className="relative z-20 container mx-auto py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Link
            href="/"
            className="hover:text-blue-100 flex gap-1 items-center"
          >
            <div className="flex flex-col">
              <div className="text-xs sm:text-xl">Coming Soon...</div>
              <BrandMark className="text-lg sm:text-3xl" />
            </div>
          </Link>
        </div>

        <ModeToggle />
      </div>
    </div>
  );
}
