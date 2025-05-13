"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MessageCircle, Clock, Heart, CreditCard, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SAMPLE_GIRLFRIENDS, SUBSCRIPTION_PLANS } from "@/lib/utils";

// Mock user data
const USER = {
  name: "John Doe",
  email: "john.doe@example.com",
  subscription: "BASIC",
  messageCount: 87,
  messageLimit: 150,
  joinDate: new Date("2023-01-15"),
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  
  const subscriptionPlan = SUBSCRIPTION_PLANS[USER.subscription as keyof typeof SUBSCRIPTION_PLANS];
  const messagePercentage = Math.round((USER.messageCount / USER.messageLimit) * 100);

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <Card className="sticky top-20">
              <CardHeader className="pb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mr-4">
                    <Image
                      src="https://randomuser.me/api/portraits/men/32.jpg"
                      alt={USER.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{USER.name}</CardTitle>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {USER.email}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {[
                    { id: "overview", label: "Overview", icon: <Heart className="h-4 w-4 mr-2" /> },
                    { id: "conversations", label: "Conversations", icon: <MessageCircle className="h-4 w-4 mr-2" /> },
                    { id: "subscription", label: "Subscription", icon: <CreditCard className="h-4 w-4 mr-2" /> },
                    { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4 mr-2" /> },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center w-full px-4 py-2 text-sm font-medium ${
                        activeTab === item.id
                          ? "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20"
                          : "text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "overview" && (
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
                      {
                        title: "Subscription Plan",
                        value: subscriptionPlan.name,
                        icon: <CreditCard className="h-5 w-5 text-pink-500" />,
                        color: "bg-pink-100 dark:bg-pink-900/20",
                      },
                      {
                        title: "Daily Messages",
                        value: `${USER.messageCount}/${USER.messageLimit}`,
                        icon: <MessageCircle className="h-5 w-5 text-blue-500" />,
                        color: "bg-blue-100 dark:bg-blue-900/20",
                      },
                      {
                        title: "Member Since",
                        value: new Date(USER.joinDate).toLocaleDateString(),
                        icon: <Clock className="h-5 w-5 text-green-500" />,
                        color: "bg-green-100 dark:bg-green-900/20",
                      },
                    ].map((stat, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {stat.title}
                              </p>
                              <p className="text-2xl font-bold mt-1">{stat.value}</p>
                            </div>
                            <div className={`p-2 rounded-full ${stat.color}`}>
                              {stat.icon}
                            </div>
                          </div>
                          
                          {stat.title === "Daily Messages" && (
                            <div className="mt-4">
                              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${messagePercentage}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {messagePercentage}% of daily limit used
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h2 className="text-xl font-bold mb-4">Recent Conversations</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {SAMPLE_GIRLFRIENDS.slice(0, 4).map((girlfriend) => (
                      <Card key={girlfriend.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                        <CardContent className="p-0">
                          <Link href={`/chat?girlfriendId=${girlfriend.id}`} className="block">
                            <div className="flex items-center p-4">
                              <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                                <Image
                                  src={girlfriend.imageUrl}
                                  alt={girlfriend.name}
                                  width={48}
                                  height={48}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium truncate">
                                  {girlfriend.name}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  Last message: Hey there! How's your day going?
                                </p>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                2h ago
                              </div>
                            </div>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Button asChild variant="outline">
                      <Link href="/girlfriends">
                        View All Girlfriends
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
            
            {activeTab === "conversations" && (
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-2xl font-bold mb-6">Your Conversations</h1>
                  
                  <Tabs defaultValue="all">
                    <TabsList className="mb-6">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="recent">Recent</TabsTrigger>
                      <TabsTrigger value="favorites">Favorites</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all" className="space-y-4">
                      {SAMPLE_GIRLFRIENDS.map((girlfriend) => (
                        <Card key={girlfriend.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                          <CardContent className="p-0">
                            <Link href={`/chat?girlfriendId=${girlfriend.id}`} className="block">
                              <div className="flex items-center p-4">
                                <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                                  <Image
                                    src={girlfriend.imageUrl}
                                    alt={girlfriend.name}
                                    width={48}
                                    height={48}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-medium truncate">
                                    {girlfriend.name}
                                  </h3>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    Last message: Hey there! How's your day going?
                                  </p>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {Math.floor(Math.random() * 24)}h ago
                                </div>
                              </div>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="recent" className="space-y-4">
                      {SAMPLE_GIRLFRIENDS.slice(0, 3).map((girlfriend) => (
                        <Card key={girlfriend.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                          <CardContent className="p-0">
                            <Link href={`/chat?girlfriendId=${girlfriend.id}`} className="block">
                              <div className="flex items-center p-4">
                                <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                                  <Image
                                    src={girlfriend.imageUrl}
                                    alt={girlfriend.name}
                                    width={48}
                                    height={48}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-medium truncate">
                                    {girlfriend.name}
                                  </h3>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    Last message: Hey there! How's your day going?
                                  </p>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {Math.floor(Math.random() * 5)}h ago
                                </div>
                              </div>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="favorites" className="space-y-4">
                      {SAMPLE_GIRLFRIENDS.slice(1, 3).map((girlfriend) => (
                        <Card key={girlfriend.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                          <CardContent className="p-0">
                            <Link href={`/chat?girlfriendId=${girlfriend.id}`} className="block">
                              <div className="flex items-center p-4">
                                <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                                  <Image
                                    src={girlfriend.imageUrl}
                                    alt={girlfriend.name}
                                    width={48}
                                    height={48}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-medium truncate">
                                    {girlfriend.name}
                                  </h3>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    Last message: Hey there! How's your day going?
                                  </p>
                                </div>
                                <div className="flex items-center">
                                  <Heart className="h-4 w-4 text-pink-500 fill-pink-500 mr-2" />
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {Math.floor(Math.random() * 24)}h ago
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                  </Tabs>
                </motion.div>
              </div>
            )}
            
            {activeTab === "subscription" && (
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-2xl font-bold mb-6">Your Subscription</h1>
                  
                  <Card className="mb-8">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h2 className="text-xl font-bold gradient-text">
                            {subscriptionPlan.name} Plan
                          </h2>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {subscriptionPlan.description}
                          </p>
                        </div>
                        
                        {USER.subscription !== "PREMIUM" && (
                          <Button asChild variant="gradient" className="mt-4 md:mt-0">
                            <Link href="/subscription">
                              Upgrade Plan
                            </Link>
                          </Button>
                        )}
                      </div>
                      
                      <div className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-6">
                        <h3 className="text-sm font-medium mb-4">Plan Features</h3>
                        <ul className="space-y-3">
                          {subscriptionPlan.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mr-2 mt-0.5">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <h2 className="text-xl font-bold mb-4">Billing Information</h2>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Current Plan
                          </p>
                          <p className="font-medium">
                            {subscriptionPlan.name} (${subscriptionPlan.price}/month)
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Billing Cycle
                          </p>
                          <p className="font-medium">Monthly</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Next Billing Date
                          </p>
                          <p className="font-medium">June 15, 2023</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Payment Method
                          </p>
                          <p className="font-medium">Visa ending in 4242</p>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        <Button variant="outline">
                          Update Payment Method
                        </Button>
                        <Button variant="outline" className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                          Cancel Subscription
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}
            
            {activeTab === "settings" && (
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
                  
                  <Card className="mb-8">
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            defaultValue={USER.name}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            defaultValue={USER.email}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Profile Picture
                          </label>
                          <div className="flex items-center">
                            <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mr-4">
                              <Image
                                src="https://randomuser.me/api/portraits/men/32.jpg"
                                alt={USER.name}
                                width={64}
                                height={64}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <Button variant="outline" size="sm">
                              Change
                            </Button>
                          </div>
                        </div>
                        
                        <Button className="mt-2">
                          Save Changes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="mb-8">
                    <CardHeader>
                      <CardTitle>Password</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                          />
                        </div>
                        
                        <Button className="mt-2">
                          Update Password
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Preferences</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Email Notifications</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Receive email updates about your account
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-500"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Dark Mode</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Toggle between light and dark theme
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-500"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Message Previews</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Show message previews in notifications
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-500"></div>
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}