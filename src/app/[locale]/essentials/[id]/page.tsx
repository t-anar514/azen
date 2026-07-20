import { notFound, permanentRedirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ id: string }>;
}

// The city encyclopedia moved into the /city/[slug] hub (overview tab).
export default async function CityDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: city } = await supabase.from("cities").select("id, slug").eq("id", id).single();

  if (!city) notFound();

  permanentRedirect(`/city/${city.slug ?? city.id}`);
}
