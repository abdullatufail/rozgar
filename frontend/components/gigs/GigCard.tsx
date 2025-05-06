"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../../contexts/auth-context";
import { Button } from "../ui/button";
import { formatDistanceToNow } from "date-fns";
import { Star } from "../ui/star";

interface GigCardProps {
  gig?: {
    id: number;
    title: string;
    description: string;
    price: number;
    image?: string;
    freelancerId: number;
    freelancer: {
      name: string;
    };
    createdAt: string;
    rating?: number;
    totalReviews?: number;
  };
}

export function GigCard({ gig }: GigCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  if (!gig) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
          <div className="flex h-full items-center justify-center">
            <span className="text-muted-foreground">No gig data available</span>
          </div>
        </div>
        <div className="p-4">
          <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="mt-4 flex items-center justify-between">
            <div className="h-8 w-20 animate-pulse rounded bg-muted" />
            <div className="h-10 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = gig.image || "https://via.placeholder.com/400x225";

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
        <Image
          src={imageError ? "https://via.placeholder.com/400x225" : imageUrl}
          alt={gig.title}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{gig.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {gig.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">${gig.price}</p>
            <p className="text-sm text-muted-foreground">
              by {gig.freelancer.name}
            </p>
            {gig.rating && (
              <div className="mt-1 flex items-center gap-1">
                <Star filled />
                <span className="text-sm font-medium">
                  {gig.rating.toFixed(1)}
                  {gig.totalReviews && (
                    <span className="text-muted-foreground">
                      {" "}
                      ({gig.totalReviews})
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
          <Button
            onClick={() => router.push(`/gigs/${gig.id}`)}
            className="ml-4"
          >
            View Details
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Posted {formatDistanceToNow(new Date(gig.createdAt))} ago
        </p>
      </div>
    </div>
  );
} 