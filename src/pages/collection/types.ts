export type CollectionItemType = "post" | "photo" | "insight" | "experiment" | "project";

export type CollectionItem = {
  title: string;
  description: string;
  slug: string;
  date: string;
  content?: string;
  type: CollectionItemType;
  source?: string;
};
