import { AlertTriangle, CheckCircle } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface HackProps {
    id: string
    title: string
    category: string
    description: string
    trapAlternative: string | null
}

export function TrapAlert({ hack }: { hack: HackProps }) {
  const isTrap = hack.category === "Tourist Trap"

  return (
    <Card className={`border-l-4 ${isTrap ? "border-l-destructive" : "border-l-emerald-500"}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
            {isTrap ? <AlertTriangle className="text-destructive h-5 w-5" /> : <CheckCircle className="text-emerald-500 h-5 w-5" />}
            <CardTitle>{hack.title}</CardTitle>
        </div>
        <CardDescription className="font-mono text-xs uppercase tracking-wider">{hack.category}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{hack.description}</p>
        
        {isTrap && hack.trapAlternative && (
            <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                <span className="font-bold text-primary">Azen Alternative: </span>
                {hack.trapAlternative}
            </div>
        )}
      </CardContent>
      <CardFooter>
          <Button variant="ghost" size="sm" className="w-full">Read Full Analysis</Button>
      </CardFooter>
    </Card>
  )
}
