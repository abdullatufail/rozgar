"use client";

import { useAuth } from "../../../../contexts/auth-context";
import { redirect } from "next/navigation";
import { GigForm } from "../../../../components/gigs/GigForm";

export default function CreateGigPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold">Create a New Gig</h1>
        <GigForm />
      </div>
    </div>
  );
} 