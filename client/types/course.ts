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

export interface LmsQuestionOption {
  text: string;
  isCorrect?: boolean;
  matchTo?: string;
}

export interface LmsQuestion {
  _id?: string;
  questionType: string;
  question: string;
  points?: number;
  options?: LmsQuestionOption[];
  correctAnswer?: string;
  explanation?: string;
  order?: number;
}

export interface LmsSubmission {
  _id?: string;
  user: string;
  session?: string;
  answers?: any;
  score?: number;
  timeSpent?: number;
  submittedAt?: string;
}

export interface LmsTask {
  _id?: string;
  title: string;
  description?: string;
  type?: string;
  dueDate?: string;
  points?: number;
  status?: string;
  sessionId?: string;
  questions?: LmsQuestion[];
  submissions?: LmsSubmission[];
  order?: number;
}

export interface LmsSessionResource {
  title?: string;
  url?: string;
  type?: string;
}

export interface LmsSession {
  _id: string;
  name: string;
  description?: string;
  duration?: number;
  content?: string;
  videoUrl?: string;
  zoomMeetingLink?: string;
  resources?: LmsSessionResource[];
  tasks?: LmsTask[];
  isActive?: boolean;
  order?: number;
}

export interface LmsSprint {
  _id: string;
  name: string;
  description?: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  durationInDays?: number;
  whatsappGroupLink?: string;
  isActive?: boolean;
  sessions?: LmsSession[];
  order?: number;
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
  sprints?: LmsSprint[];
  skills?: string[];
  prerequisites?: string[];
  whatYouWillLearn?: string[];
  highlights?: string[];
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
