"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useToast } from "../ui/use-toast";
import { api } from "../../lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface GigFormProps {
  initialData?: {
    id?: number;
    title: string;
    description: string;
    price: number;
    category: string;
    image: string;
    durationDays?: number;
  };
}

const CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Graphic Design",
  "Content Writing",
  "Digital Marketing",
] as const;

export function GigForm({ initialData }: GigFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    price: initialData?.price || 1,
    category: initialData?.category || "Web Development",
    image: initialData?.image || "https://placehold.co/600x400",
    durationDays: initialData?.durationDays || 7,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      if (formData.title.length < 3) {
        throw new Error("Title must be at least 3 characters long");
      }
      if (formData.description.length < 10) {
        throw new Error("Description must be at least 10 characters long");
      }
      if (formData.price < 1) {
        throw new Error("Price must be at least 1");
      }
      if (!CATEGORIES.includes(formData.category as any)) {
        throw new Error("Invalid category selected");
      }

      if (initialData?.id) {
        await api.put(`/gigs/${initialData.id}`, formData);
        toast({
          title: "Success",
          description: "Gig updated successfully",
        });
      } else {
        await api.post("/gigs", formData);
        toast({
          title: "Success",
          description: "Gig created successfully",
        });
      }
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating gig:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save gig. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = value === "" ? 1 : parseFloat(value);
    setFormData({ ...formData, price: isNaN(numValue) ? 1 : numValue });
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = value === "" ? 7 : parseInt(value);
    setFormData({ ...formData, durationDays: isNaN(numValue) ? 7 : numValue });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter gig title (minimum 3 characters)"
          required
          minLength={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your gig (minimum 10 characters)"
          required
          minLength={10}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={handlePriceChange}
            placeholder="Enter price"
            required
            min={1}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="durationDays">Delivery Time (days)</Label>
          <Input
            id="durationDays"
            type="number"
            value={formData.durationDays}
            onChange={handleDurationChange}
            placeholder="Enter delivery time in days"
            required
            min={1}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          type="url"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="Enter image URL"
          required
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : initialData?.id ? "Update Gig" : "Create Gig"}
      </Button>
    </form>
  );
} 