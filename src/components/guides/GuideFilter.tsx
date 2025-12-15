"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

export function GuideFilter() {
  const [priceRange, setPriceRange] = useState([3000])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Location</h3>
        <div className="space-y-2">
          {["Tokyo", "Kyoto", "Osaka", "Hokkaido"].map((city) => (
            <div key={city} className="flex items-center space-x-2">
              <Checkbox id={city} />
              <Label htmlFor={city}>{city}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Language</h3>
        <div className="space-y-2">
           {["English", "Chinese", "Spanish", "French"].map((lang) => (
            <div key={lang} className="flex items-center space-x-2">
              <Checkbox id={lang} />
              <Label htmlFor={lang}>{lang}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Specialty</h3>
         <div className="space-y-2">
           {["History Buff", "Foodie", "Anime/Manga", "Photographer", "Nightlife"].map((tag) => (
            <div key={tag} className="flex items-center space-x-2">
              <Checkbox id={tag} />
              <Label htmlFor={tag}>{tag}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Hourly Rate (¥)</h3>
        <Slider
          defaultValue={[3000]}
          max={10000}
          step={500}
          onValueChange={setPriceRange}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
            <span>¥0</span>
            <span>Up to ¥{priceRange[0]}</span>
        </div>
      </div>
      
      <Button className="w-full">Apply Filters</Button>
    </div>
  )
}
