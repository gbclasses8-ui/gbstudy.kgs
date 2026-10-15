export interface Batch {
  id: number;
  title: string;
  category_id: number;
  start_at: string;
  end_at: string;
  image_large: string;
  image_thumb: string;
}

export interface ClassroomTopic {
  id: number;
  name: string;
  videos: number;
  notes: number;
  dpp?: number;
  wmts?: number;
  subjectives?: number;
  order_by?: string;
  order_type?: string;
  is_feedback?: number;
}

export interface LectureVideo {
  id: number;
  name: string;
  lesson_id: number;
  thumb?: string;
  published_at?: string;
  type?: string;
  video_url?: string;
  duration?: number;
  is_demo?: number;
  is_free?: number;
}

export interface StudyNote {
  id: number;
  name: string;
  lesson_id: number;
  thumb?: string;
  published_at?: string;
  type?: string;
  duration?: number;
}

export interface LessonData {
  id: number;
  name: string;
  videos: LectureVideo[];
  notes: StudyNote[];
}

export interface VideoDetail {
  video_url?: string;
  hd_video_url?: string;
  pdfs?: Array<{ url: string; title: string }> | null;
}
