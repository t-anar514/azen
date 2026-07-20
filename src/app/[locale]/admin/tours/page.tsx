import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { TourRequestActions } from "@/components/admin/TourRequestActions"
import type { TourRequestRow } from "@/lib/supabase/types"

export default async function AdminToursPage() {
  const supabase = await createClient()

  const [requestsRes, guidesRes] = await Promise.all([
    supabase.from("tour_requests").select("*").order("created_at", { ascending: false }),
    supabase.from("guides").select("id, name").eq("is_active", true).order("name"),
  ])

  const requests = (requestsRes.data ?? []) as TourRequestRow[]
  const guides = guidesRes.data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black uppercase italic tracking-tight">Tour requests</h1>
        <p className="text-muted-foreground">
          Custom tour wizard submissions — match a guide, then confirm.
        </p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-muted-foreground">No requests yet.</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id}>
              <CardContent className="space-y-3 pt-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {req.city_id}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        · {req.prefs?.pace} · {req.prefs?.group_size} pax · {req.prefs?.budget_band}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {req.contact_name ? `${req.contact_name} · ` : ""}
                      {req.contact_email} · {new Date(req.created_at).toLocaleDateString()}
                      {" · "}
                      <span className="font-medium text-foreground">{req.status}</span>
                    </p>
                    {req.prefs?.interests?.length ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Interests: {req.prefs.interests.join(", ")}
                      </p>
                    ) : null}
                  </div>
                  <TourRequestActions
                    id={req.id}
                    status={req.status}
                    matchedGuideId={req.matched_guide_id}
                    guides={guides}
                  />
                </div>

                {req.generated_itinerary?.length > 0 && (
                  <ol className="rounded-lg border border-border divide-y divide-border text-sm">
                    {req.generated_itinerary.map((stop) => (
                      <li key={stop.place_id} className="flex items-center gap-3 px-3 py-2">
                        <span className="w-5 text-center font-bold text-muted-foreground">
                          {stop.order}
                        </span>
                        <span className="font-medium">{stop.title}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {stop.duration_min}m
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
