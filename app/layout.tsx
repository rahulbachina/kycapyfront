import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppProviders from "@/components/AppProviders";
import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KYC Automation Core API Test Harness",
  description: "KYC Automation Core API Test Harness",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans antialiased",
          inter.className
        )}
      >
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            {/* Top Header */}
            <header className="fixed top-0 z-50 w-full border-b bg-white shadow-sm">
              <div className="flex h-16 items-center px-6 justify-between">
                <a className="flex items-center space-x-3 group" href="/">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                      Vantage KYC Automation Test Harness
                    </span>
                  </div>
                </a>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-medium text-green-700">System Online</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area - with left margin for sidebar */}
            <main className="ml-64 mt-16 flex-1 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="max-w-7xl mx-auto px-6 py-8">
                {children}
              </div>
            </main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
