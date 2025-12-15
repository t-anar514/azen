import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function TransportGuide() {
  return (
     <Card className="overflow-hidden">
        <CardHeader>
            <CardTitle>Metro vs. JR: Simplified</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-100 dark:border-green-900">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 rounded-full bg-green-600" />
                    <h3 className="font-bold text-green-700 dark:text-green-400">JR Lines (Yamanote)</h3>
                </div>
                <p className="text-sm mb-3">Best for major hubs (Shinjuku, Shibuya, Tokyo Station).</p>
                <div className="flex gap-2">
                    <Badge variant="outline" className="border-green-600 text-green-700">Covered by JR Pass</Badge>
                </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 rounded-full bg-blue-600" />
                    <h3 className="font-bold text-blue-700 dark:text-blue-400">Tokyo Metro (Subway)</h3>
                </div>
                <p className="text-sm mb-3">Best for specific spots (Asakusa, Roppongi, Ginza).</p>
                <div className="flex gap-2">
                     <Badge variant="outline" className="border-blue-600 text-blue-700">Cheaper Single Fares</Badge>
                </div>
            </div>
            
            <div className="col-span-2">
                 {/* Mock Map Image */}
                 <div className="w-full h-64 bg-muted rounded-md flex items-center justify-center relative overflow-hidden">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Tokyo_Metro_Line_Symbol.svg/1024px-Tokyo_Metro_Line_Symbol.svg.png"  
                        alt="Tokyo Metro Map" 
                        className="opacity-10 w-full h-full object-cover"
                     />
                     <p className="absolute text-muted-foreground font-medium">Interactive Route Map (Coming Soon)</p>
                 </div>
            </div>
        </CardContent>
     </Card>
  )
}
