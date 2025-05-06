"use client";

import { useState, useEffect } from "react";

import { ChevronDown, Search } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { Button } from "../../../components/ui/button";

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "../../../components/ui/dropdown-menu";
import { useAuth } from "../../../contexts/auth-context";
import { GigCard } from "@/components/common/GigCard";
import { Gig } from "@/services/gigs";
import { FadeIn, SlideIn } from "@/components/animations";
import { SearchBar } from "@/components/common/SearchBar";
import Footer from "@/components/common/Footer";
import { Navbar } from "@/components/common/Navbar";


// Available categories
const CATEGORIES = [
  "Web Development", 
  "Mobile Development", 
  "Graphic Design", 
  "Content Writing", 
  "Digital Marketing"
];

// Price range options
const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: 1000 },
  { label: "Under $50", min: 0, max: 50 },
  { label: "$50 to $100", min: 50, max: 100 },
  { label: "$100 to $200", min: 100, max: 200 },
  { label: "$200 to $500", min: 200, max: 500 },
  { label: "$500+", min: 500, max: 1000 }
];

export default function GigsSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
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
    <div style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* Header */}
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        
        
        {/* Filters */}
        <SlideIn direction="down">
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <span className="font-medium">Filters</span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center rounded-full bg-gray-200 px-4 py-2 text-sm">
                  <span>{selectedCategory || "Category"}</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {CATEGORIES.map((category) => (
                  <DropdownMenuItem 
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className={selectedCategory === category ? "bg-gray-100" : ""}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
                {selectedCategory && (
                  <DropdownMenuItem onClick={() => handleCategorySelect("")}>
                    Clear Filter
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center rounded-full bg-gray-200 px-4 py-2 text-sm">
                  <span>{PRICE_RANGES[selectedPriceRange].label}</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {PRICE_RANGES.map((range, index) => (
                  <DropdownMenuItem 
                    key={index}
                    onClick={() => handlePriceRangeSelect(index)}
                    className={selectedPriceRange === index ? "bg-gray-100" : ""}
                  >
                    {range.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {(selectedCategory || selectedPriceRange > 0) && (
              <Button 
                variant="outline" 
                className="flex items-center rounded-full bg-gray-200 px-4 py-2 text-sm"
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedPriceRange(0);
                  router.push("/search/gigs");
                }}
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </SlideIn>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.map((gig, index) => (
              <SlideIn key={gig.id} direction="up" delay={0.1 * index % 3}>
                <GigCard gig={gig} />
              </SlideIn>
            ))}
            
            {gigs.length === 0 && (
              <FadeIn className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <h3 className="text-xl font-medium mb-2">No gigs found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </FadeIn>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}



