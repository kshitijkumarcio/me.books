import { images } from "@/constants";
import type { StaticImageData } from "next/image";

export type PositionValue = string | number;

export interface ElementPosition {
  top?: PositionValue;
  right?: PositionValue;
  bottom?: PositionValue;
  left?: PositionValue;
  width?: PositionValue;
  height?: PositionValue;
  zIndex?: number;
  rotation?: string; // e.g. "-rotate-1", "rotate-2"
}

export interface BaseLayoutElement extends ElementPosition {
  id?: string;
  className?: string;
}

// Book format types (affects cover dimensions and styling)
export type BookFormat = "standard" | "little-penguin-classic";

export const COVER_FORMAT_SIZES: Record<BookFormat, string> = {
  standard: "w-32 md:w-46",
  "little-penguin-classic": "w-24 md:w-32",
};

export interface CoverLayoutElement extends BaseLayoutElement {
  type: "cover";
  src?: StaticImageData | string;
  alt?: string;
  widthClass?: string;
  format?: BookFormat;
}

export interface QuoteLayoutElement extends BaseLayoutElement {
  type: "quote";
  quote: string;
  author?: string;
  paperColor?: string;
  paperSeed?: number;
  tearStrength?: number;
  maxWidthClass?: string;
}

export interface ImageLayoutElement extends BaseLayoutElement {
  type: "image";
  src: StaticImageData | string;
  alt?: string;
  widthClass?: string;
}

export interface CodeLayoutElement extends BaseLayoutElement {
  type: "code";
  code: string;
  language?: string;
  filename?: string;
}

export interface TagLayoutElement extends BaseLayoutElement {
  type: "tag";
  text: string;
  color?: string;
}

export interface CustomLayoutElement extends BaseLayoutElement {
  type: "custom";
  content?: React.ReactNode;
}

export type BlockLayoutElement =
  | CoverLayoutElement
  | QuoteLayoutElement
  | ImageLayoutElement
  | CodeLayoutElement
  | TagLayoutElement
  | CustomLayoutElement;

export type BookStatus = "reading" | "read" | "wishlist";

export interface BaseBookItem {
  id: string;
  title: string;
  author: string;
  coverImage: StaticImageData;
  genre: string;
  status: BookStatus;
  format: BookFormat;
  layout?: BlockLayoutElement[];
}

export interface CurrentlyReadingBook extends BaseBookItem {
  status: "reading";
  progress: number;
  total_pages: number;
  rating: number;
  note: string;
}

export interface ReadBook extends BaseBookItem {
  status: "read";
  rating: number;
  yearRead: number;
}

export interface WishlistBook extends BaseBookItem {
  status: "wishlist";
  priority: "high" | "normal" | "low";
}

export type BookItem = CurrentlyReadingBook | ReadBook | WishlistBook;

export const currentReads: CurrentlyReadingBook[] = [
  {
    id: "cr-01",
    title: "The Kind Worth Killing",
    author: "Peter Swanson",
    coverImage: images.TheKindWorthKilling,
    progress: 96,
    total_pages: 311,
    rating: 5,
    genre: "Fiction / Classic",
    status: "reading",
    format: "standard",
    note: "Page 84 / 135 — savoring every paragraph",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote:
          "“Ah, those days... for many years afterwards their happiness haunted me.”",
        paperColor: "#FFF27B",
        paperSeed: 42,
        tearStrength: 7,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "cr-02",
    title: "Discipline is Destiny",
    author: "Ryan Holiday",
    coverImage: images.DisciplineIsDestiny,
    progress: 24,
    total_pages: 312,
    rating: 4,
    genre: "Philosophy",
    status: "reading",
    format: "standard",
    note: "Morning reading routine",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote:
          "“To conquer oneself is a greater victory than to conquer thousands in a battle.”",
        paperColor: "#EBF3FF",
        paperSeed: 88,
        tearStrength: 6,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "cr-03",
    title: "Heart Lamps",
    author: "Banu Mushtaq",
    coverImage: images.HeartLamps,
    progress: 25,
    total_pages: 224,
    rating: 5,
    genre: "Fantasy",
    status: "reading",
    format: "standard",
    note: "Chapter 12",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote:
          "“Knowledge has never saved the world. Only what we choose to do with it.”",
        paperColor: "#FFE7E7",
        paperSeed: 19,
        tearStrength: 8,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "cr-04",
    title: "White Nights",
    author: "Fyodor Dostoevsky",
    coverImage: images.WhiteNights,
    progress: 45,
    total_pages: 112,
    rating: 5,
    genre: "Classic / Fiction",
    status: "reading",
    format: "standard",
    note: "Sentimental Petersburg nights",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“A whole moment of happiness! Why, isn't that enormous for the whole of a human life?”",
        paperColor: "#FFF8E1",
        paperSeed: 53,
        tearStrength: 7,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "cr-05",
    title: "25 सर्बश्रेष्ठ कहानियां",
    author: "Saadat Hasan Manto",
    coverImage: images.Manto,
    progress: 12,
    total_pages: 240,
    rating: 5,
    genre: "Essays / Poetry",
    status: "reading",
    format: "standard",
    note: "Stories that confront truth",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“The only journey is the one within.”",
        paperColor: "#FBF3DE",
        paperSeed: 77,
        tearStrength: 8,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "cr-06",
    title: "Poor Charlie's Almanack",
    author: "Charles Munger",
    coverImage: images.PoorCharliesAlmanack,
    progress: 66,
    total_pages: 384,
    rating: 5,
    genre: "Design",
    status: "reading",
    format: "standard",
    note: "Mental models deep dive",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“Design is intelligence made visible.”",
        paperColor: "#E8F5E9",
        paperSeed: 33,
        tearStrength: 6,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "cr-07",
    title: "Only Dull People Are Brilliant At Breakfast",
    author: "Oscar Wilde",
    coverImage: images.OnlyDullPeople,
    progress: 28,
    total_pages: 60,
    rating: 4,
    genre: "Culture",
    status: "reading",
    format: "little-penguin-classic",
    note: "Short witty aphorisms",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-24 md:w-32",
        format: "little-penguin-classic",
        zIndex: 10,
      },
      {
        type: "quote",
        quote:
          "“The spirit of entrepreneurship thrives in the narrowest lanes.”",
        paperColor: "#FFF3E0",
        paperSeed: 91,
        tearStrength: 7,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "cr-08",
    title: "The Ocean Would Paint Me Blue",
    author: "Zoulfa Katouh",
    coverImage: images.TheOceanWouldPaintMeBlue,
    progress: 15,
    total_pages: 368,
    rating: 5,
    genre: "Branding",
    status: "reading",
    format: "standard",
    note: "Chapter 3",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“Branding is about making emotional connections.”",
        paperColor: "#EDE7F6",
        paperSeed: 64,
        tearStrength: 7,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
];

export const BooksRead: ReadBook[] = [
  {
    id: "r01",
    status: "read",
    title: "Letters to a Young Poet",
    author: "Rainer Maria Rilke",
    coverImage: images.LettersToAYoungPoet,
    rating: 5,
    yearRead: 2024,
    genre: "Essays / Poetry",
    format: "little-penguin-classic",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote:
          "“Be patient toward all that is unsolved in your heart and try to love the questions themselves.”",
        paperColor: "#FBF3DE",
        paperSeed: 101,
        tearStrength: 8,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "r02",
    status: "read",
    title: "Animal Farm",
    author: "George Orwell",
    coverImage: images.AnimalFarm,
    rating: 5,
    yearRead: 2023,
    genre: "Classic / Political Satire",
    format: "standard",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“All animals are equal, but some animals are more equal than others.”",
        paperColor: "#F4F6F0",
        paperSeed: 44,
        tearStrength: 7,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "r03",
    status: "read",
    title: "As Long as the Lemon Trees Grow",
    author: "Zoulfa Katouh",
    coverImage: images.AsLongAsTheLemonTreesGrow,
    rating: 5,
    yearRead: 2024,
    genre: "YA Fiction / Contemporary",
    format: "standard",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“Every lemon has a story. Every tree has a soul.”",
        paperColor: "#FFFBEA",
        paperSeed: 55,
        tearStrength: 6,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "r04",
    status: "read",
    title: "A Month In The Country",
    author: "J.L. Carr",
    coverImage: images.AMonthInTheCountry,
    rating: 5,
    yearRead: 2024,
    genre: "Biographical / Mental Models",
    format: "standard",
    layout: [
      {
        type: "cover",
        src: images.AMonthInTheCountry,
        top: "top-cell-1",
        left: "left-cell-3",
        alt: "A Month In the Country",
      },
      {
        type: "quote",
        paperColor: "#FFF27B",
        paperSeed: 64,
        tearStrength: 6,
        quote:
          "“Ah, those days... for many years afterwards their happiness haunted me.”",
        top: "top-cell-5.5",
        left: "left-cell-0.5",
        maxWidthClass: "w-76",
      },
      {
        type: "image",
        top: "top-cell-3.75",
        left: "left-cell-6",
        src: images.AMITC1,
        widthClass: "w-24",
        alt: "yellow-roses",
      },
      {
        type: "image",
        top: "top-cell-5.75",
        left: "left-cell-5.25",
        src: images.AMITC2,
        widthClass: "w-40",
        alt: "flim-image",
      },
      {
        type: "image",
        top: "top-cell-3.25",
        left: "left-cell-0.75",
        src: images.AMITC3,
        widthClass: "w-34",
        alt: "countryside",
      },
    ],
  },
  {
    id: "r05",
    status: "read",
    title: "Beach Read",
    author: "Emily Henry",
    coverImage: images.BeachRead,
    rating: 4,
    yearRead: 2023,
    genre: "Romance / Contemporary",
    format: "standard",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“Happy endings don't happen to everyone. They happen to people who fight for them.”",
        paperColor: "#EBF3FF",
        paperSeed: 38,
        tearStrength: 7,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "r06",
    status: "read",
    title: "Blood Over Bright Haven",
    author: "M.L. Wang",
    coverImage: images.BloodOverBrightHaven,
    rating: 5,
    yearRead: 2024,
    genre: "Dark Fantasy / Dark Academia",
    format: "standard",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“Truth doesn't mind being questioned. A lie could not survive it.”",
        paperColor: "#FFE7E7",
        paperSeed: 92,
        tearStrength: 8,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "r07",
    status: "read",
    title: "Brief Answers to the Big Questions",
    author: "Stephen Hawking",
    coverImage: images.BriefAnswersToBigQuestions,
    rating: 5,
    yearRead: 2023,
    genre: "Science / Physics",
    format: "standard",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“Remember to look up at the stars and not down at your feet.”",
        paperColor: "#E0F2FE",
        paperSeed: 21,
        tearStrength: 6,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "r08",
    status: "read",
    title: "Project Hail Mary",
    author: "Andy Weir",
    coverImage: images.ProjectHailMary,
    rating: 5,
    yearRead: 2024,
    genre: "Sci-Fi",
    format: "standard",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote:
          "“Human beings have a remarkable ability to accept the abnormal and make it normal.”",
        paperColor: "#F4EBFF",
        paperSeed: 82,
        tearStrength: 7,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "r09",
    status: "read",
    title: "Captains Courageous",
    author: "Rudyard Kipling",
    coverImage: images.CaptainsCourageous,
    rating: 4,
    yearRead: 2022,
    genre: "Adventure / Classic",
    format: "standard",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“There is no luck in this world. It is work and patience.”",
        paperColor: "#FEF3C7",
        paperSeed: 63,
        tearStrength: 7,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "r10",
    status: "read",
    title: "Circe",
    author: "Madeline Miller",
    coverImage: images.Circe,
    rating: 5,
    yearRead: 2024,
    genre: "Mythological Fiction / Fantasy",
    format: "standard",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“I will not be like a bird bred in a cage, I thought, too dull to fly.”",
        paperColor: "#FCE7F3",
        paperSeed: 74,
        tearStrength: 7,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "r11",
    status: "read",
    title: "Red Rising",
    author: "Pierce Brown",
    coverImage: images.RedRising,
    rating: 5,
    yearRead: 2023,
    genre: "Sci-Fi / Dystopian",
    format: "standard",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“Live for more.”",
        paperColor: "#FEE2E2",
        paperSeed: 15,
        tearStrength: 8,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "r12",
    status: "read",
    title: "Golden Son",
    author: "Pierce Brown",
    coverImage: images.GoldenSon,
    rating: 5,
    yearRead: 2023,
    genre: "Sci-Fi / Space Opera",
    format: "standard",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“Man cannot free himself by the means that enslaved him.”",
        paperColor: "#FEF9C3",
        paperSeed: 86,
        tearStrength: 7,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "r13",
    status: "read",
    title: "Morning Star",
    author: "Pierce Brown",
    coverImage: images.MorningStar,
    rating: 5,
    yearRead: 2023,
    genre: "Sci-Fi / Space Opera",
    format: "standard",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“Break the chains.”",
        paperColor: "#EDE9FE",
        paperSeed: 93,
        tearStrength: 7,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "r14",
    status: "read",
    title: "Iron Gold",
    author: "Pierce Brown",
    coverImage: images.IronGold,
    rating: 5,
    yearRead: 2024,
    genre: "Sci-Fi / Space Opera",
    format: "standard",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“All that we have is that shout into the wind—how we live.”",
        paperColor: "#F3F4F6",
        paperSeed: 34,
        tearStrength: 7,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "r15",
    status: "read",
    title: "Dark Age",
    author: "Pierce Brown",
    coverImage: images.DarkAge,
    rating: 5,
    yearRead: 2024,
    genre: "Sci-Fi / Space Opera",
    format: "standard",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“We are what we are because we survived.”",
        paperColor: "#E5E7EB",
        paperSeed: 57,
        tearStrength: 8,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "r16",
    status: "read",
    title: "Light Bringer",
    author: "Pierce Brown",
    coverImage: images.LightBringer,
    rating: 5,
    yearRead: 2024,
    genre: "Sci-Fi / Space Opera",
    format: "standard",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“Clang. Clang. Clang. Confess.”",
        paperColor: "#FEF3C7",
        paperSeed: 68,
        tearStrength: 7,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "r17",
    status: "read",
    title: "Fourth Wing",
    author: "Rebecca Yarros",
    coverImage: images.FourthWing,
    rating: 5,
    yearRead: 2024,
    genre: "Fantasy / Romance",
    format: "standard",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“A dragon without its rider is a tragedy. A rider without their dragon is dead.”",
        paperColor: "#FCE4EC",
        paperSeed: 79,
        tearStrength: 7,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "r18",
    status: "read",
    title: "Iron Flame",
    author: "Rebecca Yarros",
    coverImage: images.IronFlame,
    rating: 4,
    yearRead: 2024,
    genre: "Fantasy / Romance",
    format: "standard",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“You want to love me? You have to trust me.”",
        paperColor: "#FFEDD5",
        paperSeed: 41,
        tearStrength: 7,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "r19",
    status: "read",
    title: "Looking for Alaska",
    author: "John Green",
    coverImage: images.LookingForAlaska,
    rating: 5,
    yearRead: 2022,
    genre: "YA Fiction / Coming-of-Age",
    format: "standard",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“I go to seek a Great Perhaps.”",
        paperColor: "#ECFDF5",
        paperSeed: 83,
        tearStrength: 6,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "r20",
    status: "read",
    title: "Man's Search for Meaning",
    author: "Viktor E. Frankl",
    coverImage: images.MansSearchForMeaning,
    rating: 5,
    yearRead: 2023,
    genre: "Psychology / Memoir",
    format: "standard",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“Those who have a 'why' to live, can bear with almost any 'how'.”",
        paperColor: "#F1F5F9",
        paperSeed: 29,
        tearStrength: 7,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "r21",
    status: "read",
    title: "Never Logged Out",
    author: "Ramanjit Singh",
    coverImage: images.NeverLoggedOut,
    rating: 4,
    yearRead: 2024,
    genre: "Essays / Technology",
    format: "standard",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“The silence between notifications is where life really happens.”",
        paperColor: "#F8FAFC",
        paperSeed: 50,
        tearStrength: 6,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "r22",
    status: "read",
    title: "The Old Man and the Sea",
    author: "Ernest Hemingway",
    coverImage: images.OldManAndTheSea,
    rating: 5,
    yearRead: 2023,
    genre: "Classic / Literary Fiction",
    format: "little-penguin-classic",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-24 md:w-32",
        format: "little-penguin-classic",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“Man is not made for defeat. A man can be destroyed but not defeated.”",
        paperColor: "#E0F2FE",
        paperSeed: 62,
        tearStrength: 7,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "r23",
    status: "read",
    title: "Poor Little Rich Slum",
    author: "Rashmi Bansal & Deepak Gandhi",
    coverImage: images.PoorLittleRichSlum,
    rating: 4,
    yearRead: 2023,
    genre: "Business / Inspiration",
    format: "standard",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“The spirit of entrepreneurship thrives in the narrowest lanes.”",
        paperColor: "#FFF3E0",
        paperSeed: 91,
        tearStrength: 7,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "r24",
    status: "read",
    title: "The Best Laid Plans",
    author: "Sidney Sheldon",
    coverImage: images.TheBestLaidPlans,
    rating: 4,
    yearRead: 2022,
    genre: "Thriller / Fiction",
    format: "standard",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“Passionate ambition can conquer almost anything.”",
        paperColor: "#FEE2E2",
        paperSeed: 73,
        tearStrength: 7,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "r25",
    status: "read",
    title: "The Cruel Prince",
    author: "Holly Black",
    coverImage: images.TheCruelPrince,
    rating: 5,
    yearRead: 2024,
    genre: "YA Fantasy",
    format: "standard",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“If I cannot be better than them, I will become so much worse.”",
        paperColor: "#EDE7F6",
        paperSeed: 84,
        tearStrength: 8,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "r26",
    status: "read",
    title: "The Last Tree on Easter Island",
    author: "Jared Diamond",
    coverImage: images.TheLastTreeOnEasterIsland,
    rating: 4,
    yearRead: 2023,
    genre: "History / Environment",
    format: "standard",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-32 md:w-42",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“What were they thinking when they cut down the last palm tree?”",
        paperColor: "#E8F5E9",
        paperSeed: 95,
        tearStrength: 7,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
  {
    id: "r27",
    status: "read",
    title: "We Should All Be Feminists",
    author: "Chimamanda Ngozi Adichie",
    coverImage: images.WeShouldAllBeFeminists,
    rating: 5,
    yearRead: 2023,
    genre: "Essays / Non-Fiction",
    format: "little-penguin-classic",
    layout: [
      {
        type: "cover",
        top: "top-cell-0.5",
        left: "left-cell-0.5",
        rotation: "rotate-0",
        widthClass: "w-24 md:w-32",
        format: "little-penguin-classic",
        zIndex: 10,
      },
      {
        type: "quote",
        quote: "“Culture does not make people. People make culture.”",
        paperColor: "#FEF2F2",
        paperSeed: 36,
        tearStrength: 7,
        bottom: "bottom-cell-0.5",
        right: "right-cell-0.5",
        rotation: "rotate-0",
        zIndex: 20,
      },
    ],
  },
];

export const wishlistBooks: WishlistBook[] = [];

export const allBooks: BookItem[] = [
  ...wishlistBooks,
  ...currentReads,
  ...BooksRead,
];
