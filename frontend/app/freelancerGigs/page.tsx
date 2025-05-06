"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/auth-context";
import { Gig, deleteGig, getGigs } from "../../services/gigs";
import { Button } from "../../components/ui/button";
import { useToast } from "../../components/ui/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { Edit, Plus, Star, Trash2 } from "lucide-react";
import { Navbar } from "../../components/common/Navbar";
import { Spinner } from "../../components/ui/spinner";
import { PageTransition, FadeIn, SlideIn } from "../../components/animations";

export default function FreelancerGigsPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useAuth();
  const { toast } = useToast();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [gigToDelete, setGigToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      if (user.role !== "freelancer") {
        router.push("/dashboard");
        return;
      }
      fetchGigs();
    }
  }, [user, router]);

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const allGigs = await getGigs();
      const myGigs = allGigs.filter(gig => gig.freelancerId === user?.id);
      setGigs(myGigs);
    } catch (error) {
      console.error("Error fetching gigs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your gigs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGig = async (id: number) => {
    try {
      await deleteGig(id.toString());
      toast({
        title: "Success",
        description: "Gig deleted successfully",
      });
      fetchGigs();
    } catch (error) {
      console.error("Error deleting gig:", error);
      toast({
        title: "Error",
        description: "Failed to delete gig",
        variant: "destructive",
      });
    }
    setGigToDelete(null);
  };

  if (userLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  if (user.role !== "freelancer") {
    router.push("/dashboard");
    return null;
  }

  return (
    <PageTransition>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <FadeIn>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">My Gigs</h1>
            <Link href="/freelancerGigs/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New Gig
              </Button>
            </Link>
          </div>
        </FadeIn>

        {loading ? (
          <div className="flex justify-center my-8">
            <Spinner />
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">You haven't created any gigs yet</h2>
            <p className="text-muted-foreground mb-6">Start by creating your first gig to showcase your services</p>
            <Link href="/freelancerGigs/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Gig
              </Button>
            </Link>
          </div>
        ) : (
          <SlideIn direction="up">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gigs.map((gig) => (
                    <TableRow key={gig.id}>
                      <TableCell>
                        <div className="relative h-12 w-20 overflow-hidden rounded">
                          <Image
                            src={gig.image}
                            alt={gig.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        <Link href={`/gigs/${gig.id}`} className="hover:underline">
                          {gig.title}
                        </Link>
                      </TableCell>
                      <TableCell>{gig.category}</TableCell>
                      <TableCell>${gig.price}</TableCell>
                      <TableCell>{gig.durationDays} days</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span>{gig.rating || 0}</span>
                          {gig.totalReviews && gig.totalReviews > 0 && (
                            <span className="text-muted-foreground text-xs ml-1">
                              ({gig.totalReviews})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDistanceToNow(new Date(gig.createdAt))} ago</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/freelancerGigs/${gig.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Gig</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this gig? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteGig(gig.id)} className="bg-red-600 hover:bg-red-700">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SlideIn>
        )}
      </div>
    </PageTransition>
  );
} 