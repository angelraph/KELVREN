import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }
  const { error, saved } = await searchParams;

  const [user, accounts] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.user.id } }),
    prisma.account.findMany({ where: { userId: session.user.id } }),
  ]);

  const googleConnected = accounts.some((a) => a.provider === "google");
  const initial = (user.name ?? user.email)[0]?.toUpperCase();

  async function updatePassword(formData: FormData) {
    "use server";
    const currentSession = await auth();
    if (!currentSession?.user?.id) redirect("/");

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!newPassword || newPassword.length < 8) {
      redirect("/profile?error=weak");
    }

    const dbUser = await prisma.user.findUniqueOrThrow({
      where: { id: currentSession.user.id },
    });

    if (dbUser.passwordHash) {
      const valid = currentPassword && (await verifyPassword(currentPassword, dbUser.passwordHash));
      if (!valid) {
        redirect("/profile?error=wrong_current");
      }
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { passwordHash },
    });

    redirect("/profile?saved=1");
  }

  return (
    <main className="min-h-screen">
      <header className="px-5 sm:px-8 py-6 border-b border-line flex items-center justify-between">
        <span className="text-sm tracking-[0.25em] uppercase text-ink-dim">
          Kelvren
        </span>
        <Link
          href="/dashboard"
          className="text-sm text-ink-dim hover:text-ink transition"
        >
          Back to dashboard
        </Link>
      </header>

      <div className="max-w-xl mx-auto px-5 sm:px-8 py-12 sm:py-16 space-y-12">
        <section className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-accent-soft text-accent text-xl font-medium shrink-0">
            {initial}
          </div>
          <div>
            <p className="text-lg text-ink">{user.name ?? "Unnamed"}</p>
            <p className="text-sm text-ink-dim">{user.email}</p>
          </div>
        </section>

        {saved === "1" && (
          <p className="text-sm text-accent bg-accent-soft px-4 py-3">
            Password updated.
          </p>
        )}
        {error && (
          <p className="text-sm text-warn bg-warn-soft px-4 py-3">
            {error === "weak"
              ? "New password must be at least 8 characters."
              : "Your current password was incorrect."}
          </p>
        )}

        <section>
          <h2 className="text-xs uppercase tracking-widest text-ink-dim">
            Account
          </h2>
          <div className="mt-4 border-t border-line">
            <div className="py-4 border-b border-line flex items-center justify-between">
              <span className="text-sm text-ink-dim">Member since</span>
              <span className="tabular text-sm text-ink">
                {formatDate(user.createdAt)}
              </span>
            </div>
            <div className="py-4 border-b border-line flex items-center justify-between">
              <span className="text-sm text-ink-dim">Google account</span>
              <span className="text-sm text-ink">
                {googleConnected ? "Connected" : "Not connected"}
              </span>
            </div>
            <div className="py-4 border-b border-line flex items-center justify-between">
              <span className="text-sm text-ink-dim">Email password</span>
              <span className="text-sm text-ink">
                {user.passwordHash ? "Set" : "Not set"}
              </span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-widest text-ink-dim">
            {user.passwordHash ? "Change password" : "Set a password"}
          </h2>
          <form action={updatePassword} className="mt-4 space-y-4 max-w-xs">
            {user.passwordHash && (
              <input
                type="password"
                name="currentPassword"
                required
                placeholder="Current password"
                className="w-full bg-transparent border border-line px-3 py-2 text-sm text-ink outline-none"
              />
            )}
            <input
              type="password"
              name="newPassword"
              required
              minLength={8}
              placeholder="New password (min 8 characters)"
              className="w-full bg-transparent border border-line px-3 py-2 text-sm text-ink outline-none"
            />
            <button
              type="submit"
              className="bg-accent text-paper px-5 py-2 text-sm font-medium tracking-wide hover:opacity-90 transition"
            >
              Save password
            </button>
          </form>
        </section>

        <section>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="text-sm text-warn hover:opacity-80 transition"
            >
              Sign out
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
