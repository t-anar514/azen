"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plane, MapPin, Coffee, Utensils, MoveVertical } from "lucide-react"

interface TimelineItemProps {
  id: string
  title: string
  time: string
  type: "flight" | "spot" | "food" | "hotel"
  location: string
  cost: number
}

export function TimelineItem({ id, title, time, type, location, cost }: TimelineItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getIcon = () => {
    switch (type) {
      case "flight": return <Plane className="h-5 w-5 text-blue-500" />
      case "food": return <Utensils className="h-5 w-5 text-orange-500" />
      case "hotel": return <Coffee className="h-5 w-5 text-purple-500" /> // Using coffee as generic rest icon for now
      default: return <MapPin className="h-5 w-5 text-red-500" />
    }
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-4 group cursor-grab active:cursor-grabbing">
      <Card className="p-4 flex gap-4 items-center bg-card hover:shadow-md transition-shadow border-l-4 border-l-primary/20 hover:border-l-primary">
        <div className="text-muted-foreground">
            <MoveVertical className="h-4 w-4 opacity-0 group-hover:opacity-50" />
        </div>
        <div className="flex flex-col items-center justify-center h-10 w-10 rounded-full bg-muted shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
             <h4 className="font-semibold truncate">{title}</h4>
             <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{time}</span>
          </div>
          <p className="text-sm text-muted-foreground truncate">{location}</p>
        </div>
        <div className="text-right">
             <Badge variant="outline">¥{cost.toLocaleString()}</Badge>
        </div>
      </Card>
      
      {/* Visual connector line for future buffer implementation */}
      <div className="h-4 w-0.5 bg-border mx-auto my-1 group-last:hidden ml-[3.25rem]" /> 
    </div>
  )
}
