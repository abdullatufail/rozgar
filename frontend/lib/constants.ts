import { Gig } from "../services/gigs";

export const sampleGigs: Gig[] = [
  {
    id: 1,
    title: "Professional Logo Design",
    description:
      "I will create a unique and professional logo design for your business that will help you stand out from the competition.",
    price: 99,
    category: "Graphics & Design",
    image: "/images/logo-design.jpg",
    freelancerId: 1,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    freelancer: {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
    },
  },
  {
    id: 2,
    title: "Website Development",
    description:
      "I will build a responsive and modern website using the latest technologies to help you establish your online presence.",
    price: 299,
    category: "Web Development",
    image: "/images/web-development.jpg",
    freelancerId: 2,
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
    freelancer: {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
    },
  },
  {
    id: 3,
    title: "Content Writing",
    description:
      "I will write engaging and SEO-friendly content for your website, blog, or social media to attract more visitors.",
    price: 49,
    category: "Writing & Translation",
    image: "/images/content-writing.jpg",
    freelancerId: 3,
    createdAt: "2024-01-03T00:00:00.000Z",
    updatedAt: "2024-01-03T00:00:00.000Z",
    freelancer: {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
    },
  },
]; 