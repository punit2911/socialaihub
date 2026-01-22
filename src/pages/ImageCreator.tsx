import { useState } from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, Download, RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { GlassCard } from "@/components/common/GlassCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingState } from "@/components/common/LoadingSpinner";
import { useAI } from "@/hooks/useAI";

const styles = [
  { id: "modern", label: "Modern & Clean", emoji: "✨" },
  { id: "bold", label: "Bold & Vibrant", emoji: "🎨" },
  { id: "minimal", label: "Minimalist", emoji: "⚪" },
  { id: "retro", label: "Retro/Vintage", emoji: "📻" },
  { id: "professional", label: "Corporate", emoji: "💼" },
];

const formats = [
  { id: "post", label: "Square Post (1:1)" },
  { id: "story", label: "Story (9:16)" },
  { id: "banner", label: "Banner (16:9)" },
];

export default function ImageCreator() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("modern");
  const [format, setFormat] = useState("post");
  const { generate, isLoading, imageResult, reset } = useAI();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    const selectedStyle = styles.find(s => s.id === style)?.label || style;
    await generate(
      `${prompt}. Style: ${selectedStyle}. Format: ${format}`,
      { feature: "image", platform: format }
    );
  };

  const handleDownload = () => {
    if (!imageResult?.image) return;
    const link = document.createElement("a");
    link.href = imageResult.image;
    link.download = `social-image-${Date.now()}.png`;
    link.click();
  };

  return (
    <DashboardLayout>
      <PageHeader
        icon={ImageIcon}
        title="Image Creator"
        description="Generate stunning visuals for your social media posts"
        badge="AI Powered"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="font-display font-semibold mb-4">Describe Your Image</h3>
            <Textarea
              placeholder="e.g., A professional announcement graphic for our new product launch with modern tech elements..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] bg-muted/50 border-border focus:border-primary resize-none"
            />
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-display font-semibold mb-4">Visual Style</h3>
            <div className="flex flex-wrap gap-2">
              {styles.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    style === s.id
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-display font-semibold mb-4">Format</h3>
            <div className="grid grid-cols-3 gap-2">
              {formats.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    format === f.id
                      ? "bg-accent text-accent-foreground shadow-glow-accent"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </GlassCard>

          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4" />
                Generate Image
              </>
            )}
          </Button>
        </div>

        <div>
          <GlassCard className="p-6 min-h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">Generated Image</h3>
              {imageResult?.image && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="ghost" size="sm" onClick={reset}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {isLoading ? (
              <LoadingState message="Creating your image..." />
            ) : imageResult?.image ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="rounded-lg overflow-hidden border border-border">
                  <img
                    src={imageResult.image}
                    alt="Generated social media graphic"
                    className="w-full h-auto"
                  />
                </div>
                {imageResult.description && (
                  <p className="text-sm text-muted-foreground">{imageResult.description}</p>
                )}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                <p>Your generated image will appear here</p>
                <p className="text-xs mt-2">Describe what you want to see</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
