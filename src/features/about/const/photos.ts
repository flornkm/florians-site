export interface Photo {
  src: string;
  caption: string;
}

// Order determines the masonry layout flow.
export const PHOTOS: Photo[] = [
  { src: "/images/about/nyc-buildings.webp", caption: "New York, USA" },
  { src: "/images/about/denmark-house.webp", caption: "Cold Hawaii, Denmark" },
  { src: "/images/about/amsterdam-bikes.webp", caption: "Amsterdam, The Netherlands" },
  { src: "/images/about/office.webp", caption: "Dubai, UAE" },
  { src: "/images/about/nyc-buildings-2.webp", caption: "New York, USA" },
  { src: "/images/about/bali-fish.webp", caption: "Bali, Indonesia" },
  { src: "/images/about/denmark-house-2.webp", caption: "Cold Hawaii, Denmark" },
  { src: "/images/about/phuket-ocean.webp", caption: "Phuket, Thailand" },
  { src: "/images/about/living-room.webp", caption: "Dubai, UAE" },
  { src: "/images/about/amsterdam-toilet.webp", caption: "Amsterdam, The Netherlands" },
];
