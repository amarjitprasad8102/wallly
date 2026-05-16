import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, FileText, Save, ArrowLeft, Wand2, Image as ImageIcon, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";

interface TopicIdea {
  primary_keyword: string;
  lsi_keywords: string[];
  intent: string;
  title: string;
  meta_description: string;
  slug: string;
  word_count_target: number;
  category: string;
}

interface GeneratedPost {
  title: string;
  slug: string;
  meta_description: string;
  category: string;
  primary_keyword: string;
  secondary_keywords: string[];
  intent: string;
  word_count: number;
  hero_image_prompt: string;
  hero_image_alt: string;
  internal_links: string[];
  html: string;
  section_image_prompts: { section_title: string; prompt: string; alt: string }[];
  faq: { q: string; a: string }[];
  schema_type: string;
  og: { title: string; description: string; image: string };
  canonical: string;
}

type Step = "research" | "ideas" | "writing" | "review";

interface AuditDimension {
  name: string;
  score: number;
  status: string;
  notes?: string;
  fix?: string;
  density_percent?: number;
  occurrences?: number;
  word_count?: number;
  banned_phrases_found?: string[];
  corrected_slug?: string;
}
interface AuditReport {
  total_score: number;
  verdict: string;
  dimensions: AuditDimension[];
  critical_issues: string[];
  recommended_improvements: string[];
  exact_rewrites: {
    h1?: string;
    meta_description?: string;
    slug?: string;
    failing_faqs?: { old: string; new_q: string; new_a: string }[];
    anchor_text_fixes?: { old: string; new: string }[];
  };
}

export function AdminBlogGenerator({ onSaved }: { onSaved?: () => void }) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("research");
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<TopicIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<TopicIdea | null>(null);
  const [post, setPost] = useState<GeneratedPost | null>(null);
  const [heroImageUrl, setHeroImageUrl] = useState("/placeholder.svg");
  const [publishOnSave, setPublishOnSave] = useState(false);
  const [audit, setAudit] = useState<AuditReport | null>(null);
  const [auditing, setAuditing] = useState(false);
  const [previousAudit, setPreviousAudit] = useState<AuditReport | null>(null);


  const runResearch = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-blog-post", {
        body: { action: "research", niche: niche.trim() || undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setIdeas(data.ideas || []);
      setStep("ideas");
    } catch (e: any) {
      toast({ title: "Research failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const generatePost = async (idea: TopicIdea) => {
    setSelectedIdea(idea);
    setStep("writing");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-blog-post", {
        body: { action: "write", topic: idea },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setPost(data.post);
      setAudit(null);
      setPreviousAudit(null);
      setStep("review");
      // auto-run SEO audit
      setTimeout(() => runAudit(data.post), 50);
    } catch (e: any) {
      toast({ title: "Generation failed", description: e.message, variant: "destructive" });
      setStep("ideas");
    } finally {
      setLoading(false);
    }
  };

  const uploadHeroImage = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Max 5MB", variant: "destructive" });
      return;
    }
    try {
      const ext = file.name.split(".").pop();
      const filePath = `blog/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("blog-images").upload(filePath, file);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("blog-images").getPublicUrl(filePath);
      setHeroImageUrl(publicUrl);
      toast({ title: "Hero image uploaded" });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    }
  };

  const savePost = async () => {
    if (!post) return;
    setLoading(true);
    try {
      // Inject hero image at top of HTML if uploaded
      const finalHtml = post.html.split("[IMAGE_PLACEHOLDER]").join(heroImageUrl);
      const { error } = await supabase.from("blog_posts").insert([{
        slug: post.slug,
        title: post.title,
        meta_description: post.meta_description,
        category: post.category,
        author: "Wallly Team",
        image_url: heroImageUrl,
        content: finalHtml,
        is_published: publishOnSave,
      }]);
      if (error) throw error;
      toast({ title: "Blog saved", description: publishOnSave ? "Published live" : "Saved as draft" });
      // reset
      setStep("research");
      setIdeas([]);
      setSelectedIdea(null);
      setPost(null);
      setHeroImageUrl("/placeholder.svg");
      setPublishOnSave(false);
      onSaved?.();
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const runAudit = async (target?: GeneratedPost) => {
    const p = target || post;
    if (!p) return;
    setAuditing(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-blog-post", {
        body: { action: "audit", post: p },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAudit(data.audit);
    } catch (e: any) {
      toast({ title: "Audit failed", description: e.message, variant: "destructive" });
    } finally {
      setAuditing(false);
    }
  };

  const autoFix = async () => {
    if (!post) return;
    setAuditing(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-blog-post", {
        body: { action: "autofix", post },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setPreviousAudit(audit);
      setPost(data.post);
      setAudit(null);
      toast({ title: "Post auto-fixed", description: "Re-running SEO audit..." });
      setTimeout(() => runAudit(data.post), 50);
    } catch (e: any) {
      toast({ title: "Auto-fix failed", description: e.message, variant: "destructive" });
    } finally {
      setAuditing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Blog Generator
        </CardTitle>
        <CardDescription>
          SEO-optimized blog posts for wallly.in. Phase 1 researches topics, Phase 2 writes the full post.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === "research" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="niche">Niche hint (optional)</Label>
              <Input
                id="niche"
                placeholder="e.g. random video chat safety, online friendships, etc."
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to let AI infer from wallly.in's positioning.
              </p>
            </div>
            <Button onClick={runResearch} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Research 5 Topic Ideas
            </Button>
          </div>
        )}

        {step === "ideas" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Pick a topic to write</h3>
              <Button variant="ghost" size="sm" onClick={() => setStep("research")} className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </div>
            <div className="grid gap-3">
              {ideas.map((idea, i) => (
                <Card key={i} className="border-border/60 hover:border-primary/40 transition-colors">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h4 className="font-medium leading-tight">{idea.title}</h4>
                        <p className="text-sm text-muted-foreground">{idea.meta_description}</p>
                      </div>
                      <Button size="sm" onClick={() => generatePost(idea)} disabled={loading} className="gap-1 shrink-0">
                        <Wand2 className="h-4 w-4" /> Write
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      <Badge variant="default">{idea.primary_keyword}</Badge>
                      <Badge variant="outline">{idea.intent}</Badge>
                      <Badge variant="secondary">{idea.word_count_target}+ words</Badge>
                      <Badge variant="outline" className="font-mono">/{idea.slug}</Badge>
                      {idea.lsi_keywords?.map((k, j) => (
                        <Badge key={j} variant="secondary" className="opacity-70">{k}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === "writing" && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Writing your SEO blog post... this can take 30–60 seconds.</p>
            {selectedIdea && <p className="text-sm">{selectedIdea.title}</p>}
          </div>
        )}

        {step === "review" && post && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" /> Review & Edit
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setStep("ideas")} className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Back to ideas
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label>Title</Label>
                <Input value={post.title} onChange={(e) => setPost({ ...post, title: e.target.value })} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={post.slug} onChange={(e) => setPost({ ...post, slug: e.target.value })} />
              </div>
              <div>
                <Label>Category</Label>
                <Input value={post.category} onChange={(e) => setPost({ ...post, category: e.target.value })} />
              </div>
              <div>
                <Label>Word count (est.)</Label>
                <Input value={String(post.word_count)} readOnly />
              </div>
              <div className="md:col-span-2">
                <Label>Meta description</Label>
                <Textarea
                  rows={2}
                  value={post.meta_description}
                  onChange={(e) => setPost({ ...post, meta_description: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Hero image
              </Label>
              <div className="flex items-center gap-3">
                <img src={heroImageUrl} alt="hero preview" className="h-20 w-32 object-cover rounded border" />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && uploadHeroImage(e.target.files[0])}
                  className="max-w-sm"
                />
              </div>
              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer">Suggested hero prompt</summary>
                <p className="mt-2 italic">{post.hero_image_prompt}</p>
              </details>
            </div>

            <div>
              <Label>HTML content (editable)</Label>
              <Textarea
                rows={18}
                className="font-mono text-xs"
                value={post.html}
                onChange={(e) => setPost({ ...post, html: e.target.value })}
              />
            </div>

            <details className="border rounded p-3 text-sm">
              <summary className="cursor-pointer font-medium">Section image prompts ({post.section_image_prompts?.length || 0})</summary>
              <div className="mt-3 space-y-2">
                {post.section_image_prompts?.map((s, i) => (
                  <div key={i} className="border-l-2 pl-3 py-1">
                    <p className="font-medium text-sm">{s.section_title}</p>
                    <p className="text-xs text-muted-foreground italic">{s.prompt}</p>
                  </div>
                ))}
              </div>
            </details>

            <details className="border rounded p-3 text-sm">
              <summary className="cursor-pointer font-medium">Live preview</summary>
              <div
                className="mt-3 prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: post.html.split("[IMAGE_PLACEHOLDER]").join(heroImageUrl) }}
              />
            </details>

            <div className="flex items-center gap-3 pt-2 border-t">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={publishOnSave}
                  onChange={(e) => setPublishOnSave(e.target.checked)}
                />
                Publish immediately
              </label>
              <Button onClick={savePost} disabled={loading} className="ml-auto gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Blog Post
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
