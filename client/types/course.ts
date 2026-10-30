export interface CourseCategory {
  _id: string;
  name: string;
}

export interface CurriculumTopic {
  week?: number;
  title: string;
  description?: string;
  topics?: string[];
  duration?: string;
}

export interface Course {
  _id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  benefits?: string[];
  category?: CourseCategory;
  instructor?: string;
  price?: number;
  originalPrice?: number;
  isFree?: boolean;
  totalHours?: number;
  image?: string;
  thumbnail?: string;
  previewVideo?: string;
  duration?: string;
  level?: string;
  curriculum?: CurriculumTopic[];
  skills?: string[];
  prerequisites?: string[];
  whatYouWillLearn?: string[];
  isPublished: boolean;
  status?: string;
  isActive?: boolean;
  isEnrolled?: boolean;
  enrollmentStatus?: string;
  enrolledAt?: string;
  progress?: number;
  showOnHome?: boolean;
  enrollmentCount?: number;
  slug?: string;
  language?: string;
  certificateIncluded?: boolean;
  totalStudents?: number;
  averageRating?: number;
  totalReviews?: number;
  createdAt?: string;
  updatedAt?: string;
}
