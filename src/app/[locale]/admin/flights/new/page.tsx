import { FlightDealForm } from "@/components/admin/FlightDealForm"

export default function NewFlightDealPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black uppercase italic tracking-tight">New flight deal</h1>
      <FlightDealForm />
    </div>
  )
}
