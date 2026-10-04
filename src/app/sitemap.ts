import type { MetadataRoute } from "next";
import { getPublishedErrors } from "@/lib/error-repository";
import { labs } from "@/lib/labs-data";
import { getPublishedTutorials } from "@/lib/tutorial-repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mediatoolkit.tech";
  const verified = new Date("2026-07-31T00:00:00.000Z");
  const [errorArticles, tutorials] = await Promise.all([
    getPublishedErrors(),
    getPublishedTutorials(),
  ]);

  return [
    {
      url: baseUrl,
      lastModified: verified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: verified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/questions`,
      lastModified: verified,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/debug`,
      lastModified: verified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tutorials`,
      lastModified: verified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/labs`,
      lastModified: verified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/playground`,
      lastModified: verified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/resources/vscode`,
      lastModified: verified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/resources/github`,
      lastModified: verified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: verified,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: verified,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: verified,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: verified,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    ...errorArticles.map((article) => ({
      url: `${baseUrl}/errors/${article.slug}`,
      lastModified: new Date(`${article.verifiedAt}T00:00:00.000Z`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...tutorials.map((tutorial) => ({
      url: `${baseUrl}/tutorials/${tutorial.slug}`,
      lastModified: new Date(`${tutorial.publishedAt}T00:00:00.000Z`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...labs.map((lab) => ({
      url: `${baseUrl}/labs/${lab.slug}`,
      lastModified: verified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
