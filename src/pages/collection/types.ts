export type TimelineItemType = "post" | "photo";

export type TimelineItem = {
  title: string;
  description: string;
  slug: string;
  date: string;
  content?: string;
  type: TimelineItemType;
  source?: string;
} & (
  | {
      type: "photo";
      source: string;
    }
  | {
      type: "post";
      source?: never;
    }
);
