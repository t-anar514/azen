import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserRoleSelect } from "@/components/admin/UserRoleSelect"

interface AdminUserRow {
  id: string
  full_name: string | null
  role: string
  email: string | null
  joined_at: string | null
  last_sign_in_at: string | null
  email_confirmed: boolean
}

function formatDate(value: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

async function getUsers(): Promise<AdminUserRow[]> {
  const supabase = await createClient()
  const [{ data: profiles }, authUsers] = await Promise.all([
    supabase.from("profiles").select("id, full_name, role, created_at"),
    createAdminClient().auth.admin.listUsers(),
  ])

  const authById = new Map(authUsers.data?.users?.map((u) => [u.id, u]) ?? [])

  return (profiles ?? []).map((p) => {
    const authUser = authById.get(p.id)
    return {
      id: p.id,
      full_name: p.full_name,
      role: p.role,
      email: authUser?.email ?? null,
      joined_at: authUser?.created_at ?? p.created_at,
      last_sign_in_at: authUser?.last_sign_in_at ?? null,
      email_confirmed: !!authUser?.email_confirmed_at,
    }
  })
}

export default async function AdminUsersPage() {
  const users = await getUsers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black uppercase italic tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Everyone with an Azen account. Change a role here, or link an account to a guide
          listing from the Guides tab to promote them automatically.
        </p>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-muted-foreground">
            No registered users yet (or Supabase keys aren&apos;t configured).
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 font-semibold">Last sign-in</th>
                  <th className="px-4 py-3 font-semibold">Verified</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{u.full_name || "Unnamed user"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email ?? u.id}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(u.joined_at)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(u.last_sign_in_at)}
                    </td>
                    <td className="px-4 py-3">
                      {u.email_confirmed ? (
                        <Badge variant="secondary">Yes</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <UserRoleSelect userId={u.id} role={u.role} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
