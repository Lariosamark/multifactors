"use client";

import "./globals.css";
import { ReactNode, useState } from "react";
import { AuthProvider } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";

export default function RootLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="en">
      <body className="flex min-h-screen bg-gray-50">
        <AuthProvider>
      

          {/* Sidebar */}
          <div
            className={`fixed z-40 h-full bg-white transition-transform transform ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0 lg:flex-shrink-0`}
          >
            <Sidebar />
          </div>

          {/* Main Content */}
          <main className="flex-1 p-0 lg:ml-0">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
