export type WritingItemType = "post" | "photo" | "insight" | "experiment" | "project";

export type WritingItem = {
  title: string;
  description: string;
  slug: string;
  date: string;
  content?: string;
  type: WritingItemType;
  source?: string;
};
