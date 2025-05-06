"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../contexts/auth-context";
import { Gig, getGig, updateGig } from "../../../../services/gigs";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { useToast } from "../../../../components/ui/use-toast";
import { Spinner } from "../../../../components/ui/spinner";
import { Navbar } from "../../../../components/common/Navbar";
import { PageTransition, FadeIn } from "../../../../components/animations";
import Image from "next/image";

export default function EditGigPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, loading: userLoading } = useAuth();
  const { toast } = useToast();
  const [gig, setGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (user) {
      if (user.role !== "freelancer") {
        router.push("/dashboard");
        return;
      }
      fetchGig();
    }
  }, [user, router, params.id]);

  const fetchGig = async () => {
    try {
      setLoading(true);
      const gigData = await getGig(params.id);

      // Verify that the gig belongs to the logged-in freelancer
      if (gigData.freelancerId !== user?.id) {
        toast({
          title: "Unauthorized",
          description: "You do not have permission to edit this gig",
          variant: "destructive",
        });
        router.push("/freelancerGigs");
        return;
      }

      setGig(gigData);
      setTitle(gigData.title);
      setDescription(gigData.description);
      setPrice(gigData.price.toString());
      setCategory(gigData.category);
      setDurationDays(gigData.durationDays.toString());
      setImageUrl(gigData.image);
      setImagePreview(gigData.image);
    } catch (error) {
      console.error("Error fetching gig:", error);
      toast({
        title: "Error",
        description: "Failed to fetch gig details",
        variant: "destructive",
      });
      router.push("/freelancerGigs");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !price || !category || !durationDays) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      let updatedImageUrl = imageUrl;

      // If a new image was selected, upload it first
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const data = await response.json();
        updatedImageUrl = data.url;
      }

      await updateGig(params.id, {
        title,
        description,
        price: parseInt(price),
        category,
        durationDays: parseInt(durationDays),
        image: updatedImageUrl,
      });

      toast({
        title: "Success",
        description: "Gig updated successfully",
      });

      router.push("/freelancerGigs");
    } catch (error) {
      console.error("Error updating gig:", error);
      toast({
        title: "Error",
        description: "Failed to update gig",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (userLoading || loading) {
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
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <FadeIn>
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Edit Gig</h1>
            <p className="text-muted-foreground mt-2">Update your gig details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="I will do something amazing"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your service in detail..."
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 50"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="digital-marketing">Digital Marketing</SelectItem>
                      <SelectItem value="web-development">Web Development</SelectItem>
                      <SelectItem value="graphic-design">Graphic Design</SelectItem>
                      <SelectItem value="writing">Writing & Translation</SelectItem>
                      <SelectItem value="video-editing">Video Editing</SelectItem>
                      <SelectItem value="social-media">Social Media Management</SelectItem>
                      <SelectItem value="seo">SEO</SelectItem>
                      <SelectItem value="illustration">Illustration</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Delivery Time (days)</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    placeholder="e.g. 5"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image">Gig Image</Label>
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      The image that represents your gig
                    </p>
                  </div>
                  {imagePreview && (
                    <div className="relative h-24 w-32 overflow-hidden rounded">
                      <Image
                        src={imagePreview}
                        alt="Gig preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/freelancerGigs")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Spinner className="mr-2" /> : null}
                Save Changes
              </Button>
            </div>
          </form>
        </FadeIn>
      </div>
    </PageTransition>
  );
} 