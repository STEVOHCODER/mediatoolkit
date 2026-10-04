import type { Metadata } from "next";
import { QuestionsHub, type QuestionSummary } from "@/components/questions-hub";
import { getPublishedErrors } from "@/lib/error-repository";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Programming questions, errors, and verified answers",
  description: "Browse programming questions by error message, language, framework, and tag. Compare verified fixes, vote on helpful answers, and practice solutions.",
  keywords: ["programming questions", "debugging questions", "coding errors", "developer answers", "stack trace help"],
  alternates: { canonical: "/questions" },
  openGraph: { title: "Programming questions and verified fixes", description: "Search real error messages and learn from evidence-backed answers.", url: "/questions" },
};

export default async function QuestionsPage() {
  const articles = await getPublishedErrors();
  const questions: QuestionSummary[] = articles.map((article) => ({ id: article.slug, title: article.title, excerpt: article.excerpt, href: `/errors/${article.slug}`, votes: Math.max(1, Math.round(article.popularity / 8)), answers: article.solutions.length, views: article.views, tags: article.tags, author: "MediaToolkit editors", askedAt: article.verifiedAt, solved: article.solutions.length > 0 }));
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mediatoolkit.tech";
  const schema = { "@context": "https://schema.org", "@type": "CollectionPage", name: "Programming questions and verified fixes", description: metadata.description, url: `${baseUrl}/questions`, mainEntity: { "@type": "ItemList", itemListElement: questions.slice(0, 20).map((question, index) => ({ "@type": "ListItem", position: index + 1, url: `${baseUrl}${question.href}`, name: question.title })) } };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} /><QuestionsHub initialQuestions={questions} /></>;
}
