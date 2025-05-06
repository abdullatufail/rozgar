"use client";

import Link from "next/link";
import { useAuth } from "../../contexts/auth-context";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SearchBar } from "./SearchBar";
import { useEffect } from "react";
import { useState } from "react";
import { Gig } from "@/lib/validators";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { PRICE_RANGES } from "@/lib/constants";

export function Navbar() {
  const { user } = useAuth();
  
  
 
  const searchParams = useSearchParams();
  const router = useRouter();
 
  const initialQuery = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialMinPrice = searchParams.get("minPrice") || "0";
  const initialMaxPrice = searchParams.get("maxPrice") || "1000";
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number>(
    PRICE_RANGES.findIndex(range => 
      range.min === Number(initialMinPrice) && range.max === Number(initialMaxPrice)
    ) || 0
  );
  

  const [gigs, setGigs] = useState<Gig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    fetchGigs();
  }, [searchParams]);

  const fetchGigs = async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      if (searchParams.get("search")) {
        params.append("search", searchParams.get("search")!.trim());
      }
      
      if (searchParams.get("category")) {
        params.append("category", searchParams.get("category") as string);
      }
      
      if (searchParams.get("minPrice")) {
        params.append("minPrice", searchParams.get("minPrice") as string);
      }
      
      if (searchParams.get("maxPrice")) {
        params.append("maxPrice", searchParams.get("maxPrice") as string);
      }
      
      const queryString = params.toString() ? `?${params.toString()}` : "";
      const response = await api.get<Gig[]>(`/gigs${queryString}`);
      
      // If search query exists, filter gigs to ensure they have the search term in title
      const searchQuery = searchParams.get("search")?.trim();
      if (searchQuery) {
        const filteredGigs = response.filter(gig => 
          gig.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setGigs(filteredGigs);
      } else {
        setGigs(response);
      }
    } catch (error) {
      console.error("Error fetching gigs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams();
  };

 const updateSearchParams = () => {
    // Create a new URLSearchParams object
    const params = new URLSearchParams(searchParams.toString());
    
    // Update or remove search parameter
    if (searchQuery) {
      params.set("search", searchQuery.trim());
    } else {
      params.delete("search");
    }
    
    // Update or remove category parameter
    if (selectedCategory) {
      params.set("category", selectedCategory);
    } else {
      params.delete("category");
    }
    
    // Update price range parameters
    const priceRange = PRICE_RANGES[selectedPriceRange];
    if (priceRange.min > 0) {
      params.set("minPrice", priceRange.min.toString());
    } else {
      params.delete("minPrice");
    }
    
    
    if (priceRange.max < 1000) {
      params.set("maxPrice", priceRange.max.toString());
    } else {
      params.delete("maxPrice");
    }
    
    // Navigate to new URL with updated parameters
    router.push(`/search/gigs?${params.toString()}`);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
    setTimeout(() => updateSearchParams(), 0);
  };

  const handlePriceRangeSelect = (index: number) => {
    setSelectedPriceRange(index);
    setTimeout(() => updateSearchParams(), 0);
  };

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 mb-4">
      <Link href="/" className="text-3xl font-bold">
            <span className="flex items-center">
              <span className="text-black">*</span>
              <span className="ml-1">rozgaar</span>
            </span>
          </Link>
          <div className="mb-8">
          <SearchBar 
            className="w-full max-w-xl mx-auto" 
            defaultQuery={searchQuery}
            onSearch={(query) => {
              setSearchQuery(query);
              setTimeout(() => updateSearchParams(), 0);
            }}
          />
        </div>
        <div className="flex items-center gap-4">
          
          {user ? (
            <>
              <Link href="/orders">
                <Button variant="ghost">Orders</Button>
              </Link>
              <div className="flex items-center mr-2">
                <span className="text-sm font-medium text-green-600">
                  ${user.balance?.toFixed(2) || '0.00'}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">{user.name}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
          <Link href="/login" className="text-gray-600 hover:text-black px-4 py-2 rounded-full border border-gray-300">
            Log in
          </Link>
          <Link href="/register" className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800">
            Sign up
          </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 