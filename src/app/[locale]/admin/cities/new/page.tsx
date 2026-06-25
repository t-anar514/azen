import { CityForm } from "@/components/admin/CityForm"

export default function NewCityPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black uppercase italic tracking-tight">New city</h1>
      <CityForm />
    </div>
  )
}
