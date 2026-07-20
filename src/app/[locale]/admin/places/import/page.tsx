import { PlaceCsvImporter } from "@/components/admin/PlaceCsvImporter"

export default function ImportPlacesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black uppercase italic tracking-tight">Import places</h1>
        <p className="text-muted-foreground">
          Bulk-load POIs from a spreadsheet export. Dry-run first, then import.
        </p>
      </div>
      <PlaceCsvImporter />
    </div>
  )
}
