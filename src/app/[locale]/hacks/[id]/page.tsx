import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HackHero } from "@/components/hacks/HackHero";
import { QuickFix } from "@/components/hacks/QuickFix";
import { StepGuide } from "@/components/hacks/StepGuide";
import { ProTip } from "@/components/hacks/ProTip";
import { RelatedHacks } from "@/components/hacks/RelatedHacks";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function HackDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: hack } = await supabase.from("hacks").select("*").eq("id", id).single();

  if (!hack) {
    notFound();
  }

  const relatedIds = hack.related_ids ?? [];
  const { data: relatedHacks } = relatedIds.length
    ? await supabase.from("hacks").select("*").in("id", relatedIds)
    : { data: [] };

  return (
    <div className="min-h-screen bg-background">
      <HackHero
        title={hack.title}
        category={hack.category}
        coverImage={hack.cover_image ?? ""}
      />

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 space-y-20">
        <section>
          <QuickFix summary={hack.summary ?? ""} />
        </section>

        <section>
          <StepGuide steps={hack.steps} />
        </section>

        <section>
          <ProTip text={hack.pro_tip ?? ""} />
        </section>

        <section className="pt-10 border-t border-secondary/10">
          <RelatedHacks hacks={relatedHacks ?? []} />
        </section>
      </div>

      <footer className="bg-surface py-12 px-4 border-t border-secondary/10">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h4 className="text-primary font-bold uppercase tracking-widest text-sm">
            Azen Travel Hacks
          </h4>
          <p className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} Azen Travel Guide. Master Japan like a local.
          </p>
        </div>
      </footer>
    </div>
  );
}
