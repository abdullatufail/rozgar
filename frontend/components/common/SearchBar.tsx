"use client";

import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  className?: string;
  defaultQuery?: string;
}

export function SearchBar({ onSearch, className, defaultQuery = "" }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSearch) {
      onSearch(query);
    } else {
      // Default behavior: navigate to search page
      const params = new URLSearchParams();
      if (query) {
        params.set("search", query.trim());
      }
      
      router.push(`/search/gigs?${params.toString()}`);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`flex w-full max-w-md rounded-full border border-gray-300 bg-white overflow-hidden ${className}`}
      style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          type="search"
          placeholder="What services are you looking for today?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border-0 pl-10 pr-0 py-2 h-12 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-l-full"
          style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
        />
      </div>
      
      <Button
        type="submit"
        className="h-12 px-6 rounded-r-full"
      >
        Search
      </Button>
    </form>
  );
} 