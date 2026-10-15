export const APP_NAME = "GB STUDY";
export const APP_TAGLINE = "Free Batches, Lectures & Notes";
export const APP_ICON = "https://i.ibb.co/0R7qc34v/1093.jpg";
export const TELEGRAM_URL = "https://t.me/GBFreestudy";
export const TELEGRAM_HANDLE = "@GBFreestudy";
export const WHATSAPP_URL = "https://www.whatsapp.com/channel/0029VbE9qxbLdQel3z7cMd1W";

export interface CategoryInfo {
  id: string | number;
  name: string;
  badge: string;
  icon: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: "all", name: "All Batches", badge: "1100+", icon: "Sparkles" },
  { id: "foundation", name: "Foundation Batches", badge: "Khan Sir", icon: "GraduationCap" },
  { id: "upsc_bpsc", name: "UPSC & BPSC / PCS", badge: "Civil Services", icon: "Landmark" },
  { id: "ssc_railway", name: "SSC & Railway", badge: "Govt Exams", icon: "Train" },
  { id: "police_defence", name: "Police & Defence", badge: "SI / NDA", icon: "Shield" },
  { id: "teaching", name: "Teaching & TGT/PGT", badge: "CTET / STET", icon: "BookOpen" },
  { id: "banking", name: "Banking & CLAT", badge: "Finance / Law", icon: "Briefcase" },
  { id: "tech", name: "Tech & Masterclasses", badge: "Skills", icon: "Cpu" },
];
