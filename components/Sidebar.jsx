"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, Plus, List, LogOut, Compass } from "lucide-react";

export default function Sidebar({  activeRoute, isOpen = false, setIsOpen = () => {} }){
  const router = useRouter();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/listings", label: "Explore", icon: Compass },
    { href: "/dashboard/create-listing", label: "Create Listing", icon: Plus },
    { href: "/dashboard/my-listings", label: "My Listings", icon: List },
  ];

  const handleSignOut = () => {
    localStorage.removeItem("token");
    router.push("/login");
    setIsOpen(false);
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="flex flex-col h-full pt-24 lg:pt-65">
          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-lg transition ${
                  activeRoute === item.href
                    ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Sign Out */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 p-3 w-full text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}