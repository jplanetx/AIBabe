import Link from "next/link";
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center">
              <Heart className="h-6 w-6 text-pink-500" />
              <span className="ml-2 text-lg font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                AI Girlfriend
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 max-w-md">
              Experience meaningful connections with AI companions designed to provide emotional support, engaging conversations, and a personalized relationship experience.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-wider uppercase">
              Features
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/girlfriends" className="text-sm text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400">
                  Personality Types
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-sm text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400">
                  Chat Experience
                </Link>
              </li>
              <li>
                <Link href="/subscription" className="text-sm text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400">
                  Subscription Plans
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-wider uppercase">
              Company
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            &copy; {new Date().getFullYear()} AI Girlfriend. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;