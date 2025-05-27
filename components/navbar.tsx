"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Menu, X, User, MessageCircle, CreditCard, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navItems = [
    { href: "/", label: "Home", icon: <Heart className="h-4 w-4 mr-2" /> },
    { href: "/girlfriends", label: "Girlfriends", icon: <User className="h-4 w-4 mr-2" /> },
    { href: "/chat", label: "Chat", icon: <MessageCircle className="h-4 w-4 mr-2" /> },
    { href: "/subscription", label: "Subscription", icon: <CreditCard className="h-4 w-4 mr-2" /> },
  ];

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white dark:bg-gray-900 shadow-sm",
        // Always show a solid background for visibility
        // Optionally, you can keep the scroll effect by toggling a border or shadow
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/" className="flex items-center">
              <span className="sr-only">AI Girlfriend</span>
              <Heart className="h-8 w-8 text-pink-500" />
              <span className="ml-2 text-xl font-bold text-pink-500 dark:text-pink-400">
                AI Girlfriend
              </span>
            </Link>
          </div>

          <div className="-mr-2 -my-2 md:hidden">
            <Button
              variant="ghost"
              onClick={toggleMenu}
              aria-label="Toggle menu"
              className="rounded-md p-2"
            >
              <span className="sr-only">Open menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </Button>
          </div>

          <nav className="hidden md:flex space-x-10">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  pathname === item.href
                    ? "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0 space-x-4">
            <Link
              href="/auth/login"
              className="text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Link>
            <Button
              asChild
              variant="outline"
              className="border-pink-500 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20"
            >
              <Link href="/auth/signup">
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </Link>
            </Button>
            <Button
              asChild
              variant="gradient"
              className="ml-2 whitespace-nowrap"
            >
              <Link href="/subscription">
                Upgrade Now
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        className={cn(
          "absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden",
          isOpen ? "block" : "hidden"
        )}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isOpen ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white dark:bg-gray-900 divide-y-2 divide-gray-50 dark:divide-gray-800">
          <div className="pt-5 pb-6 px-5">
            <div className="flex items-center justify-between">
              <div>
                <Heart className="h-8 w-8 text-pink-500" />
              </div>
              <div className="-mr-2">
                <Button
                  variant="ghost"
                  onClick={closeMenu}
                  className="rounded-md p-2"
                >
                  <span className="sr-only">Close menu</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </Button>
              </div>
            </div>
            <div className="mt-6">
              <nav className="grid gap-y-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800",
                      pathname === item.href
                        ? "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400"
                        : "text-gray-700 dark:text-gray-300"
                    )}
                    onClick={closeMenu}
                  >
                    {item.icon}
                    <span className="ml-3 text-base font-medium">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
          <div className="py-6 px-5 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Button
                asChild
                variant="outline"
                className="border-pink-500 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20"
              >
                <Link href="/auth/login" onClick={closeMenu}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-pink-500 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20"
              >
                <Link href="/auth/signup" onClick={closeMenu}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Link>
              </Button>
            </div>
            <Button
              asChild
              variant="gradient"
              className="w-full flex items-center justify-center"
            >
              <Link href="/subscription" onClick={closeMenu}>
                Upgrade Now
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
};

export default Navbar;
