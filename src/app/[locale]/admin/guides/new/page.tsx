import { GuideForm } from "@/components/admin/GuideForm"

export default function NewGuidePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black uppercase italic tracking-tight">New guide</h1>
      <GuideForm />
    </div>
  )
}
