# MediaToolkit Tutorial Publishing

The tutorial system has three supported authoring paths:

1. Structured editor
2. Markdown import
3. Complete JSON import

## 1. Structured editor

Open `/admin/tutorials`, choose `New`, and fill in:

- Title and URL slug
- Search excerpt
- Technology and category
- Difficulty and estimated time
- Tags
- Prerequisites and learning outcomes
- Markdown tutorial body
- Related error slugs
- FAQs
- Official documentation, GitHub, or discussion references

Use Markdown headings to create sections and fenced code blocks to create
copyable commands:

````markdown
## Verify the active interpreter

Run the command and compare the output with the failing environment.

```bash
python -m pip --version
```
````

## 2. Markdown import

Select `Import Markdown` and choose an `.md` file. The first `# Heading` is
used as the title when the title field is empty. The rest of the file becomes
the tutorial body.

Markdown import intentionally does not guess the technology, taxonomy,
difficulty, related errors, FAQs, or references. Complete those fields in the
studio so every public tutorial has reliable metadata.

## 3. Complete JSON import

Select the download button in the toolbar to get a valid starter file. Edit
the file in a text editor or generate it from another content system, then
select `Import JSON`.

The accepted shape is:

```json
{
  "status": "draft",
  "tutorial": {
    "slug": "python-imports-and-virtual-environments",
    "title": "Python imports and virtual environments",
    "excerpt": "Explain the concept and fix the common environment mismatch.",
    "technology": "Python",
    "category": "Language fundamentals",
    "difficulty": "Beginner",
    "estimatedTime": "20 min",
    "tags": ["python", "imports"],
    "prerequisites": ["Python 3 is installed."],
    "outcomes": ["Explain the import path."],
    "body": "## The concept\n\nWrite the tutorial here.",
    "relatedErrorSlugs": [],
    "faqs": [],
    "references": [],
    "publishedAt": "2026-07-29"
  }
}
```

The server validates the complete record again before saving. Invalid slugs,
URLs, dates, empty required fields, and incomplete FAQ or reference records
are rejected.

## Review and publication

Use the publication status selector:

- `Draft`: still being written
- `Needs review`: commands and references need checking
- `Published`: public and included in search, related links, and the sitemap

After saving, the site revalidates:

- `/`
- `/tutorials`
- `/tutorials/[slug]`
- `/sitemap.xml`

## Supabase requirement

Bundled tutorials are public without Supabase. Saving a new tutorial requires:

```powershell
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Then configure these server-side values in Vercel Production:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Keep `SUPABASE_SERVICE_ROLE_KEY` private. The admin studio uses the protected
admin session and the service-role client only on the server.
