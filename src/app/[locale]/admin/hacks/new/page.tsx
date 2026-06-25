import { HackForm } from "@/components/admin/HackForm"

export default function NewHackPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black uppercase italic tracking-tight">New hack</h1>
      <HackForm />
    </div>
  )
}
