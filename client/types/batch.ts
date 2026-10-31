export interface BatchStudent {
  _id: string;
  fullname?: string;
  name?: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: string;
  isActive?: boolean;
}

export interface BatchTeacher {
  _id: string;
  fullname?: string;
  name?: string;
  email: string;
  avatar?: string;
  role?: string;
  department?: string;
  phone?: string;
}

export interface BatchCourse {
  _id: string;
  title: string;
  slug?: string;
  thumbnail?: string;
  image?: string;
  description?: string;
  category?: any;
  level?: string;
  duration?: string;
}

export interface BatchSchedule {
  days?: string[];
  timeSlot?: string;
  startTime?: string;
  endTime?: string;
}

export interface BatchLiveClass {
  platform?: string;
  meetingLink?: string;
  meetingId?: string;
  passcode?: string;
}

export interface Batch {
  _id: string;
  batchName?: string;
  name?: string;
  batchCode?: string;
  code?: string;
  course: BatchCourse | string;
  teacher: BatchTeacher | string;
  students: BatchStudent[];
  startDate: string;
  endDate: string;
  schedule?: BatchSchedule;
  maxCapacity?: number;
  currentEnrollment?: number;
  status: "scheduled" | "ongoing" | "completed" | "cancelled" | string;
  liveClass?: BatchLiveClass;
  whatsappGroupLink?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

