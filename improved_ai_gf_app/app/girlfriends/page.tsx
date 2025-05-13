"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GirlfriendCard from "@/components/girlfriend-card";
import { SAMPLE_GIRLFRIENDS, PERSONALITY_TYPES } from "@/lib/utils";

export default function GirlfriendsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [filteredGirlfriends, setFilteredGirlfriends] = useState(SAMPLE_GIRLFRIENDS);
  
  useEffect(() => {
    let results = SAMPLE_GIRLFRIENDS;
    
    // Apply personality filter
    if (activeFilter !== "ALL") {
      results = results.filter(
        (girlfriend) => girlfriend.personality === activeFilter
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      results = results.filter(
        (girlfriend) =>
          girlfriend.name.toLowerCase().includes(lowercasedSearch) ||
          girlfriend.description.toLowerCase().includes(lowercasedSearch) ||
          girlfriend.traits.some(trait => 
            trait.toLowerCase().includes(lowercasedSearch)
          ) ||
          girlfriend.interests.some(interest => 
            interest.toLowerCase().includes(lowercasedSearch)
          )
      );
    }
    
    setFilteredGirlfriends(results);
  }, [searchTerm, activeFilter]);

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Find Your Perfect <span className="gradient-text">AI Girlfriend</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Browse our collection of AI girlfriends with different personalities, interests, and traits to find your ideal companion.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-auto md:flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search by name, traits, or interests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="w-full md:w-auto">
              <Tabs defaultValue="ALL" value={activeFilter} onValueChange={setActiveFilter}>
                <TabsList className="w-full md:w-auto">
                  <TabsTrigger value="ALL" className="flex-1 md:flex-none">
                    All
                  </TabsTrigger>
                  {Object.keys(PERSONALITY_TYPES).map((type) => (
                    <TabsTrigger key={type} value={type} className="flex-1 md:flex-none">
                      {PERSONALITY_TYPES[type as keyof typeof PERSONALITY_TYPES].name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </motion.div>
        
        {filteredGirlfriends.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredGirlfriends.map((girlfriend) => (
              <GirlfriendCard
                key={girlfriend.id}
                id={girlfriend.id}
                name={girlfriend.name}
                description={girlfriend.description}
                personality={girlfriend.personality}
                imageUrl={girlfriend.imageUrl}
                traits={girlfriend.traits}
                interests={girlfriend.interests}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-12"
          >
            <Heart className="h-16 w-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
              No matches found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We couldn't find any girlfriends matching your search criteria.
            </p>
            <Button onClick={() => {
              setSearchTerm("");
              setActiveFilter("ALL");
            }}>
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}