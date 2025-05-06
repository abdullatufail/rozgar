"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "../components/ui/button";
import { SearchBar } from "../components/common/SearchBar";
import { GigCard } from "../components/gigs/GigCard";
import { api } from "../lib/api";
import Image from "next/image";
import { ArrowRight, ExternalLink, Info, Search } from "lucide-react";
import { Input } from "../components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { useAuth } from "../contexts/auth-context";
import { PageTransition } from "../components/animations";
import { ScrollFadeIn } from "../components/animations/ScrollFadeIn";
import { ScrollSlideIn } from "../components/animations/ScrollSlideIn";
import Footer from "@/components/common/Footer";
import { useRouter, useSearchParams } from "next/navigation";

interface Gig {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  freelancerId: number;
  freelancer: {
    name: string;
  };
  createdAt: string;
}

// Available categories with descriptions
const CATEGORIES = [
  { 
    name: "Web Development", 
    description: "Professional websites built with the latest technologies" 
  },
  { 
    name: "Mobile Development", 
    description: "Native and cross-platform mobile apps for iOS and Android" 
  },
  { 
    name: "Graphic Design", 
    description: "Stunning visual content that captures your brand essence" 
  },
  { 
    name: "Content Writing", 
    description: "Engaging copy that drives conversion and builds authority" 
  },
  { 
    name: "Digital Marketing", 
    description: "Results-driven strategies to grow your online presence"
  }
];

export default function Home() {
  const { user, logout } = useAuth();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async (query = "") => {
    try {
      setIsLoading(true);
      const response = await api.get<Gig[]>(`/gigs${query ? `?search=${query}` : ""}`);
      setGigs(response);
    } catch (error) {
      console.error("Error fetching gigs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to search page with query parameter
    window.location.href = `/search/gigs${searchQuery ? `?search=${searchQuery}` : ""}`;
  };

  const navigateToCategory = (categoryName: string) => {
    window.location.href = `/search/gigs?category=${encodeURIComponent(categoryName)}`;
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
    
    // Navigate to new URL with updated parameters
    router.push(`/search/gigs?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
        {/* Header */}
        <div>
          <header className="container mx-auto px-4 py-6 flex items-center justify-between">
            <nav className="flex space-x-6">
              <Link href="/search/gigs" className="text-gray-600 hover:text-black">
                Explore Gigs
              </Link>
            </nav>
            
            <div className="flex-1 flex justify-center">
              <Link href="/" className="text-3xl font-bold">
                <span className="flex items-center">
                  <span className="text-black">*</span>
                  <span className="ml-1">rozgaar</span>
                </span>
              </Link>
            </div>
            { (!user)?<div className="flex items-center space-x-3">
              <Link href="/login" className="text-gray-600 hover:text-black px-4 py-2 rounded-full border border-gray-300">
                Log in
              </Link>
              <Link href="/register" className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800">
                Sign up
              </Link>
            </div>:<DropdownMenu>
            <DropdownMenuTrigger asChild>
                      <Button variant="ghost">{user.name}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </DropdownMenuItem>
                      {user.role === "admin" && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin">Admin Dashboard</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                    }
            
          </header>
        </div>

        <main>
          {/* Hero Section */}
          <section className="container mx-auto px-4 py-16 md:py-28">
            <div className="max-w-4xl mx-auto">
              <ScrollSlideIn direction="down">
                <h1 className="text-5xl md:text-6xl font-bold mb-12 text-center leading-tight">
                  Pakistan's fastest growing Freelance Platform
                </h1>
              </ScrollSlideIn>
              
              <ScrollFadeIn delay={0.3}>
                <div className="mb-12 text-center">
                  <p className="text-lg mb-6">
                    Join Pakistan's fastest-growing freelancing platform.<br />
                    Connect with clients, showcase your skills, and build the career you deserve.
                  </p>
                  <div className="inline-flex items-center">
                    <Info className="h-5 w-5 text-gray-500 mr-2" />
                  </div>
                </div>
              </ScrollFadeIn>
              
              <ScrollSlideIn direction="up" delay={0.3}>
                <div className="flex justify-center mb-8">
                <SearchBar 
            className="w-full max-w-xl mx-auto" 
            defaultQuery={searchQuery}
            onSearch={(query) => {
              setSearchQuery(query);
              setTimeout(() => updateSearchParams(), 0);
            }}
          />
                </div>
              </ScrollSlideIn>
            </div>
          </section>

          {/* Why clients prefer rozgaar */}
          <ScrollFadeIn delay={0.2}>
            <section className="bg-black text-white px-10 py-16 md:py-24 rounded-xl">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-center mb-12 md:mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 md:mb-0 md:w-1/2">
                    Why clients prefer rozgaar
                  </h2>
                  <p className="md:w-1/2 text-lg">
                    Rozgaar is designed to empower freelancers and businesses in Pakistan with a seamless, reliable, and growth-driven platform.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ScrollSlideIn direction="up" delay={0.4}>
                    <div className="bg-black border border-gray-800 rounded-lg p-8">
                      <h3 className="text-2xl font-bold mb-6">Trusted by Thousands</h3>
                      <p className="text-gray-400">
                        Join a thriving community of skilled freelancers and reputable clients.
                      </p>
                    </div>
                  </ScrollSlideIn>
                  
                  <ScrollSlideIn direction="up" delay={0.5}>
                    <div className="bg-black border border-gray-800 rounded-lg p-8">
                      <h3 className="text-2xl font-bold mb-6">Local Payment Solutions</h3>
                      <p className="text-gray-400">
                        Enjoy fast, hassle-free payments with methods tailored for Pakistan.
                      </p>
                    </div>
                  </ScrollSlideIn>
                  
                  <ScrollSlideIn direction="up" delay={0.6}>
                    <div className="bg-black border border-gray-800 rounded-lg p-8">
                      <h3 className="text-2xl font-bold mb-6">24/7 Customer Support</h3>
                      <p className="text-gray-400">
                        We're here to help whenever you need it.
                      </p>
                    </div>
                  </ScrollSlideIn>
                </div>
                
              </div>
            </section>
          </ScrollFadeIn>

          {/* Browse services by category */}
          <ScrollFadeIn delay={0.3}>
            <section className="py-16 md:py-24">
              <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold mb-16 text-center">
                  Browse services by category
                </h2>
                
                <div className="max-w-4xl mx-auto space-y-4">
                  {CATEGORIES.map((category, index) => (
                    <ScrollSlideIn 
                      key={category.name}
                      direction="right" 
                      delay={0.3 + index * 0.1}
                    >
                      <button 
                        onClick={() => navigateToCategory(category.name)}
                        className="w-full flex items-center justify-between border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow hover:bg-gray-50"
                      >
                        <span className="text-lg font-medium">{category.name}</span>
                        <div className="flex items-center">
                          <p className="hidden md:block text-sm text-gray-600 mr-8">{category.description}</p>
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </button>
                    </ScrollSlideIn>
                  ))}
                </div>
              </div>
            </section>
          </ScrollFadeIn>

          {/* Start Today Section */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-5xl font-bold mb-16 text-center">
                Start Today
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                {/* Client Account */}
                <div className="flex flex-col">
                  <Link href="/register?type=client" className="group">
                    <Button className="flex items-center justify-between text-xl font-medium bg-black text-white rounded-md px-8 py-6 w-full mb-4 hover:bg-gray-800">
                      <span>Client Account</span>
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <p className="text-gray-600">
                    Become a Client and hire freelancers for your projects
                  </p>
                </div>
                
                {/* Seller Account */}
                <div className="flex flex-col">
                  <Link href="/register?type=freelancer" className="group">
                    <Button className="flex items-center justify-between text-xl font-medium bg-black text-white rounded-md px-8 py-6 w-full mb-4 hover:bg-gray-800">
                      <span>Seller Account</span>
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <p className="text-gray-600">
                    Become a freelancer take up jobs and projects
                  </p>
                </div>
              </div>

              {/* Benefits Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto">
                {/* No Cost to Join */}
                <div className="bg-white p-8 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-semibold mb-4">No Cost to Join</h3>
                  <p className="text-gray-600">
                    Sign up for free, browse freelancer profiles, explore projects, or book a consultation at no cost.
                  </p>
                </div>
                
                {/* Post Jobs */}
                <div className="bg-white p-8 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-semibold mb-4">Post Jobs Effortlessly</h3>
                  <p className="text-gray-600">
                    Posting a job is simple and hassle-free. Need help? We can connect you with top sellers in no time.
                  </p>
                </div>
                
                {/* Affordable Talent */}
                <div className="bg-white p-8 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-semibold mb-4">Affordable High-Quality Talent</h3>
                  <p className="text-gray-600">
                    Hire skilled freelancers without stretching your budget, thanks to low transaction rates and transparent pricing.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <Footer />
        </main>
      </div>
    </PageTransition>
  );
}
