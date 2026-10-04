import { errorArticles } from "@/lib/data";
import type { DebugAnalysis, Fingerprint } from "@/lib/types";

type Signature = {
  test: RegExp;
  language: string;
  framework?: string;
  errorType: string;
  rootCause: string;
  confidence: number;
  severity: Fingerprint["severity"];
  matchedSlug?: string;
};

const signatures: Signature[] = [
  {
    test: /ModuleNotFoundError: No module named ['"]requests['"]/i,
    language: "Python",
    errorType: "ModuleNotFoundError",
    rootCause: "The requests package is missing from the active Python environment.",
    confidence: 97,
    severity: "Medium",
    matchedSlug: "python-modulenotfounderror-requests",
  },
  {
    test: /ModuleNotFoundError|No module named/i,
    language: "Python",
    errorType: "ModuleNotFoundError",
    rootCause: "Python cannot resolve the requested module in the active environment.",
    confidence: 91,
    severity: "Medium",
    matchedSlug: "python-modulenotfounderror",
  },
  {
    test: /Cannot read propert(?:y|ies) of undefined/i,
    language: "JavaScript",
    errorType: "TypeError",
    rootCause: "A property access is running on an undefined value.",
    confidence: 96,
    severity: "High",
    matchedSlug: "javascript-cannot-read-properties-of-undefined",
  },
  {
    test: /Hydration failed|server rendered HTML didn't match|server rendered HTML did not match/i,
    language: "TypeScript",
    framework: "Next.js",
    errorType: "Hydration mismatch",
    rootCause: "The server and first client render produced different HTML.",
    confidence: 95,
    severity: "High",
    matchedSlug: "nextjs-hydration-failed",
  },
  {
    test: /Cannot connect to the Docker daemon|docker\.sock/i,
    language: "Docker",
    errorType: "Daemon connection failure",
    rootCause: "The Docker client cannot reach the Docker engine.",
    confidence: 96,
    severity: "High",
    matchedSlug: "docker-daemon-not-running",
  },
  {
    test: /non-fast-forward|fetch first/i,
    language: "Git",
    errorType: "Push rejected",
    rootCause: "The remote branch contains commits missing from the local branch.",
    confidence: 93,
    severity: "Medium",
    matchedSlug: "git-non-fast-forward",
  },
  {
    test: /git@github\.com: Permission denied \(publickey\)|Permission denied \(publickey\).*github/i,
    language: "Git",
    framework: "GitHub",
    errorType: "SSH authentication failure",
    rootCause: "GitHub did not accept any SSH key offered by this computer.",
    confidence: 98,
    severity: "High",
    matchedSlug: "github-permission-denied-publickey",
  },
  {
    test: /Process completed with exit code 1/i,
    language: "YAML",
    framework: "GitHub Actions",
    errorType: "Workflow command failure",
    rootCause: "A command in the failed Actions step returned a non-zero exit status.",
    confidence: 94,
    severity: "High",
    matchedSlug: "github-actions-process-completed-exit-code-1",
  },
  {
    test: /(?:code: command not found|'code' is not recognized|code is not recognized)/i,
    language: "Shell",
    framework: "VS Code",
    errorType: "CLI launcher missing from PATH",
    rootCause: "The terminal cannot locate the Visual Studio Code command-line launcher.",
    confidence: 96,
    severity: "Low",
    matchedSlug: "vscode-code-command-not-found",
  },
  {
    test: /ERR_MODULE_NOT_FOUND|Cannot find package .* imported from/i,
    language: "JavaScript",
    framework: "Node.js",
    errorType: "Module resolution failure",
    rootCause: "Node.js cannot resolve the imported package or file from the active project.",
    confidence: 97,
    severity: "High",
    matchedSlug: "node-err-module-not-found",
  },
  {
    test: /ERESOLVE|unable to resolve dependency tree/i,
    language: "JavaScript",
    framework: "npm",
    errorType: "Dependency conflict",
    rootCause: "Installed package versions have incompatible peer requirements.",
    confidence: 96,
    severity: "Medium",
    matchedSlug: "npm-eresolve-dependency-tree",
  },
  {
    test: /CrashLoopBackOff/i,
    language: "Kubernetes",
    errorType: "Container restart loop",
    rootCause: "A container repeatedly exits after Kubernetes starts it.",
    confidence: 94,
    severity: "High",
    matchedSlug: "kubernetes-crashloopbackoff",
  },
  {
    test: /ECONNREFUSED[\s\S]*5432|connection[\s\S]*refused[\s\S]*postgres|could not connect to server[\s\S]*refused/i,
    language: "PostgreSQL",
    errorType: "Connection refused",
    rootCause: "No PostgreSQL server accepted the network connection.",
    confidence: 92,
    severity: "High",
    matchedSlug: "postgres-connection-refused",
  },
  {
    test: /Too many re-renders/i,
    language: "JavaScript",
    framework: "React",
    errorType: "Render loop",
    rootCause: "The component triggers another state update during each render.",
    confidence: 96,
    severity: "High",
    matchedSlug: "react-too-many-re-renders",
  },
  {
    test: /is not assignable to type/i,
    language: "TypeScript",
    errorType: "Type incompatibility",
    rootCause: "A value does not satisfy the destination TypeScript contract.",
    confidence: 90,
    severity: "Medium",
    matchedSlug: "typescript-type-not-assignable",
  },
  {
    test: /Module not found: Can't resolve|Module not found.*cannot resolve/i,
    language: "TypeScript",
    framework: "Next.js",
    errorType: "Module resolution failure",
    rootCause: "The build system cannot resolve an imported file or package.",
    confidence: 93,
    severity: "High",
    matchedSlug: "nextjs-module-not-found",
  },
  {
    test: /PermissionError:.*Permission denied|\[Errno 13\]/i,
    language: "Python",
    errorType: "PermissionError",
    rootCause: "The operating system denied a filesystem operation.",
    confidence: 94,
    severity: "Medium",
    matchedSlug: "python-permission-denied",
  },
  {
    test: /Traceback \(most recent call last\)/i,
    language: "Python",
    errorType: "Python exception",
    rootCause: "The final traceback line names the exception; the last project frame is usually actionable.",
    confidence: 82,
    severity: "Medium",
  },
  {
    test: /npm ERR!/i,
    language: "JavaScript",
    framework: "npm",
    errorType: "npm command failure",
    rootCause: "npm stopped after a package, script, network, or dependency error.",
    confidence: 78,
    severity: "Medium",
  },
  {
    test: /fatal:/i,
    language: "Git",
    errorType: "Git fatal error",
    rootCause: "Git could not continue the requested repository operation.",
    confidence: 67,
    severity: "Medium",
  },
];

function relevantLineNumbers(input: string) {
  const lines = input.split(/\r?\n/);
  const indexes = lines
    .map((line, index) => ({
      line,
      number: index + 1,
    }))
    .filter(({ line }) =>
      /error|exception|failed|fatal|caused by|line \d+|errno|undefined|refused|not found/i.test(line),
    )
    .map(({ number }) => number);

  return indexes.slice(-4);
}

export function fingerprintError(input: string): Fingerprint {
  const normalized = input.trim();
  const signature = signatures.find(({ test }) => test.test(normalized));

  if (signature) {
    return {
      language: signature.language,
      framework: signature.framework,
      errorType: signature.errorType,
      rootCause: signature.rootCause,
      confidence: signature.confidence,
      severity: signature.severity,
      relevantLines: relevantLineNumbers(normalized),
      matchedSlug: signature.matchedSlug,
    };
  }

  return {
    language: "Unknown",
    errorType: "Unclassified error",
    rootCause: "Add the complete error message or stack trace for a stronger fingerprint.",
    confidence: normalized ? 34 : 0,
    severity: "Low",
    relevantLines: relevantLineNumbers(normalized),
  };
}

export function createLocalAnalysis(input: string): DebugAnalysis {
  const fingerprint = fingerprintError(input);
  const article = fingerprint.matchedSlug
    ? errorArticles.find((item) => item.slug === fingerprint.matchedSlug)
    : undefined;

  const fixes = article?.solutions.slice(0, 3).map((solution) => ({
    title: solution.title,
    probability: solution.probability,
    explanation: solution.description,
    commands: solution.commands ?? article.quickFix.commands.slice(0, 1),
  })) ?? [
    {
      title: "Capture the complete failure context",
      probability: 61,
      explanation:
        "Include the full stack trace, command, runtime version, and the first error that appeared.",
      commands: [],
    },
    {
      title: "Inspect the last application-owned frame",
      probability: 48,
      explanation:
        "Framework internals often appear after the line in your code that supplied the invalid value.",
      commands: [],
    },
  ];

  return {
    language: fingerprint.language,
    framework: fingerprint.framework,
    errorType: fingerprint.errorType,
    summary: article?.excerpt ?? fingerprint.rootCause,
    explanation:
      article?.aiExplanation ??
      "MediaToolkit could not match this input to a verified fingerprint yet. The highlighted lines contain the strongest failure signals.",
    rootCause: fingerprint.rootCause,
    confidence: fingerprint.confidence,
    suspiciousLines: fingerprint.relevantLines.map((line) => ({
      line,
      reason: "This line contains a high-signal failure marker.",
    })),
    fixes,
    beginnerMistakes: [
      "Fixing the last visible symptom without checking the first relevant failure.",
      "Changing several variables at once, which makes the successful fix impossible to identify.",
    ],
    prevention: article?.causes.slice(0, 3) ?? [
      "Pin runtime and dependency versions.",
      "Validate configuration before starting the application.",
      "Keep a minimal reproducible command for the failing workflow.",
    ],
    relatedSlugs: article?.relatedSlugs ?? [],
    source: "local",
  };
}

export function searchErrors(query: string, articles = errorArticles) {
  const terms = query
    .toLowerCase()
    .replace(/[^\w+#.-]+/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 1);

  if (!terms.length) {
    return [...articles].sort((a, b) => b.popularity - a.popularity);
  }

  return articles
    .map((article) => {
      const title = article.title.toLowerCase();
      const body = [
        article.excerpt,
        article.language,
        article.framework,
        article.category,
        article.tags.join(" "),
        article.causes.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const score = terms.reduce((total, term) => {
        if (title.includes(term)) return total + 8;
        if (body.includes(term)) return total + 3;
        return total;
      }, 0);

      return { article, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.article.popularity - a.article.popularity)
    .map(({ article }) => article);
}
