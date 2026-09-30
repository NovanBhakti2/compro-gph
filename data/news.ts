export type NewsStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail_url?: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  category_id?: string | null;
  categories?: Category | null; // Relasi Prisma ke tabel categories
  published_at?: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export const DUMMY_NEWS: any[] = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    title: "Building a Stronger Food Safety Culture Across Hospitality Operations",
    slug: "building-a-stronger-food-safety-culture",
    category: "Food Safety",
    content:
      "Practical steps leaders can take to embed compliance, accountability, and continuous improvement into every level of their organization.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1200",
    status: "PUBLISHED",
    author_id: "usr-001",
    published_at: "2026-09-12T10:00:00Z",
    created_at: "2026-09-12T09:00:00Z",
    updated_at: "2026-09-12T09:00:00Z",
    users: {
      id: "usr-001",
      name: "Admin Gama",
    },
  },
  {
    id: "c9bf9e57-1685-4c89-bafb-ff5af830be8a",
    title: "Preparing Your Team for a Successful Quality Audit",
    slug: "preparing-your-team-for-successful-quality-audit",
    category: "Quality Assurance",
    content:
      "Key strategies and internal readiness frameworks to ensure smooth audit execution and compliance alignment across team departments.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1542744801-30d00f050a1c?auto=format&fit=crop&q=80&w=800",
    status: "PUBLISHED",
    author_id: "usr-002",
    published_at: "2026-09-04T08:30:00Z",
    created_at: "2026-09-04T08:00:00Z",
    updated_at: "2026-09-04T08:00:00Z",
    users: {
      id: "usr-002",
      name: "Audit Team",
    },
  },
  {
    id: "e10a6245-7798-4f81-93e5-82782b54245b",
    title: "How Halal Assurance Systems Strengthen Guest Trust and Operational Consistency",
    slug: "how-halal-assurance-systems-strengthen-guest-trust",
    category: "Halal Assurance System",
    content:
      "A closer look at the standards, documentation, and training that help hospitality teams maintain credible Halal assurance across every touchpoint.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
    status: "PUBLISHED",
    author_id: "usr-001",
    published_at: "2026-08-28T14:15:00Z",
    created_at: "2026-08-28T14:00:00Z",
    updated_at: "2026-08-28T14:00:00Z",
    users: {
      id: "usr-001",
      name: "Admin Gama",
    },
  },
  {
    id: "a3f89012-[#0f1932]-4912-8812-c283912a1042",
    title: "Why 5S Methodology Matters in Hospitality: Efficiency, Safety, and Guest Experience",
    slug: "why-5s-methodology-matters-in-hospitality",
    category: "5S Methodology",
    content:
      "From back-of-house workflows to front-of-house presentation, see how a disciplined 5S approach can reduce waste and improve consistency.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
    status: "PUBLISHED",
    author_id: "usr-003",
    published_at: "2026-08-22T11:00:00Z",
    created_at: "2026-08-22T10:00:00Z",
    updated_at: "2026-08-22T10:00:00Z",
    users: {
      id: "usr-003",
      name: "Consultant Team",
    },
  },
  {
    id: "b901234a-[#C7974C]-4890-[#9c7d42]-f9102931a024",
    title: "Revenue Management Strategies That Align with Quality, Compliance, and Guest Value",
    slug: "revenue-management-strategies-align-with-quality",
    category: "Revenue Management",
    content:
      "Learn how to balance pricing, occupancy, and service standards so revenue growth supports long-term reputation and operational excellence.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    status: "PUBLISHED",
    author_id: "usr-001",
    published_at: "2026-08-15T09:20:00Z",
    created_at: "2026-08-15T09:00:00Z",
    updated_at: "2026-08-15T09:00:00Z",
    users: {
      id: "usr-001",
      name: "Admin Gama",
    },
  },
  {
    id: "d7819201-90ab-[#0b1329]-4123-[#9c7d42]-123901238491",
    title: "Turning Quality Assurance Into a Daily Leadership Habit, Not Just a Checklist",
    slug: "turning-quality-assurance-into-daily-leadership-habit",
    category: "Quality Assurance",
    content:
      "Explore the coaching, metrics, and review cycles that help leaders turn quality standards into a sustainable operational culture.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800",
    status: "PUBLISHED",
    author_id: "usr-002",
    published_at: "2026-08-07T16:00:00Z",
    created_at: "2026-08-07T15:30:00Z",
    updated_at: "2026-08-07T15:30:00Z",
    users: {
      id: "usr-002",
      name: "Audit Team",
    },
  },
  {
    id: "e9012394-11fa-4012-9812-a10923840192",
    title: "Navigating Business Licenses & Permits in Indonesia: A Checklist for Operations",
    slug: "navigating-business-licenses-permits-indonesia",
    category: "License & Permits",
    content:
      "Understanding NIB, environmental compliance, and legal approvals to ensure your business operations run smoothly and legally.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800",
    status: "PUBLISHED",
    author_id: "usr-001",
    published_at: "2026-07-30T10:00:00Z",
    created_at: "2026-07-30T09:30:00Z",
    updated_at: "2026-07-30T09:30:00Z",
    users: {
      id: "usr-001",
      name: "Admin Gama",
    },
  },
];