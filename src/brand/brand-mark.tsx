import { brand } from "@/brand";
import { cn } from "@/lib/utils";

// The product's mark: its logo file when the brand sheet gave one, otherwise
// a wordmark set from the name in the display face. A builder without a logo
// is never blocked on one.
export function BrandMark({ className }: { className?: string }) {
  if (brand.logo) {
    return (
      <img src={brand.logo} alt={brand.productName} className={cn("h-8 w-auto", className)} />
    );
  }
  return (
    <span
      className={cn("font-bold tracking-tight text-primary", className)}
      style={{ fontFamily: "var(--font-archivo)" }}
    >
      {brand.productName}
    </span>
  );
}
