import { Inter } from "next/font/google"
import { ToastProvider } from "@/components/providers/toast-providers"
import { ThemeProvider } from "@/components/theme-provider"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Counsel of Elders - Mentorship Platform",
  description: "Connect with experienced mentors who can guide you through life, faith, business, and relationships.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ToastProvider />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

