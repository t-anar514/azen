"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"

interface BookingModalProps {
  guideName: string
  trigger: React.ReactNode
}

export function BookingModal({ guideName, trigger }: BookingModalProps) {
    const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book {guideName}</DialogTitle>
          <DialogDescription>
            Send a booking request. You won&apos;t be charged yet.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Select Date</Label>
            <div className="border rounded-md p-2 flex justify-center">
                 <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="interest">Main Interest</Label>
            <Input id="interest" placeholder="e.g. Hidden temples, Food tour..." />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Message to Guide</Label>
            <Textarea id="message" placeholder="Hi, I'm looking for..." />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" className="w-full">Send Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
