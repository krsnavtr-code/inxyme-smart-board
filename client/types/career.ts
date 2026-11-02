export interface StudentReferralDetail {
  student: string | { _id: string; fullname?: string; name?: string; email?: string };
  batch?: string | { _id: string; name?: string; code?: string };
  status: "Referred" | "Applied" | "Shortlisted" | "Interview Scheduled" | "Offer Received" | "Not Selected";
  referredAt?: string;
  notes?: string;
  interviewDate?: string;
}

export interface JobOpportunity {
  _id: string;
  title: string;
  companyName?: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  location: string;
  jobType: "Full-time" | "Part-time" | "Contract" | "Internship" | "Freelance";
  salary?: string;
  courseId?: { _id: string; title: string; description?: string } | string;
  status: "Open" | "Closed" | "Draft";
  applicationDeadline: string;
  referralStatus?: "Referred" | "Applied" | "Shortlisted" | "Interview Scheduled" | "Offer Received" | "Not Selected";
  referredAt?: string;
  referralNotes?: string;
  interviewDate?: string;
  batchName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CareerServicesData {
  referredJobs: JobOpportunity[];
  otherOpenJobs: JobOpportunity[];
  stats: {
    totalReferred: number;
    shortlistedCount: number;
    interviewCount: number;
    selectedCount: number;
  };
}

