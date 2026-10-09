import type { MDXComponents } from "mdx/types";
import defaultComponents from "fumadocs-ui/mdx";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // fumadocs-core resolves its own copy of @types/react, so its component
    // map does not type-check against the app's MDXComponents though it is
    // the same shape at runtime; without the cast `next build` fails.
    ...(defaultComponents as MDXComponents),
    ...components,
  };
}
