import Link from "next/link"
import { Monitor, Instagram, Twitter, Facebook } from "lucide-react"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="w-full border-t border-secondary/20 bg-muted py-12">
      <div className="px-4 md:px-6 grid grid-cols-1 gap-8 md:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2">
           <div className="relative h-48 w-48 overflow-hidden">
                       <Image src="/logobg.png" alt="Azen Logo" fill className="object-cover" />
                    </div>
          </Link>
          <p className="text-sm text-foreground/80 leading-relaxed font-sans max-w-xs">
            From Chaos to Clarity. <br />
            Your Zen Japan Travel Platform.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Platform</h3>
          <Link href="/guides" className="text-sm text-muted-foreground hover:underline">Find a Guide</Link>
          <Link href="/planner" className="text-sm text-muted-foreground hover:underline">Plan My Trip</Link>
          <Link href="/hacks" className="text-sm text-muted-foreground hover:underline">Japan Hacks</Link>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Company</h3>
          <Link href="/about" className="text-sm text-muted-foreground hover:underline">About Us</Link>
          <Link href="/contact" className="text-sm text-muted-foreground hover:underline">Contact</Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">Privacy Policy</Link>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Follow Us</h3>
          <div className="flex gap-4">
            <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
          </div>
        </div>
      </div>
      <div className=" mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Azen. All rights reserved.
      </div>
    </footer>
  )
}
