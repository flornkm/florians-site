export interface Photo {
  src: string;
  alt: string;
}

// Order determines the grid flow.
export const PHOTOS: Photo[] = [
  { src: "/images/kruemel/puppy.webp", alt: "Krümel as a puppy, lying on a red blanket" },
  { src: "/images/kruemel/garden-walk.webp", alt: "Krümel trotting across the lawn" },
  { src: "/images/kruemel/resting.webp", alt: "Krümel resting his head on the floor" },
  { src: "/images/kruemel/garden-sit.webp", alt: "Krümel sitting in the garden with his rope toy" },
];
