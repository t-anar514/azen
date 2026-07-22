"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CreateRecommendationForm, type RecommendationInitial } from "@/components/studio/CreateRecommendationForm"
import { CreatePostForm } from "@/components/studio/CreatePostForm"
import { cn } from "@/lib/utils"

type Tab = "place" | "post"

interface StudioNewScreenProps {
  cities: { id: string; name: string; slug: string }[]
  guideName: string
  guideImage: string | null
  initialTab: Tab
  initialRec: RecommendationInitial | null
}

const REC_FORM_ID = "studio-rec-form"
const POST_FORM_ID = "studio-post-form"

/**
 * `/studio/new` shell (design doc Screen 11 + mobile Screen 13): top bar with
 * the back link, the Зөвлөмж|Нийтлэл segmented toggle, the autosave hint and
 * the Ноорог/Нийтлэх header actions — which submit whichever form is active
 * via the HTML `form` attribute (buttons live here, the `<form>` element
 * lives one level down inside CreateRecommendationForm/CreatePostForm).
 */
export function StudioNewScreen({ cities, guideName, guideImage, initialTab, initialRec }: StudioNewScreenProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState<Tab>(initialTab)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [note, setNote] = React.useState<string | null>(null)

  const activeFormId = activeTab === "place" ? REC_FORM_ID : POST_FORM_ID
  const isEditingRec = !!initialRec

  function switchTab(tab: Tab) {
    setActiveTab(tab)
    setError(null)
    setNote(null)
    if (tab === "post") {
      router.replace("/studio/new?tab=post")
    } else {
      router.replace(initialRec ? `/studio/new?id=${initialRec.id}` : "/studio/new")
    }
  }

  function handleRecSaved(result: { id: string; published: boolean }) {
    setError(null)
    setNote(result.published ? "Нийтэлгдлээ." : "Ноорог хадгалагдлаа.")
    router.replace(`/studio/new?id=${result.id}`)
  }

  function handlePostSaved(result: { published: boolean }) {
    setError(null)
    setNote(result.published ? "Нийтэлгдлээ." : "Ноорог хадгалагдлаа.")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24 md:pb-0">
      {/* ============ desktop (md+) top bar — Screen 11 ============ */}
      <div className="hidden items-center gap-4 border-b border-border bg-card px-7 py-3.5 md:flex">
        <Link
          href="/studio"
          className="flex items-center gap-1.5 text-[13.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" strokeWidth={2.2} /> Студи
        </Link>
        <span className="h-6 w-px bg-border" />
        <TabToggle activeTab={activeTab} onChange={switchTab} />
        <div className="flex-1" />
        <span className="hidden items-center gap-1.5 text-xs text-muted-foreground lg:inline-flex">
          <span className="size-[7px] rounded-full bg-border" /> Ноорог автоматаар хадгалагдана
        </span>
        <Button
          type="submit"
          form={activeFormId}
          name="intent"
          value="draft"
          variant="outline"
          disabled={submitting}
          className="rounded-pill"
        >
          Ноорог хадгалах
        </Button>
        <Button
          type="submit"
          form={activeFormId}
          name="intent"
          value="publish"
          variant="reserve"
          disabled={submitting}
          className="rounded-pill"
        >
          Нийтлэх
        </Button>
      </div>

      {/* ============ mobile (<md) header — Screen 13 ============ */}
      <div className="border-b border-border bg-card px-5 py-3.5 md:hidden">
        <div className="flex items-center gap-3">
          <Link href="/studio" aria-label="Студи">
            <ArrowLeft className="size-5 text-muted-foreground" strokeWidth={2.2} />
          </Link>
          <h1 className="font-display text-[17px] font-extrabold">
            {activeTab === "place" ? (isEditingRec ? "Зөвлөмж засах" : "Шинэ зөвлөмж") : "Шинэ нийтлэл"}
          </h1>
        </div>
      </div>
      <div className="border-b border-border bg-card px-5 py-3.5 md:hidden">
        <TabToggle activeTab={activeTab} onChange={switchTab} fullWidth />
      </div>

      {(error || note) && (
        <div
          className={cn(
            "px-5 py-2.5 text-[13px] font-semibold md:px-7",
            error ? "bg-destructive/10 text-destructive" : "bg-secondary text-primary"
          )}
        >
          {error ?? note}
        </div>
      )}

      {/* ============ active form + preview ============ */}
      <div className="mx-auto w-full max-w-[1240px] flex-1 px-5 py-6 md:px-8 md:py-8">
        {activeTab === "place" ? (
          <CreateRecommendationForm
            formId={REC_FORM_ID}
            cities={cities}
            guideName={guideName}
            guideImage={guideImage}
            initial={initialRec}
            onSubmittingChange={setSubmitting}
            onSaved={handleRecSaved}
            onError={setError}
          />
        ) : (
          <CreatePostForm
            formId={POST_FORM_ID}
            guideName={guideName}
            guideImage={guideImage}
            onSubmittingChange={setSubmitting}
            onSaved={handlePostSaved}
            onError={setError}
          />
        )}
      </div>

      {/* ============ mobile sticky action bar — Screen 13 ============ */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2.5 border-t border-border bg-card/95 px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:hidden">
        <Button
          type="submit"
          form={activeFormId}
          name="intent"
          value="draft"
          variant="outline"
          disabled={submitting}
          className="flex-1 rounded-pill"
        >
          Ноорог
        </Button>
        <Button
          type="submit"
          form={activeFormId}
          name="intent"
          value="publish"
          variant="reserve"
          disabled={submitting}
          className="flex-[1.4] rounded-pill"
        >
          Нийтлэх
        </Button>
      </div>
    </div>
  )
}

function TabToggle({
  activeTab,
  onChange,
  fullWidth,
}: {
  activeTab: Tab
  onChange: (tab: Tab) => void
  fullWidth?: boolean
}) {
  return (
    <div className={cn("inline-flex rounded-pill bg-muted p-1", fullWidth && "flex w-full")}>
      {(
        [
          ["place", "Зөвлөмж"],
          ["post", "Нийтлэл"],
        ] as const
      ).map(([tab, label]) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            "rounded-pill px-5 py-2 text-[13.5px] font-semibold transition-colors",
            fullWidth && "flex-1 text-center",
            activeTab === tab ? "bg-card font-bold text-primary shadow-sm" : "text-muted-foreground"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
