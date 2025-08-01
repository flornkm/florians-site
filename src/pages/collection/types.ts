export type CollectionItemType = "post" | "photo" | "insight" | "experim  ";

export type CollectionItem = {
  title: string;
  description: string;
  slug: string;
  date: string;
  content?: string;
  type: CollectionItemType;
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
  | {
      type: "insight";
      source?: never;
    }
  | {
      type: "experiment";
      source?: never;
    }
);
