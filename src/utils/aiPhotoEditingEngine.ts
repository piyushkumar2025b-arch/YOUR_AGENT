export interface PhotoAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: number;
  sepia: number;
  blur: number;
  invert: number;
  hueRotate: number;
  vignette: number;
  exposure: number;
  sharpness: number;
  temperature: number;
}

export interface AiStylePreset {
  id: string;
  name: string;
  category: "artistic" | "lighting" | "futuristic" | "vintage";
  description: string;
  iconName: string;
  adjustments: Partial<PhotoAdjustments>;
  canvasBlendMode?: GlobalCompositeOperation;
  overlayColor?: string;
}

export const AI_STYLE_PRESETS: AiStylePreset[] = [
  {
    id: "oil_painting",
    name: "Van Gogh Oil Painting",
    category: "artistic",
    description: "Rich impasto textures, vivid swirling strokes, and post-impressionist color warmth.",
    iconName: "Palette",
    adjustments: { brightness: 110, contrast: 135, saturation: 165, sepia: 25, hueRotate: 10, vignette: 20 },
    overlayColor: "rgba(245, 158, 11, 0.08)"
  },
  {
    id: "cyberpunk_neon",
    name: "Cyberpunk Neon Glow",
    category: "futuristic",
    description: "High-contrast electric magenta, cyan reflections, and dark night atmosphere.",
    iconName: "Zap",
    adjustments: { brightness: 115, contrast: 145, saturation: 180, hueRotate: 280, vignette: 35 },
    overlayColor: "rgba(217, 70, 239, 0.12)"
  },
  {
    id: "watercolor_dream",
    name: "Soft Japanese Watercolor",
    category: "artistic",
    description: "Delicate pastel gradient washes, soft edges, and airy aesthetic light.",
    iconName: "Feather",
    adjustments: { brightness: 118, contrast: 90, saturation: 120, sepia: 15, blur: 1, vignette: 5 },
    overlayColor: "rgba(56, 189, 248, 0.08)"
  },
  {
    id: "golden_hour",
    name: "Golden Hour Sunlight",
    category: "lighting",
    description: "Warm amber sun rays, soft shadows, and radiant natural skin tone glow.",
    iconName: "Sun",
    adjustments: { brightness: 112, contrast: 115, saturation: 140, sepia: 30, hueRotate: 15, vignette: 15 },
    overlayColor: "rgba(251, 146, 60, 0.12)"
  },
  {
    id: "pencil_sketch",
    name: "Fine Pencil Sketch",
    category: "artistic",
    description: "Monochrome graphite pencil hatching, high structural contrast, and paper texture.",
    iconName: "Pencil",
    adjustments: { brightness: 120, contrast: 180, grayscale: 100, saturation: 0, vignette: 10 }
  },
  {
    id: "pop_art",
    name: "Andy Warhol Pop Art",
    category: "artistic",
    description: "Ultra-vivid primary colors, posterized shadows, and bold comic book vibes.",
    iconName: "Smile",
    adjustments: { brightness: 125, contrast: 160, saturation: 200, hueRotate: 60, vignette: 0 }
  },
  {
    id: "vhs_retro",
    name: "80s Retro Synthwave",
    category: "vintage",
    description: "Analog tape artifact noise, magenta/purple split toning, and scanline feel.",
    iconName: "Aperture",
    adjustments: { brightness: 105, contrast: 130, saturation: 150, hueRotate: 320, vignette: 30 },
    overlayColor: "rgba(168, 85, 247, 0.15)"
  },
  {
    id: "matrix_code",
    name: "Emerald Cyber Matrix",
    category: "futuristic",
    description: "Deep green phosphor luminescence, terminal contrast, and hacker aesthetic.",
    iconName: "Terminal",
    adjustments: { brightness: 108, contrast: 150, saturation: 170, hueRotate: 115, vignette: 25 },
    overlayColor: "rgba(34, 197, 94, 0.15)"
  },
  {
    id: "dramatic_noir",
    name: "Cinematic Noir",
    category: "lighting",
    description: "Deep shadow blacks, crisp high-key highlights, and moody silver screen atmosphere.",
    iconName: "Eye",
    adjustments: { brightness: 100, contrast: 175, grayscale: 100, saturation: 0, vignette: 40 }
  }
];

// Helper to execute AI Generative Photo Edits via LLM/Vision prompt API
export async function requestAiPhotoTransformation(
  prompt: string,
  imageDescription: string,
  apiKey?: string,
  selectedModel: string = "google/gemini-2.5-flash"
): Promise<{
  suggestedAdjustments: Partial<PhotoAdjustments>;
  aiCritique: string;
  recommendedOverlayColor?: string;
  suggestedCaption: string;
}> {
  try {
    const res = await fetch("/api/openrouter/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: "system",
            content: `You are an AI Photo Editor & Colorist. The user wants to transform an image according to a prompt.
Respond ONLY with a valid JSON object matching this schema:
{
  "brightness": number (80 to 150),
  "contrast": number (80 to 180),
  "saturation": number (0 to 200),
  "sepia": number (0 to 100),
  "hueRotate": number (0 to 360),
  "vignette": number (0 to 50),
  "recommendedOverlayColor": string (e.g. "rgba(244, 63, 94, 0.1)" or "none"),
  "aiCritique": string (2 sentences describing the creative transform applied),
  "suggestedCaption": string (engaging caption with hashtags)
}`
          },
          {
            role: "user",
            content: `User Prompt: "${prompt}". Image context: "${imageDescription}". Suggest the exact numeric color parameters and artistic review.`
          }
        ]
      })
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          suggestedAdjustments: {
            brightness: parsed.brightness ?? 110,
            contrast: parsed.contrast ?? 120,
            saturation: parsed.saturation ?? 130,
            sepia: parsed.sepia ?? 0,
            hueRotate: parsed.hueRotate ?? 0,
            vignette: parsed.vignette ?? 15
          },
          aiCritique: parsed.aiCritique || `Applied custom AI edit: "${prompt}".`,
          recommendedOverlayColor: parsed.recommendedOverlayColor !== "none" ? parsed.recommendedOverlayColor : undefined,
          suggestedCaption: parsed.suggestedCaption || `#AIStudio #PhotoArt #${prompt.replace(/\s+/g, "")}`
        };
      }
    }
  } catch (e) {
    console.warn("AI Photo transformation fallback used:", e);
  }

  // Smart fallback based on key terms in prompt
  const lower = prompt.toLowerCase();
  if (lower.includes("cyber") || lower.includes("neon") || lower.includes("night")) {
    return {
      suggestedAdjustments: { brightness: 115, contrast: 140, saturation: 170, hueRotate: 280, vignette: 30 },
      aiCritique: "Transformed into a high-contrast Cyberpunk aesthetic with electric violet reflections.",
      recommendedOverlayColor: "rgba(168, 85, 247, 0.12)",
      suggestedCaption: "Futuristic visions rendered in cyber neon light. 🌌✨ #Cyberpunk #AIPhotoEditor"
    };
  } else if (lower.includes("warm") || lower.includes("sun") || lower.includes("gold") || lower.includes("vintage")) {
    return {
      suggestedAdjustments: { brightness: 112, contrast: 115, saturation: 140, sepia: 35, hueRotate: 15, vignette: 15 },
      aiCritique: "Infused with golden hour sunlight, soft warm glow, and nostalgic analog tones.",
      recommendedOverlayColor: "rgba(251, 146, 60, 0.12)",
      suggestedCaption: "Bathed in golden hour light. ☀️🍂 #GoldenHour #VibeCoder"
    };
  } else if (lower.includes("black") || lower.includes("noir") || lower.includes("monochrome") || lower.includes("sketch")) {
    return {
      suggestedAdjustments: { brightness: 105, contrast: 170, saturation: 0, grayscale: 100, vignette: 25 },
      aiCritique: "Converted to dramatic high-contrast monochrome with fine shadow graduation.",
      suggestedCaption: "Shadows and light in pure monochrome elegance. 🖤 #BlackAndWhite #FilmNoir"
    };
  }

  return {
    suggestedAdjustments: { brightness: 112, contrast: 125, saturation: 135, vignette: 10 },
    aiCritique: `Enhanced photo parameters dynamically for prompt: "${prompt}".`,
    suggestedCaption: `Crafted with AI Studio PRO. ✨ #${prompt.replace(/\s+/g, "")}`
  };
}
