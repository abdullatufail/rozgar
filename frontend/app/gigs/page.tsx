"use client";

import { sampleGigs } from "../../lib/constants";
import { GigCard } from "../../components/common/GigCard";
import { Navbar } from "@/components/common/Navbar";

export default function GigsPage() {
  return (
    <div>
      <Navbar />
      <h1 className="mb-8 text-3xl font-bold">Available Gigs</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sampleGigs.map((gig) => (
          <GigCard key={gig.id} gig={gig} />
        ))}
      </div>
    </div>
  );
} 