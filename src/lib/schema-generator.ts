/**
 * Generate HowTo schema for error guides with quick fix and solutions
 */
export function generateHowToSchema({
  title,
  description,
  steps,
  siteUrl,
}: {
  title: string;
  description: string;
  steps: Array<{ name: string; description: string; url: string }>;
  siteUrl: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: title,
    description,
    image: `${siteUrl}/og-image.png`,
    estimatedCost: {
      "@type": "PriceSpecification",
      priceCurrency: "USD",
      price: "0",
    },
    totalTime: "PT5M",
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: (index + 1).toString(),
      name: step.name,
      description: step.description,
      url: `${siteUrl}${step.url}#step-${index + 1}`,
    })),
  };
}

/**
 * Generate FAQPage schema for FAQ sections
 */
export function generateFaqSchema({
  title,
  faqs,
  siteUrl,
}: {
  title: string;
  faqs: Array<{ question: string; answer: string }>;
  siteUrl: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    name: title,
    url: siteUrl,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate NewsArticle/Article schema for error guides
 */
export function generateArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author,
  url,
  keywords,
}: {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
  author: string;
  url: string;
  keywords: string[];
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline,
    description,
    image,
    datePublished,
    dateModified,
    author: {
      "@type": "Organization",
      name: author,
    },
    keywords: keywords.join(", "),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}

/**
 * Generate BreadcrumbList schema for navigation
 */
export function generateBreadcrumbSchema({
  items,
  siteUrl,
}: {
  items: Array<{ name: string; url: string }>;
  siteUrl: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${siteUrl}${item.url}`,
    })),
  };
}

/**
 * Generate combined schema graph for error pages
 */
export function generateErrorPageSchema({
  slug,
  title,
  excerpt,
  language,
  framework,
  tags,
  quickFixSteps,
  faqs,
  siteUrl,
  datePublished,
  dateModified,
}: {
  slug: string;
  title: string;
  excerpt: string;
  language: string;
  framework?: string;
  tags: string[];
  quickFixSteps: Array<{ name: string; description: string }>;
  faqs: Array<{ question: string; answer: string }>;
  siteUrl: string;
  datePublished: string;
  dateModified: string;
}): object {
  const pageUrl = `${siteUrl}/errors/${slug}`;
  const imageUrl = `${siteUrl}/api/og?slug=${slug}&title=${encodeURIComponent(title)}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": pageUrl,
        url: pageUrl,
        name: `${title} - MediaToolkit`,
        description: excerpt,
        image: {
          "@type": "ImageObject",
          url: imageUrl,
          width: 1200,
          height: 630,
        },
        datePublished,
        dateModified,
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
      },
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        headline: title,
        description: excerpt,
        image: imageUrl,
        datePublished,
        dateModified,
        author: {
          "@type": "Organization",
          "@id": `${siteUrl}/#organization`,
          name: "MediaToolkit",
        },
        publisher: {
          "@type": "Organization",
          "@id": `${siteUrl}/#organization`,
          name: "MediaToolkit",
          logo: {
            "@type": "ImageObject",
            url: `${siteUrl}/icon.svg`,
          },
        },
        inLanguage: language.toLowerCase(),
        keywords: tags.join(", "),
        mainEntityOfPage: {
          "@id": pageUrl,
        },
      },
      {
        "@type": "HowTo",
        "@id": `${pageUrl}#howto`,
        name: `How to fix ${title}`,
        description: `Step-by-step guide to resolve ${title} error in ${framework || language}`,
        image: imageUrl,
        totalTime: "PT5M",
        step: quickFixSteps.map((step, index) => ({
          "@type": "HowToStep",
          position: (index + 1).toString(),
          name: step.name,
          text: step.description,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Errors",
            item: `${siteUrl}/search`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: language,
            item: `${siteUrl}/search?lang=${encodeURIComponent(language)}`,
          },
          ...(framework
            ? [
                {
                  "@type": "ListItem",
                  position: 4,
                  name: framework,
                  item: `${siteUrl}/search?fw=${encodeURIComponent(framework)}`,
                },
              ]
            : []),
          {
            "@type": "ListItem",
            position: (framework ? 5 : 4) as number,
            name: title,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "MediaToolkit",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/icon.svg`,
          width: 512,
          height: 512,
        },
        sameAs: [
          "https://github.com/STEVOHCODER/MediaToolkit",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "Support",
          url: `${siteUrl}/resources/github`,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "MediaToolkit",
        description: "Search programming errors, identify root causes, and get probability-ranked fixes",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/search?q={search_term_string}`,
          },
          query_input: "required name=search_term_string",
        },
      },
    ],
  };
}

/**
 * Generate tutorial page schema
 */
export function generateTutorialSchema({
  slug,
  title,
  excerpt,
  technology,
  datePublished,
  dateModified,
  siteUrl,
}: {
  slug: string;
  title: string;
  excerpt: string;
  technology: string;
  datePublished: string;
  dateModified: string;
  siteUrl: string;
}): object {
  const pageUrl = `${siteUrl}/tutorials/${slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        "@id": pageUrl,
        url: pageUrl,
        name: title,
        description: excerpt,
        educationalLevel: "Beginner to Advanced",
        author: {
          "@type": "Organization",
          name: "MediaToolkit",
        },
        learningResourceType: "Tutorial",
        inLanguage: "en",
      },
      {
        "@type": "Article",
        headline: title,
        description: excerpt,
        author: {
          "@type": "Organization",
          name: "MediaToolkit",
        },
        datePublished,
        dateModified,
        mainEntityOfPage: pageUrl,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Tutorials",
            item: `${siteUrl}/tutorials`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: technology,
            item: `${siteUrl}/tutorials?tech=${encodeURIComponent(technology)}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: title,
            item: pageUrl,
          },
        ],
      },
    ],
  };
}
