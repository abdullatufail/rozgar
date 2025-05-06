import { Navbar } from "@/components/common/Navbar";

export default function FreelancerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <><Navbar/>{children}</>;
} 