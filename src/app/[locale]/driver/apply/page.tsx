import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { DriverApplyForm } from "@/components/driver/DriverApplyForm"
import type { DriverVerificationStatus } from "@/lib/supabase/types"

export const metadata = {
  title: "Жолооч болох | Azen",
}

const STATUS_COPY: Record<DriverVerificationStatus, { title: string; body: string }> = {
  pending: {
    title: "Хүсэлт хүлээгдэж байна",
    body: "Таны мэдээллийг шалгаж байна. Баталгаажсаны дараа танд мэдэгдэх болно.",
  },
  approved: {
    title: "Баталгаажсан!",
    body: "Та одоо жолоочийн самбараас захиалгуудыг харах боломжтой.",
  },
  rejected: {
    title: "Хүсэлт татгалзагдсан",
    body: "Танай хүсэлтийг баталгаажуулж чадсангүй. Дэлгэрэнгүй мэдээлэл авахыг хүсвэл бидэнтэй холбогдоно уу.",
  },
}

export default async function DriverApplyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirectTo=/driver/apply")
  }

  const { data: existing } = await supabase
    .from("drivers")
    .select("verification_status")
    .eq("id", user.id)
    .maybeSingle()

  if (existing) {
    const copy = STATUS_COPY[existing.verification_status as DriverVerificationStatus]
    return (
      <div className="min-h-screen bg-[#e6e2c3] pt-16 pb-16">
        <div className="mx-auto max-w-lg px-4">
          <Card>
            <CardContent className="space-y-3 pt-6 text-center">
              <h1 className="text-xl font-black text-[#1c315e]">{copy.title}</h1>
              <p className="text-sm text-gray-600">{copy.body}</p>
              {existing.verification_status === "approved" && (
                <Link
                  href="/driver"
                  className="inline-block rounded-full bg-[#227c70] px-5 py-2 text-sm font-semibold text-white"
                >
                  Самбар руу очих
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#e6e2c3] pt-16 pb-16">
      <div className="mx-auto max-w-lg px-4 pb-6 text-center">
        <h1 className="text-2xl font-black text-[#1c315e]">Жолооч болох хүсэлт</h1>
        <p className="mt-2 text-sm text-gray-600">
          Мэдээллээ бөглөж, шаардлагатай бичиг баримтаа хуулж илгээнэ үү.
        </p>
      </div>
      <DriverApplyForm userId={user.id} />
    </div>
  )
}
