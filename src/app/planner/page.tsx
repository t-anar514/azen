"use client"

import { useState } from "react"
import { Timeline } from "@/components/planner/Timeline"
import { MapPlaceholder } from "@/components/planner/MapPlaceholder"
import { CostFooter } from "@/components/planner/CostFooter"

export default function PlannerPage() {
  const [totalCost, setTotalCost] = useState(28000) // Initial mock total

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
            {/* Left: Timeline (Scrollable) */}
            <div className="w-full md:w-1/2 lg:w-5/12 overflow-y-auto bg-muted/10 h-full scrollbar-hide">
                <Timeline onCostChange={setTotalCost} />
            </div>

            {/* Right: Map (Sticky/Fixed on Desktop, Hidden on Mobile) */}
            <div className="hidden md:block md:w-1/2 lg:w-7/12 h-full bg-muted border-l">
                <MapPlaceholder />
            </div>
        </div>
        
        <CostFooter total={totalCost} />
    </div>
  )
}
