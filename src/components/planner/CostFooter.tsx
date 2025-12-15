export function CostFooter({ total }: { total: number }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-40 md:pl-0">
        <div className="container flex justify-between items-center">
            <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Estimated Trip Cost</p>
                <p className="text-2xl font-bold font-mono">¥{total.toLocaleString()}</p>
            </div>
            <div>
                 <button className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium hover:bg-primary/90 transition-colors">
                    Save Itinerary
                 </button>
            </div>
        </div>
    </div>
  )
}
