import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { Star } from "../ui/star";
import { Gig } from "../../services/gigs";
import { Clock } from "lucide-react";

interface GigCardProps {
  gig: Gig;
}

export function GigCard({ gig }: GigCardProps) {
  // Format the rating display
  const formattedRating = typeof gig.rating === 'number' ? gig.rating.toFixed(1) : '0';
  const hasReviews = gig.totalReviews && gig.totalReviews > 0;

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-white  transition-all hover:border-2 hover:border-black p-4 hover:scale-130">
      <div className="aspect-video overflow-hidden">
        <Image
          src={gig.image}
          alt={gig.title}
          width={400}
          height={225}
          className="h-full w-full object-cover "
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">{gig.title}</h3>
          </div>
          <div className="flex flex-col">
            <div className="ml-1 flex items-center">
              <Star filled />
              <span className="text-sm font-medium">
                {formattedRating}
                {hasReviews && ` (${gig.totalReviews})`}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-between mt-2">
          <div>
            <h3 className="font-medium">Category</h3>
            <p className="text-muted-foreground">{gig.category}</p>
          </div>
          <div>
            <p className="mt-1 text-sm text-gray-900">{gig.freelancer.name}</p>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Clock className="h-3 w-3 mr-1" />
              <span>{gig.durationDays || 7} days delivery</span>
            </div>
          </div>
        </div>
            
        <div className="flex justify-between items-center mt-4">
            <div>
              <span className="text-sm text-gray-500">Starting at</span>
              <p className="font-semibold text-xl">${gig.price}</p>
            </div>
            <Link href={`/gigs/${gig.id}`}>
              <Button>
                View Details
              </Button>
            </Link>
          </div>
      </div>
    </div>
  );
} 