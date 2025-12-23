"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

export function GuideFilter() {
  const t = useTranslations("Guides.filter")
  const tCities = useTranslations("Data.Cities")
  const tLanguages = useTranslations("Data.Languages")
  const tSpecialties = useTranslations("Data.Specialties")
  
  const [priceRange, setPriceRange] = useState([3000])

  const locations = ["tokyo", "kyoto", "osaka", "hokkaido"]
  const languages = ["english", "chinese", "spanish", "french"]
  const specialties = ["history-buff", "foodie", "anime-manga", "photographer", "nightlife"]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">{t("location")}</h3>
        <div className="space-y-2">
          {locations.map((cityId) => (
            <div key={cityId} className="flex items-center space-x-2">
              <Checkbox id={cityId} />
              <Label htmlFor={cityId}>{tCities(`${cityId}.name`)}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">{t("language")}</h3>
        <div className="space-y-2">
           {languages.map((langId) => (
            <div key={langId} className="flex items-center space-x-2">
              <Checkbox id={langId} />
              <Label htmlFor={langId}>{tLanguages(langId)}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">{t("specialty")}</h3>
         <div className="space-y-2">
           {specialties.map((specId) => (
            <div key={specId} className="flex items-center space-x-2">
              <Checkbox id={specId} />
              <Label htmlFor={specId}>{tSpecialties(specId)}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">{t("rate")}</h3>
        <Slider
          defaultValue={[3000]}
          max={10000}
          step={500}
          onValueChange={setPriceRange}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
            <span>¥0</span>
            <span>{t("upTo", { price: priceRange[0] })}</span>
        </div>
      </div>
      
      <Button className="w-full">{t("apply")}</Button>
    </div>
  )
}
