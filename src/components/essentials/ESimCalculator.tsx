"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function ESimCalculator() {
  const [dataUsage, setDataUsage] = useState([2]) // Slider value (GB/day)

  const getRecommendation = (gb: number) => {
    if (gb < 1) return { plan: "Lite", size: "3GB Total", price: "¥1,500" }
    if (gb < 3) return { plan: "Standard", size: "1GB/Day", price: "¥3,000" }
    return { plan: "Pro", size: "Unlimited", price: "¥5,500" }
  }

  const recommendation = getRecommendation(dataUsage[0])

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>Data Usage Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Daily Social Media Use</span>
              <span className="text-muted-foreground">{dataUsage[0]} hrs/day</span>
            </div>
            <Slider
              defaultValue={[2]}
              max={10}
              step={1}
              onValueChange={setDataUsage}
            />
             <p className="text-xs text-muted-foreground mt-2">
                Based on average Instagram/Maps usage.
             </p>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card className="bg-muted/30 border-primary/20">
         <CardHeader>
            <CardTitle className="flex justify-between items-center">
                <span>Recommended Plan</span>
                <span className="text-primary font-mono text-2xl">{recommendation.price}</span>
            </CardTitle>
         </CardHeader>
         <CardContent>
             <div className="space-y-4">
                 <div className="flex justify-between items-center pb-2 border-b">
                     <span className="font-medium">Plan Name</span>
                     <span>Azen {recommendation.plan}</span>
                 </div>
                 <div className="flex justify-between items-center pb-2 border-b">
                     <span className="font-medium">Data Allowance</span>
                     <span>{recommendation.size}</span>
                 </div>
                 <div className="flex justify-between items-center pb-2 border-b">
                     <span className="font-medium">Network</span>
                     <span>Docomo 5G</span>
                 </div>
                 <Button className="w-full mt-4">Get This eSIM</Button>
             </div>
         </CardContent>
      </Card>
    </div>
  )
}
