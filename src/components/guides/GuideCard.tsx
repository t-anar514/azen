"use client"

import { Star, CheckCircle2, PlayCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookingModal } from "./BookingModal"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

interface GuideProps {
  guide: {
    id: string
    name: string
    location: string
    tags: string[]
    rating: number
    reviewCount: number
    price: number
    bio: string
    isVerified: boolean
    image: string
  }
}

export function GuideCard({ guide }: GuideProps) {
  return (
    <Card className="overflow-hidden flex flex-col md:flex-row p-4 gap-4">
      {/* Visuals */}
      <div className="relative w-full md:w-48 h-48 shrink-0">
         <Avatar className="w-full h-full rounded-md">
            <AvatarImage src={guide.image} className="object-cover" />
            <AvatarFallback>{guide.name[0]}</AvatarFallback>
         </Avatar>
         
         {/* Video Intro Overlay */}
         <Dialog>
            <DialogTrigger asChild>
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-md">
                    <PlayCircle className="w-12 h-12 text-white" />
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-black text-white">
                 <div className="aspect-video flex items-center justify-center">
                    <p>Playing intro video for {guide.name}...</p>
                 </div>
            </DialogContent>
         </Dialog>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
            <div className="flex justify-between items-start">
                <div>
                     <h3 className="text-xl font-bold flex items-center gap-2">
                        {guide.name}
                        {guide.isVerified && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    </h3>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-foreground">{guide.rating}</span>
                        <span>({guide.reviewCount})</span>
                        • {guide.location}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-lg font-bold">¥{guide.price}</div>
                    <div className="text-xs text-muted-foreground">/hour</div>
                </div>
            </div>

            <p className="mt-2 text-muted-foreground text-sm line-clamp-2 italic">&quot;{guide.bio}&quot;</p>
            
            <div className="flex flex-wrap gap-2 mt-3">
                {guide.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                    </Badge>
                ))}
            </div>
        </div>

        <div className="mt-4 flex gap-3">
             <BookingModal 
                guideName={guide.name} 
                trigger={<Button className="flex-1">Book Now</Button>}
             />
             <Button variant="outline" className="flex-1">Message</Button>
        </div>
      </div>
    </Card>
  )
}
