import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geist = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mediatoolkit.tech";

const siteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MediaToolkit - Fix programming errors faster",
    template: "%s | MediaToolkit",
  },
  description:
    "Search exact programming errors and stack traces, compare verified answers, ask debugging questions, and practice fixes in an interactive coding lab.",
  applicationName: "MediaToolkit",
  keywords: [
    "programming errors",
    "debugging",
    "error messages",
    "stack trace",
    "developer tools",
    "programming questions",
    "coding answers",
    "interactive debugging lab",
  ],
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
  },
  manifest: "/manifest.webmanifest",
  verification: siteVerification ? { google: siteVerification } : undefined,
  openGraph: {
    type: "website",
    siteName: "MediaToolkit",
    title: "Fix programming errors faster",
    description:
      "Search an error or stack trace, understand the root cause, and test the verified fix.",
    url: siteUrl,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MediaToolkit" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MediaToolkit",
    description: "Programming errors in. Verified answers and practice out.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#5b5bd6",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <body suppressHydrationWarning>
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT ? (
          <Script
            id="devfixes-adsense"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
          />
        ) : null}
        <div className="ambient-grid" aria-hidden="true" />
        <SiteHeader />
        <div className="pt-16 lg:pl-64 lg:pt-0">
          <main className="min-h-screen">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
