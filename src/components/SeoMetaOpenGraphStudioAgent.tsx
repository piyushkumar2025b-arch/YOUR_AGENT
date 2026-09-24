import React, { useState, useMemo, useEffect } from "react";
import {
  Globe,
  Share2,
  Search,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Save,
  Download,
  Code,
  FileCode,
  Sparkles,
  ExternalLink,
  Smartphone,
  Monitor,
  Eye,
  Layers,
  FileText,
  Sliders,
  Twitter,
  Facebook,
  Linkedin,
  MessageSquare
} from "lucide-react";
import { VirtualFile } from "../types";

interface SeoMetaOpenGraphStudioAgentProps {
  files: VirtualFile[];
  theme: "light" | "dark";
  onSaveFile?: (path: string, content: string) => void;
  onAddLog?: (type: string, message: string) => void;
}

export default function SeoMetaOpenGraphStudioAgent({
  files,
  theme,
  onSaveFile,
  onAddLog
}: SeoMetaOpenGraphStudioAgentProps) {
  // Discover initial SEO values from index.html or project files
  const initialMeta = useMemo(() => {
    let title = "AI Studio Remix - Full Stack Cloud IDE & Workspace";
    let description = "Build, test, deploy and iterate on full-stack web applications with visual developer tooling, live previews, and automated agents.";
    let ogImage = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=630&q=80";
    let siteUrl = "https://applet.ai-studio.dev";
    let keywords = "cloud ide, react, typescript, vite, dev tools, openapi, load testing";

    const indexFile = files.find(f => f.path.endsWith("index.html"));
    if (indexFile) {
      const titleMatch = indexFile.content.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) title = titleMatch[1].trim();

      const descMatch = indexFile.content.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
      if (descMatch && descMatch[1]) description = descMatch[1].trim();

      const ogImageMatch = indexFile.content.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
      if (ogImageMatch && ogImageMatch[1]) ogImage = ogImageMatch[1].trim();

      const kwMatch = indexFile.content.match(/<meta\s+name=["']keywords["']\s+content=["']([^"']+)["']/i);
      if (kwMatch && kwMatch[1]) keywords = kwMatch[1].trim();
    }

    return { title, description, ogImage, siteUrl, keywords };
  }, [files]);

  // Form State
  const [pageTitle, setPageTitle] = useState(initialMeta.title);
  const [metaDescription, setMetaDescription] = useState(initialMeta.description);
  const [canonicalUrl, setCanonicalUrl] = useState(initialMeta.siteUrl);
  const [ogImageUrl, setOgImageUrl] = useState(initialMeta.ogImage);
  const [keywords, setKeywords] = useState(initialMeta.keywords);
  const [author, setAuthor] = useState("AI Studio Engineering Team");
  const [robotsIndex, setRobotsIndex] = useState(true);
  const [robotsFollow, setRobotsFollow] = useState(true);
  const [twitterCardType, setTwitterCardType] = useState<"summary_large_image" | "summary">("summary_large_image");
  const [twitterCreator, setTwitterCreator] = useState("@GoogleAIStudio");
  const [themeColor, setThemeColor] = useState("#0f172a");
  const [schemaType, setSchemaType] = useState<"SoftwareApplication" | "WebSite" | "Organization" | "Article">("SoftwareApplication");

  // View tabs
  const [activeTab, setActiveTab] = useState<"previews" | "tags" | "schema" | "sitemap" | "robots">("previews");
  const [previewPlatform, setPreviewPlatform] = useState<"google" | "twitter" | "facebook" | "discord">("google");
  const [googleDevice, setGoogleDevice] = useState<"desktop" | "mobile">("desktop");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Character Count Calculations & SEO Health
  const titleLength = pageTitle.length;
  const descLength = metaDescription.length;

  const titleStatus = useMemo(() => {
    if (titleLength >= 50 && titleLength <= 60) return { label: "Optimal (50-60 chars)", color: "text-emerald-400" };
    if (titleLength < 50) return { label: "Short (< 50 chars)", color: "text-amber-400" };
    return { label: "Too Long (> 60 chars, will truncate in SERP)", color: "text-rose-400" };
  }, [titleLength]);

  const descStatus = useMemo(() => {
    if (descLength >= 140 && descLength <= 160) return { label: "Optimal (140-160 chars)", color: "text-emerald-400" };
    if (descLength < 140) return { label: "Short (< 140 chars)", color: "text-amber-400" };
    return { label: "Too Long (> 160 chars, will truncate)", color: "text-rose-400" };
  }, [descLength]);

  // Schema.org JSON-LD structured data generator
  const generatedJsonLd = useMemo(() => {
    if (schemaType === "SoftwareApplication") {
      return JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": pageTitle,
          "description": metaDescription,
          "url": canonicalUrl,
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "All modern web browsers",
          "author": {
            "@type": "Organization",
            "name": author
          },
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "128"
          }
        },
        null,
        2
      );
    } else if (schemaType === "WebSite") {
      return JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": pageTitle,
          "url": canonicalUrl,
          "description": metaDescription,
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${canonicalUrl}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        },
        null,
        2
      );
    } else if (schemaType === "Organization") {
      return JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": author,
          "url": canonicalUrl,
          "logo": ogImageUrl,
          "description": metaDescription,
          "sameAs": [
            "https://twitter.com/GoogleAIStudio",
            "https://github.com/google"
          ]
        },
        null,
        2
      );
    } else {
      return JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": pageTitle,
          "description": metaDescription,
          "image": ogImageUrl,
          "author": {
            "@type": "Person",
            "name": author
          },
          "publisher": {
            "@type": "Organization",
            "name": author,
            "logo": {
              "@type": "ImageObject",
              "url": ogImageUrl
            }
          },
          "datePublished": new Date().toISOString().split("T")[0]
        },
        null,
        2
      );
    }
  }, [schemaType, pageTitle, metaDescription, canonicalUrl, author, ogImageUrl]);

  // Generated HTML Head Tags
  const generatedHeadHtml = useMemo(() => {
    const robotsContent = `${robotsIndex ? "index" : "noindex"}, ${robotsFollow ? "follow" : "nofollow"}`;
    return `<!-- ========================================== -->
<!-- Primary SEO & Metadata -->
<!-- ========================================== -->
<title>${pageTitle}</title>
<meta name="description" content="${metaDescription}" />
<meta name="keywords" content="${keywords}" />
<meta name="author" content="${author}" />
<meta name="robots" content="${robotsContent}" />
<link rel="canonical" href="${canonicalUrl}" />
<meta name="theme-color" content="${themeColor}" />

<!-- ========================================== -->
<!-- Open Graph / Facebook / LinkedIn -->
<!-- ========================================== -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${canonicalUrl}" />
<meta property="og:title" content="${pageTitle}" />
<meta property="og:description" content="${metaDescription}" />
<meta property="og:image" content="${ogImageUrl}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="${pageTitle.split(" - ")[0] || "AI Studio App"}" />

<!-- ========================================== -->
<!-- Twitter Card -->
<!-- ========================================== -->
<meta name="twitter:card" content="${twitterCardType}" />
<meta name="twitter:url" content="${canonicalUrl}" />
<meta name="twitter:title" content="${pageTitle}" />
<meta name="twitter:description" content="${metaDescription}" />
<meta name="twitter:image" content="${ogImageUrl}" />
<meta name="twitter:creator" content="${twitterCreator}" />

<!-- ========================================== -->
<!-- Schema.org Structured Data (JSON-LD) -->
<!-- ========================================== -->
<script type="application/ld+json">
${generatedJsonLd}
</script>`;
  }, [
    pageTitle,
    metaDescription,
    keywords,
    author,
    robotsIndex,
    robotsFollow,
    canonicalUrl,
    themeColor,
    ogImageUrl,
    twitterCardType,
    twitterCreator,
    generatedJsonLd
  ]);

  // Generated sitemap.xml
  const generatedSitemapXml = useMemo(() => {
    const now = new Date().toISOString().split("T")[0];
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${canonicalUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${canonicalUrl}/docs</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${canonicalUrl}/api</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
  }, [canonicalUrl]);

  // Generated robots.txt
  const generatedRobotsTxt = useMemo(() => {
    return `# ==========================================
# robots.txt
# Generated by AI Studio SEO Architect
# ==========================================
User-agent: *
${robotsIndex ? "Allow: /" : "Disallow: /"}
Disallow: /api/private/
Disallow: /admin/

Sitemap: ${canonicalUrl}/sitemap.xml
`;
  }, [robotsIndex, canonicalUrl]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 1-Click File Injections
  const handleInjectIntoIndexHtml = () => {
    if (!onSaveFile) return;
    const indexFile = files.find(f => f.path.endsWith("index.html"));
    if (indexFile) {
      // Replace existing title and meta or append before </head>
      let content = indexFile.content;
      if (content.includes("</head>")) {
        // Remove existing title if present
        content = content.replace(/<title>.*?<\/title>/gi, "");
        content = content.replace(/<meta\s+name=["']description["'].*?>/gi, "");
        // Insert new tags right before </head>
        content = content.replace("</head>", `  ${generatedHeadHtml}\n  </head>`);
      } else {
        content = `${generatedHeadHtml}\n${content}`;
      }
      onSaveFile(indexFile.path, content);
      onAddLog?.("update", `Injected rich SEO, OpenGraph and JSON-LD meta into ${indexFile.path}`);
    } else {
      onSaveFile("index.html", `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n${generatedHeadHtml}\n</head>\n<body>\n  <div id="root"></div>\n</body>\n</html>`);
      onAddLog?.("create", "Created index.html with production SEO tags");
    }
  };

  const handleSaveRobots = () => {
    onSaveFile?.("public/robots.txt", generatedRobotsTxt);
    onAddLog?.("create", "Saved public/robots.txt to workspace");
  };

  const handleSaveSitemap = () => {
    onSaveFile?.("public/sitemap.xml", generatedSitemapXml);
    onAddLog?.("create", "Saved public/sitemap.xml to workspace");
  };

  return (
    <div className={`w-full h-full flex flex-col ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} overflow-hidden`}>
      {/* Top Banner */}
      <div className={`px-5 py-3 border-b flex items-center justify-between ${theme === "dark" ? "border-slate-800 bg-slate-900/70" : "border-slate-200 bg-white"}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight">SEO, OpenGraph & SERP Studio</h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Live Simulator
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive Google SERP, Twitter Cards & OpenGraph live feed simulator, Schema.org generator, and sitemaps.
            </p>
          </div>
        </div>

        {/* Quick Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleInjectIntoIndexHtml}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/30"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            Inject Meta to index.html
          </button>
          <button
            onClick={handleSaveSitemap}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              theme === "dark"
                ? "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
                : "border-slate-300 bg-white hover:bg-slate-100 text-slate-700"
            }`}
          >
            <Save className="w-3.5 h-3.5 text-cyan-400" />
            Save sitemap.xml
          </button>
          <button
            onClick={handleSaveRobots}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              theme === "dark"
                ? "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
                : "border-slate-300 bg-white hover:bg-slate-100 text-slate-700"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            Save robots.txt
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        {/* Left Form Editor */}
        <div className={`w-full md:w-96 border-r flex flex-col overflow-y-auto ${theme === "dark" ? "border-slate-800 bg-slate-900/40" : "border-slate-200 bg-slate-100/60"} p-4 space-y-4`}>
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-500" /> Metadata Architect
            </span>
          </div>

          {/* Page Title */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <label className="font-medium text-slate-300">Page Title</label>
              <span className={`text-[10px] font-mono ${titleStatus.color}`}>
                {titleLength}/60 ({titleStatus.label})
              </span>
            </div>
            <input
              type="text"
              value={pageTitle}
              onChange={e => setPageTitle(e.target.value)}
              className={`w-full px-2.5 py-1.5 rounded-md text-xs border focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
              }`}
            />
          </div>

          {/* Meta Description */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <label className="font-medium text-slate-300">Meta Description</label>
              <span className={`text-[10px] font-mono ${descStatus.color}`}>
                {descLength}/160 ({descStatus.label})
              </span>
            </div>
            <textarea
              rows={3}
              value={metaDescription}
              onChange={e => setMetaDescription(e.target.value)}
              className={`w-full p-2 rounded-md text-xs border focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
              }`}
            />
          </div>

          {/* Canonical URL */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Canonical Website URL</label>
            <input
              type="text"
              value={canonicalUrl}
              onChange={e => setCanonicalUrl(e.target.value)}
              className={`w-full px-2.5 py-1.5 rounded-md text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
              }`}
            />
          </div>

          {/* OpenGraph Image URL */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">OpenGraph Share Image URL</label>
            <input
              type="text"
              value={ogImageUrl}
              onChange={e => setOgImageUrl(e.target.value)}
              className={`w-full px-2.5 py-1.5 rounded-md text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
              }`}
            />
          </div>

          {/* Twitter Card Type & Creator */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Twitter Card</label>
              <select
                value={twitterCardType}
                onChange={e => setTwitterCardType(e.target.value as any)}
                className={`w-full px-2 py-1.5 rounded-md text-xs border ${
                  theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
                }`}
              >
                <option value="summary_large_image">Large Image</option>
                <option value="summary">Summary Small</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Twitter @handle</label>
              <input
                type="text"
                value={twitterCreator}
                onChange={e => setTwitterCreator(e.target.value)}
                className={`w-full px-2 py-1.5 rounded-md text-xs border ${
                  theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
                }`}
              />
            </div>
          </div>

          {/* Robots Index / Follow Switches */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-medium text-slate-300">Search Engine Indexing</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRobotsIndex(!robotsIndex)}
                className={`p-2 rounded-lg border text-left text-xs font-medium flex items-center justify-between ${
                  robotsIndex
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : "bg-slate-800/40 border-slate-700 text-slate-400"
                }`}
              >
                <span>Index (Allow)</span>
                {robotsIndex ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : null}
              </button>
              <button
                type="button"
                onClick={() => setRobotsFollow(!robotsFollow)}
                className={`p-2 rounded-lg border text-left text-xs font-medium flex items-center justify-between ${
                  robotsFollow
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : "bg-slate-800/40 border-slate-700 text-slate-400"
                }`}
              >
                <span>Follow Links</span>
                {robotsFollow ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : null}
              </button>
            </div>
          </div>

          {/* Schema.org Type */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Schema.org Structured Type</label>
            <select
              value={schemaType}
              onChange={e => setSchemaType(e.target.value as any)}
              className={`w-full px-2.5 py-1.5 rounded-md text-xs border ${
                theme === "dark" ? "bg-slate-800 border-slate-700 text-cyan-300" : "bg-white border-slate-300 text-cyan-600"
              }`}
            >
              <option value="SoftwareApplication">SoftwareApplication (SaaS / Web App)</option>
              <option value="WebSite">WebSite (Portal / Platform)</option>
              <option value="Organization">Organization (Company / Brand)</option>
              <option value="Article">Article (Documentation / Blog)</option>
            </select>
          </div>
        </div>

        {/* Right Main Preview & Code Area */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Top Navigation Bar */}
          <div className={`px-4 py-2 border-b flex items-center justify-between ${theme === "dark" ? "border-slate-800 bg-slate-900/60" : "border-slate-200 bg-slate-100"}`}>
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setActiveTab("previews")}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeTab === "previews"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Live Social Previews
              </button>
              <button
                onClick={() => setActiveTab("tags")}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeTab === "tags"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Generated HTML & Meta
              </button>
              <button
                onClick={() => setActiveTab("schema")}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeTab === "schema"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                JSON-LD Schema
              </button>
              <button
                onClick={() => setActiveTab("sitemap")}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeTab === "sitemap"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                sitemap.xml
              </button>
              <button
                onClick={() => setActiveTab("robots")}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeTab === "robots"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                robots.txt
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* VIEW 1: LIVE SOCIAL PREVIEWS */}
            {activeTab === "previews" && (
              <div className="space-y-6 max-w-3xl">
                {/* Platform Switcher Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewPlatform("google")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      previewPlatform === "google"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" /> Google Search SERP
                  </button>
                  <button
                    onClick={() => setPreviewPlatform("twitter")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      previewPlatform === "twitter"
                        ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    <Twitter className="w-3.5 h-3.5" /> Twitter / X
                  </button>
                  <button
                    onClick={() => setPreviewPlatform("facebook")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      previewPlatform === "facebook"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    <Facebook className="w-3.5 h-3.5" /> Facebook & LinkedIn
                  </button>
                  <button
                    onClick={() => setPreviewPlatform("discord")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      previewPlatform === "discord"
                        ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Discord / Slack
                  </button>
                </div>

                {/* 1. GOOGLE SERP PREVIEW */}
                {previewPlatform === "google" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Desktop & Mobile Google Search Result Card</span>
                      <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5">
                        <button
                          onClick={() => setGoogleDevice("desktop")}
                          className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                            googleDevice === "desktop" ? "bg-slate-700 text-white" : "text-slate-400"
                          }`}
                        >
                          <Monitor className="w-3.5 h-3.5" /> Desktop
                        </button>
                        <button
                          onClick={() => setGoogleDevice("mobile")}
                          className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                            googleDevice === "mobile" ? "bg-slate-700 text-white" : "text-slate-400"
                          }`}
                        >
                          <Smartphone className="w-3.5 h-3.5" /> Mobile
                        </button>
                      </div>
                    </div>

                    <div className={`p-6 rounded-2xl border ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} shadow-md max-w-2xl`}>
                      {/* URL & Favicon */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-5 h-5 rounded-full bg-cyan-600 flex items-center justify-center text-[10px] text-white font-bold">
                          AI
                        </div>
                        <div className="text-xs text-slate-400 font-sans truncate">
                          <span className="font-semibold text-slate-300">
                            {canonicalUrl.replace("https://", "").replace("http://", "").split("/")[0]}
                          </span>
                          <span className="text-slate-500"> › applet</span>
                        </div>
                      </div>

                      {/* SERP Blue Title */}
                      <div className="text-lg font-medium text-blue-400 hover:underline cursor-pointer leading-snug">
                        {pageTitle}
                      </div>

                      {/* SERP Snippet */}
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {metaDescription}
                      </p>

                      {/* Star Rating Rich Snippet */}
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-400">
                        <span>★★★★★</span>
                        <span className="text-slate-400 text-[11px]">Rating: 4.9 · 128 votes · Free · Developer Tool</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. TWITTER / X CARD */}
                {previewPlatform === "twitter" && (
                  <div className="space-y-3">
                    <div className="text-xs text-slate-400">
                      Twitter / X Feed Social Share Preview ({twitterCardType})
                    </div>
                    <div className={`rounded-2xl border overflow-hidden max-w-xl ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} shadow-lg`}>
                      {/* Image Banner */}
                      <div className="w-full h-56 bg-slate-800 relative overflow-hidden">
                        <img
                          src={ogImageUrl}
                          alt="OpenGraph Preview"
                          className="w-full h-full object-cover"
                          onError={e => {
                            (e.currentTarget as any).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=630&q=80";
                          }}
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] text-white font-mono">
                          {canonicalUrl.replace("https://", "").replace("http://", "").split("/")[0]}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 space-y-1">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          {canonicalUrl.replace("https://", "").replace("http://", "").split("/")[0]}
                        </div>
                        <div className="text-sm font-bold text-slate-100 leading-snug">
                          {pageTitle}
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-2">
                          {metaDescription}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. FACEBOOK & LINKEDIN CARD */}
                {previewPlatform === "facebook" && (
                  <div className="space-y-3">
                    <div className="text-xs text-slate-400">
                      Facebook & LinkedIn Feed Social Share Preview (1200x630 Aspect Ratio)
                    </div>
                    <div className={`rounded-2xl border overflow-hidden max-w-xl ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} shadow-lg`}>
                      <div className="w-full h-60 bg-slate-800 relative overflow-hidden">
                        <img
                          src={ogImageUrl}
                          alt="OpenGraph Share"
                          className="w-full h-full object-cover"
                          onError={e => {
                            (e.currentTarget as any).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=630&q=80";
                          }}
                        />
                      </div>
                      <div className={`p-4 border-t ${theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"} space-y-1`}>
                        <div className="text-[11px] font-bold text-slate-400 uppercase">
                          {canonicalUrl.replace("https://", "").replace("http://", "").toUpperCase()}
                        </div>
                        <div className="text-sm font-bold text-slate-100">
                          {pageTitle}
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-2">
                          {metaDescription}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. DISCORD / SLACK CARD */}
                {previewPlatform === "discord" && (
                  <div className="space-y-3">
                    <div className="text-xs text-slate-400">
                      Discord & Slack Bot Webhook Embed Preview
                    </div>
                    <div className={`p-4 rounded-xl border-l-4 border-l-cyan-500 border ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} max-w-md shadow-md space-y-2`}>
                      <div className="text-xs font-semibold text-slate-400">
                        {author}
                      </div>
                      <div className="text-sm font-bold text-cyan-400 hover:underline cursor-pointer">
                        {pageTitle}
                      </div>
                      <div className="text-xs text-slate-300">
                        {metaDescription}
                      </div>
                      <div className="w-full h-36 rounded-lg bg-slate-800 overflow-hidden mt-2">
                        <img
                          src={ogImageUrl}
                          alt="Embed"
                          className="w-full h-full object-cover"
                          onError={e => {
                            (e.currentTarget as any).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=630&q=80";
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: GENERATED HTML HEAD */}
            {activeTab === "tags" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <Code className="w-4 h-4 text-cyan-400" />
                      Generated Production HTML &lt;head&gt; Tags
                    </h3>
                    <p className="text-xs text-slate-400">
                      Paste directly into your `index.html` or Next.js/Vite entry template.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(generatedHeadHtml, "html")}
                      className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
                        theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
                      }`}
                    >
                      {copiedKey === "html" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy Meta Tags
                    </button>
                    <button
                      onClick={handleInjectIntoIndexHtml}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1.5 shadow"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Inject into index.html
                    </button>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border font-mono text-xs overflow-x-auto ${theme === "dark" ? "bg-slate-900 border-slate-800 text-cyan-200/90" : "bg-slate-900 text-cyan-200 border-slate-700"}`}>
                  <pre>{generatedHeadHtml}</pre>
                </div>
              </div>
            )}

            {/* VIEW 3: SCHEMA.ORG JSON-LD */}
            {activeTab === "schema" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-400" />
                      Schema.org JSON-LD Structured Data ({schemaType})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Standard JSON-LD for Google rich snippets and knowledge graph indexing.
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(generatedJsonLd, "schema")}
                    className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
                      theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
                    }`}
                  >
                    {copiedKey === "schema" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy JSON-LD
                  </button>
                </div>

                <div className={`p-4 rounded-xl border font-mono text-xs overflow-x-auto ${theme === "dark" ? "bg-slate-900 border-slate-800 text-amber-200/90" : "bg-slate-900 text-amber-200 border-slate-700"}`}>
                  <pre>{generatedJsonLd}</pre>
                </div>
              </div>
            )}

            {/* VIEW 4: SITEMAP.XML */}
            {activeTab === "sitemap" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-emerald-400" />
                      XML Sitemap Generator (`sitemap.xml`)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Helps search engine crawlers discover and index all public site endpoints.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(generatedSitemapXml, "sitemap")}
                      className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
                        theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
                      }`}
                    >
                      {copiedKey === "sitemap" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy XML
                    </button>
                    <button
                      onClick={handleSaveSitemap}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 shadow"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save public/sitemap.xml
                    </button>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border font-mono text-xs overflow-x-auto ${theme === "dark" ? "bg-slate-900 border-slate-800 text-emerald-200/90" : "bg-slate-900 text-emerald-200 border-slate-700"}`}>
                  <pre>{generatedSitemapXml}</pre>
                </div>
              </div>
            )}

            {/* VIEW 5: ROBOTS.TXT */}
            {activeTab === "robots" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-400" />
                      Robots Exclusion Protocol (`robots.txt`)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Directives for Googlebot, Bingbot and web scrapers.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(generatedRobotsTxt, "robots")}
                      className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
                        theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"
                      }`}
                    >
                      {copiedKey === "robots" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy robots.txt
                    </button>
                    <button
                      onClick={handleSaveRobots}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center gap-1.5 shadow"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save public/robots.txt
                    </button>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border font-mono text-xs overflow-x-auto ${theme === "dark" ? "bg-slate-900 border-slate-800 text-purple-200/90" : "bg-slate-900 text-purple-200 border-slate-700"}`}>
                  <pre>{generatedRobotsTxt}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
