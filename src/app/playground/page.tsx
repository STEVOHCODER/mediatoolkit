import type { Metadata } from "next";
import { UniversalLab } from "@/components/universal-lab";

export const metadata: Metadata = {
  title: "Debugging learning IDE",
  description: "Write code, reproduce failures, inspect diagnostics, learn from guided examples, and pair with Gemini across popular developer tools.",
  alternates: { canonical: "/playground" },
};

export default function PlaygroundPage() {
  return <UniversalLab />;
}
