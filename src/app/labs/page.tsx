import type { Metadata } from "next";
import { LabsCatalog } from "@/components/labs-catalog";

export const metadata: Metadata = {
  title: "MediaToolkit Labs",
  description:
    "Practice solving realistic programming errors inside safe, interactive debugging labs.",
  alternates: { canonical: "/labs" },
};

export default function LabsPage() {
  return <LabsCatalog isolatedRunnerConfigured={Boolean(process.env.E2B_API_KEY)} />;
}
