import type { Metadata } from "next"
import { Fraunces, JetBrains_Mono, Manrope, Source_Serif_4 } from "next/font/google"

import "./globals.css"
import { SiteShell } from "@/components/shared/site-shell"
import { ThemeProvider } from "@/components/theme-provider"
import { buildRootMetadata } from "@/lib/seo"
import { cn } from "@/lib/utils"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-ui",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
})

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-reading",
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = buildRootMetadata()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "scroll-smooth antialiased",
        manrope.variable,
        fraunces.variable,
        sourceSerif.variable,
        jetBrainsMono.variable,
        "font-sans"
      )}
    >
      <body className="min-h-dvh bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteShell>{children}</SiteShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
