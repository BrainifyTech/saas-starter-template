import * as React from "react";
import { Img, Text } from "@react-email/components";
import { brand } from "@/brand";

// The product's mark at the top of every email: the brand sheet's logo when it
// gave one, otherwise the name as a wordmark in the brand colour. The starter
// put its own illustration (public/group.jpeg) here, alt-texted with its name.
export function EmailBrandMark({ baseUrl }: { baseUrl: string }) {
  if (brand.logo) {
    return (
      <Img
        src={`${baseUrl}${brand.logo}`}
        height="48"
        alt={brand.productName}
        className="my-0 mx-auto"
      />
    );
  }
  return (
    <Text
      className="my-0 text-center text-[24px] font-bold"
      style={{ color: brand.primaryColor }}
    >
      {brand.productName}
    </Text>
  );
}
