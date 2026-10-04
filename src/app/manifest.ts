import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MediaToolkit",
    short_name: "MediaToolkit",
    description: "Search, understand, and fix programming errors faster.",
    start_url: "/",
    display: "standalone",
    background_color: "#080b0e",
    theme_color: "#080b0e",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
