"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ReactNode, useState } from "react";

function NavItem({
  href,
  children,
  icon,
}: {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <>
    <Link
      href={href}
      className={`group flex items-center space-x-3 rounded-xl px-4 py-3 transition-all duration-300 ${
        active
          ? "bg-gradient-to-r from-green-400/20 to-emerald-400/20 border border-green-400/30 text-green-200 shadow-lg backdrop-blur-sm"
          : "text-white/70 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm hover:scale-105"
      }`}
    >
      {icon && (
        <div
          className={`transition-colors duration-300 ${
            active
              ? "text-green-300"
              : "text-white/50 group-hover:text-white/80"
          }`}
        >
          {icon}
        </div>
      )}
      <span className="font-medium">{children}</span>
    </Link>
    </>
  );
}

export default function Sidebar() {
  const { profile, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Logout handler with redirect
  const handleLogout = async () => {
    await logout();
    router.push("/"); // Redirect to landing page
  };

  // Hide sidebar completely on landing & login pages
  if (pathname === "/" || pathname.startsWith("/login")) return null;

  const isAdmin = profile?.role === "admin";
  const isEmployee = profile?.role === "employee";

  return (
    <>

      {/* Sidebar */}
      
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-[#2D5128] via-[#1a3015] to-[#2D5128] border-r border-white/10 backdrop-blur-xl overflow-y-auto transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="relative p-6 flex flex-col h-full">
          {/* Header */}
          <div className="mb-8">
            <div className="flex space-x-3 mb-4">
            <div className="relative backdrop-blur-sm bg-white/10 border border-white/20 rounded-md p-3">

          <img src="/logo.png" alt="logo" />

            </div>
            </div>

         
            
          </div>

          {/* Navigation */}
          <nav className=" space-y-6 flex-1">
            {isAdmin && (
              <div>
                <div className=" mb-4 px-4">
                  <h3 className="text-xs uppercase text-green-300/60 font-bold tracking-wider">
                    Admin Panel
                  </h3>
                  <div className="mt-2 h-px bg-gradient-to-r from-green-400/30 to-transparent"></div>
                </div>
                <div className="space-y-2">
                  <NavItem href="/admin/dashboard">Dashboard</NavItem>
                  <NavItem href="/admin/approvals">Approvals</NavItem>
                  <NavItem href="/component/manageProjects">Project</NavItem>
                  <NavItem href="/component/save-projects">Save Project</NavItem>
                  <NavItem href="/component/quotation-list">Quotation List Page</NavItem>
                  <NavItem href="/component/SupplierCustomer">Supplier And Customer List</NavItem>
                </div>
              </div>
            )}

            {isEmployee && (
              <div>
                <div className="mb-4 px-4">
                  <h3 className="text-xs uppercase text-green-300/60 font-bold tracking-wider">
                    Employee Panel
                  </h3>
                  <div className="mt-2 h-px bg-gradient-to-r from-green-400/30 to-transparent"></div>
                </div>
                <div className="space-y-2">
                  <NavItem href="/employee/dashboard">Dashboard</NavItem>
                  <NavItem href="/component/manageProjects">Project</NavItem>
                  <NavItem href="/component/save-projects">Save Project</NavItem>
                  <NavItem href="/component/quotation-list">Quotation List Page</NavItem>
                  <NavItem href="/employee/profile">Profile</NavItem>
                </div>
              </div>
            )}
          </nav>
          {profile && (
              <div className="">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {profile.displayName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">
                      {profile.displayName}
                    </div>
                    <div className="text-green-300 text-xs font-medium capitalize">
                      {profile.role}
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Logout */}
          <div className="pt-6 border-t border-white/10 mt-7">
            <button
              onClick={handleLogout}
              className="group w-full flex items-center space-x-3 backdrop-blur-sm bg-red-500/20 border border-red-400/30 text-red-200 rounded-xl px-4 py-3 hover:bg-red-500/30 hover:border-red-400/50 hover:text-red-100 transition-all duration-300 hover:scale-105"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
