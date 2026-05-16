// Admin-only AI blog generator using Lovable AI Gateway
// Two actions:
//   - "research": returns 5 SEO-optimized topic ideas as JSON
//   - "write":    returns a full publish-ready HTML blog post for a selected topic
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-pro";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const SITE_CONTEXT = `wallly.in (also branded "Wallly") — tagline "Where the walls end, you find a friend."
A free, anonymous video and text chat platform that randomly pairs verified users for
real human conversation. Core features: random video chat, random text chat,
interest/age/gender matching, premium plan (virtual backgrounds, gender/age filters,
priority support, typing indicators, read receipts), communities, blog, safety/age (16+)
verification, email-verified accounts. Audience: lonely or curious people (16+) looking
for friendly, safe one-on-one conversation worldwide.
Plausible internal link targets: /, /premium, /communities, /blog, /how-to-use,
/contact, /privacy, /terms, /acceptable-use, /safety.`;

const SYSTEM_PROMPT = `You are an elite SEO content strategist and blog generation engine built exclusively for wallly.in.
You generate publish-ready, deeply optimized blog posts that target Google first-page rankings.
Never produce thin content. Never sacrifice structure. Always return valid JSON when asked.

SITE CONTEXT:
${SITE_CONTEXT}

ABSOLUTE RULES:
- Never use the banned filler: "delve into", "in today's digital landscape", "it's important to note", "leverage", "very", "really", "just", "quite", "basically".
- Never start with "In this article" / "In this blog post" / "In conclusion" / "To summarize".
- Never use "click here" anchor text.
- Internal links must point to wallly.in pages (use full https://wallly.in/<slug> URLs).
- Active voice. Mix short and long sentences. Flesch 60–70.
- Every section >= 200 words. Total >= 1500 words.
- 3–7 internal links, descriptive anchors, never two in same paragraph.
- 5–7 schema-friendly FAQs. Each answer 60–100 words.
- Output clean semantic HTML (article, section, h1, h2, h3, p, a, ul, div).`;

async function callAI(messages: any[], temperature = 0.7) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages,
      temperature,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Workspace Settings.");
    throw new Error(`AI gateway error ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

function extractJson(text: string): any {
  // Strip code fences and parse first JSON object/array in text
  const cleaned = text.replace(/```json|```/g, "").trim();
  const firstBrace = cleaned.search(/[\[{]/);
  if (firstBrace < 0) throw new Error("Model returned no JSON");
  const lastBrace = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
  const slice = cleaned.slice(firstBrace, lastBrace + 1);
  return JSON.parse(slice);
}

async function assertAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("Unauthorized");
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) throw new Error("Unauthorized");
  const { data: isAdmin } = await supabase.rpc("has_role", {
    _user_id: userData.user.id,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden: admin role required");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    await assertAdmin(req);

    const body = await req.json();
    const { action, topic, niche, post: inputPost } = body;

    if (action === "research") {
      const userPrompt = `PHASE 1 — TOPIC & KEYWORD RESEARCH

Niche hint from admin (optional): ${niche || "(none — infer from site context)"}

Generate exactly 5 blog topic ideas for wallly.in. Each must:
- have low-to-medium keyword difficulty (KD < 40)
- have meaningful monthly search volume (500–5,000)
- be semantically relevant to wallly.in's core offering
- have a clear search intent
- have long-tail opportunities

Return ONLY a JSON array of 5 objects with this exact shape:
[
  {
    "primary_keyword": "string (2-5 words)",
    "lsi_keywords": ["string","string","string"],
    "intent": "informational|commercial|transactional",
    "title": "H1 under 60 chars, primary keyword near front",
    "meta_description": "145-155 chars, includes keyword + CTA",
    "slug": "lowercase-hyphenated-max-5-words",
    "word_count_target": 1500,
    "category": "string short category label"
  }
]
Return only the JSON. No prose, no markdown fences.`;

      const raw = await callAI(
        [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        0.8,
      );
      const ideas = extractJson(raw);
      return new Response(JSON.stringify({ ideas }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "write") {
      if (!topic) throw new Error("topic is required");

      const userPrompt = `PHASE 2 — FULL BLOG POST GENERATION

Selected topic:
${JSON.stringify(topic, null, 2)}

Generate a complete publish-ready post following the SEO rules above.

Return ONLY a JSON object with this exact shape:
{
  "title": "H1 string",
  "slug": "url-slug",
  "meta_description": "145-155 chars",
  "category": "category label",
  "primary_keyword": "string",
  "secondary_keywords": ["string","string"],
  "intent": "informational|commercial|transactional",
  "word_count": 1700,
  "hero_image_prompt": "40-80 word detailed image prompt (no text/logos, photorealistic or editorial illustration, 1200x630)",
  "hero_image_alt": "descriptive alt with keyword",
  "internal_links": ["https://wallly.in/...","https://wallly.in/..."],
  "html": "FULL valid semantic HTML of the post — must include <article> wrapping the post, <h1>, an intro paragraph, at least 6 <section class=\\"blog-section\\"> blocks each with an <h2>, multi-paragraph body and an <img src=\\"[IMAGE_PLACEHOLDER]\\" alt=\\"...\\" /> slot, a Frequently Asked Questions section with 5-7 <div class=\\"faq-item\\"><h3>Q</h3><p>A</p></div> entries, and a conclusion paragraph with an internal CTA link. Internal links must use full https://wallly.in/... URLs. No markdown, no <html>/<head>/<body> wrappers.",
  "section_image_prompts": [
    {"section_title": "string", "prompt": "40-80 word detailed image prompt", "alt": "alt with keyword"}
  ],
  "faq": [
    {"q": "question phrased as user types", "a": "60-100 word plain prose answer"}
  ],
  "schema_type": "Article",
  "og": {"title":"","description":"","image":""},
  "canonical": "https://wallly.in/<slug>"
}
Total HTML body must be >= 1500 words. Return only JSON, no fences.`;

      const raw = await callAI(
        [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        0.6,
      );
      const post = extractJson(raw);
      return new Response(JSON.stringify({ post }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "audit" || action === "autofix") {
      if (!inputPost?.html || !inputPost?.primary_keyword) {
        throw new Error("post.html and post.primary_keyword are required");
      }

      const plainText = String(inputPost.html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const wordCount = plainText.split(/\s+/).filter(Boolean).length;

      const auditPrompt = `PHASE 3 — SEO AUDIT for wallly.in

You are a brutally honest, data-driven SEO auditor. Be strict. A 10 is near impossible. A 7 is good. Below 5 is failure.

POST METADATA:
- title: ${inputPost.title || ""}
- slug: ${inputPost.slug || ""}
- meta_description: ${inputPost.meta_description || ""}
- primary_keyword: ${inputPost.primary_keyword}
- secondary_keywords: ${JSON.stringify(inputPost.secondary_keywords || [])}
- canonical: ${inputPost.canonical || ""}
- word_count_observed: ${wordCount}

POST HTML:
"""
${String(inputPost.html).slice(0, 18000)}
"""

Score each of these 10 dimensions 0-10 with strict rubric:
1) Title Tag & H1, 2) Meta Description, 3) Keyword Usage & Density,
4) Content Depth & Length, 5) Readability & Writing Quality,
6) Internal Linking, 7) Image SEO, 8) URL Slug Quality,
9) FAQ & Schema Readiness, 10) Overall Publish Readiness.

Apply the penalty rules from the wallly.in SEO Checker spec. Flag every
banned filler ("delve into","in today's digital landscape","it's important to note","leverage","furthermore","utilize","in conclusion","to summarize","very","really","basically","quite","just").
Flag every "click here"/"read more" anchor. Compute keyword density.

Return ONLY this JSON (no fences, no prose):
{
  "total_score": 0,
  "verdict": "READY|MINOR_FIXES|SIGNIFICANT_REVISION|MAJOR_REWRITE",
  "dimensions": [
    {"name":"Title Tag & H1","score":0,"status":"PASS|NEEDS_FIX|FAIL","notes":"","fix":""},
    {"name":"Meta Description","score":0,"status":"","notes":"","fix":""},
    {"name":"Keyword Usage & Density","score":0,"status":"","notes":"","density_percent":0,"occurrences":0,"fix":""},
    {"name":"Content Depth & Length","score":0,"status":"","notes":"","word_count":0,"fix":""},
    {"name":"Readability & Writing Quality","score":0,"status":"","notes":"","banned_phrases_found":[],"fix":""},
    {"name":"Internal Linking","score":0,"status":"","notes":"","link_audit":[{"anchor":"","url":"","section":"","pass":true}],"fix":""},
    {"name":"Image SEO","score":0,"status":"","notes":"","image_audit":[{"position":"","alt":"","keyword_present":false,"pass":true}],"fix":""},
    {"name":"URL Slug Quality","score":0,"status":"","notes":"","corrected_slug":"","fix":""},
    {"name":"FAQ & Schema Readiness","score":0,"status":"","notes":"","fix":""},
    {"name":"Overall Publish Readiness","score":0,"status":"","notes":"","fix":""}
  ],
  "critical_issues": ["short bullet"],
  "recommended_improvements": ["short bullet"],
  "exact_rewrites": {
    "h1": "",
    "meta_description": "",
    "slug": "",
    "failing_faqs": [{"old":"","new_q":"","new_a":""}],
    "anchor_text_fixes": [{"old":"","new":""}]
  }
}`;

      const auditRaw = await callAI(
        [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: auditPrompt },
        ],
        0.3,
      );
      const audit = extractJson(auditRaw);

      if (action === "audit") {
        return new Response(JSON.stringify({ audit, word_count: wordCount }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const fixPrompt = `PHASE 4 — AUTO-FIX

Audit you produced:
${JSON.stringify(audit)}

ORIGINAL POST JSON:
${JSON.stringify({
  title: inputPost.title,
  slug: inputPost.slug,
  meta_description: inputPost.meta_description,
  category: inputPost.category,
  primary_keyword: inputPost.primary_keyword,
  secondary_keywords: inputPost.secondary_keywords,
  canonical: inputPost.canonical,
  html: String(inputPost.html).slice(0, 18000),
})}

Apply EVERY flagged fix: rewrite H1, meta, slug, anchor texts, alt texts,
failing FAQs, replace banned filler, fix keyword density gaps, ensure
>=1500 words, >=6 H2 sections, 5-7 FAQs, 3-7 internal wallly.in links
with descriptive anchors (never "click here"/"read more"), at least 1
internal link in first 3 sections, image alt text including primary
keyword on >=1 image.

Return ONLY this JSON (same shape as Phase 2 output, no fences):
{
  "title":"","slug":"","meta_description":"","category":"",
  "primary_keyword":"","secondary_keywords":[],"intent":"",
  "word_count":0,"hero_image_prompt":"","hero_image_alt":"",
  "internal_links":[],"html":"FULL revised semantic HTML",
  "section_image_prompts":[{"section_title":"","prompt":"","alt":""}],
  "faq":[{"q":"","a":""}],"schema_type":"Article",
  "og":{"title":"","description":"","image":""},
  "canonical":"https://wallly.in/<slug>"
}`;

      const fixedRaw = await callAI(
        [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: fixPrompt },
        ],
        0.5,
      );
      const fixedPost = extractJson(fixedRaw);
      return new Response(JSON.stringify({ post: fixedPost, previous_audit: audit }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (e: any) {
    console.error("generate-blog-post error:", e?.message || e);
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
