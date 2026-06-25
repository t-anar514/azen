import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CityDetailTabs } from "@/components/essentials/CityDetailTabs";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CityDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: city } = await supabase.from("cities").select("*").eq("id", id).single();

  if (!city) notFound();

  return <CityDetailTabs city={city} />;
}
