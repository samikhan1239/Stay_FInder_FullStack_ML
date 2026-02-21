"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "../utils/api";
import { Home, Menu, X, User } from "lucide-react";

export default function Header() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const router = useRouter();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get logged in user
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      fetchWithAuth("/api/auth/me")
        .then(async (response) => {
          const data = await response.json();
          if (response.ok) {
            setUser(data);
          } else {
            localStorage.removeItem("token");
            setUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm py-4"
          : "bg-transparent py-5"
      }`}
    >
      <nav className="w-full px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between">

          {/* LEFT — Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              StayFinder
            </span>
          </Link>

          {/* CENTER — Navigation (Desktop Only) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-red-500 transition"
            >
              Home
            </Link>
            <Link
              href="/listings"
              className="text-sm font-medium text-gray-700 hover:text-red-500 transition"
            >
              Explore
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-red-500 transition"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* RIGHT — Profile + Mobile Menu */}
          <div className="flex items-center gap-3">

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() =>
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                  }
                  
                >
              
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-44 bg-white rounded-xl shadow-lg border py-2">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() =>
                        setIsProfileDropdownOpen(false)
                      }
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/register"
                className="hidden md:block text-sm font-medium text-gray-700 hover:text-red-500"
              >
                Sign Up
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

          </div>
        </div>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-xl shadow-lg border p-4 space-y-4">
            <Link
              href="/"
              className="block"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/listings"
              className="block"
              onClick={() => setIsMenuOpen(false)}
            >
              Explore
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="text-left w-full"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/register"
                className="block"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}