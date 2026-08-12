"use client"

import { useEffect } from "react"

/**
 * Last-resort boundary. Catches errors thrown by the root layout itself, which
 * `[locale]/error.tsx` cannot — at that point no layout has rendered, so this
 * file must supply its own <html> and <body>.
 *
 * Everything here is deliberately self-contained: inline styles rather than
 * Tailwind classes, a plain <a> rather than a router Link, and no translation
 * lookups. If the layout failed, the stylesheet and providers it pulls in
 * cannot be assumed to have loaded.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[global error]", error.digest ?? "(no digest)", error)
  }, [error])

  return (
    <html lang="mn">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "#F6F8FB",
          color: "#16202B",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <main style={{ maxWidth: "34rem", textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#64748B",
            }}
          >
            Azen
          </p>
          <h1
            style={{
              margin: "0.5rem 0 0",
              fontSize: "1.875rem",
              lineHeight: 1.2,
              fontWeight: 800,
              letterSpacing: "-0.015em",
            }}
          >
            Сайт түр ажиллахгүй байна
          </h1>
          <p style={{ margin: "1rem 0 0", fontSize: "1.0625rem", color: "#475569" }}>
            Гэнэтийн алдаа гарлаа. Хуудсыг дахин ачаалаад үзээрэй.
          </p>

          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                border: 0,
                cursor: "pointer",
                borderRadius: "9999px",
                padding: "0.8125rem 1.625rem",
                fontSize: "0.9375rem",
                fontWeight: 700,
                color: "#FFFFFF",
                background: "#DE8C2E",
              }}
            >
              Дахин ачаалах
            </button>
            {/*
              A plain anchor, not next/link, is intentional here: this boundary
              only renders when the root layout itself failed, and a client-side
              navigation would re-render that same broken tree. A full document
              load is the actual recovery.
            */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                borderRadius: "9999px",
                padding: "0.8125rem 1.625rem",
                fontSize: "0.9375rem",
                fontWeight: 600,
                textDecoration: "none",
                color: "#16202B",
                background: "#FFFFFF",
                border: "1px solid #DCE3EC",
              }}
            >
              Нүүр хуудас руу
            </a>
          </div>

          {error.digest && (
            <p style={{ marginTop: "2.5rem", fontSize: "0.875rem", color: "#64748B" }}>
              Алдааны код:{" "}
              <code style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.75rem" }}>
                {error.digest}
              </code>
            </p>
          )}
        </main>
      </body>
    </html>
  )
}
