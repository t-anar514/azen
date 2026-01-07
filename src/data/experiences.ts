export interface Experience {
  id: string;
  title: string;
  category: string;
  location: string;
  locationName: string;
  basePrice: number;
  heroImage: string;
  gallery: string[];
  duration: string;
  maxGroupSize: number;
  languages: string[];
  meetingPoint: {
    lat: number;
    lng: number;
    name: string;
    description: string;
  };
  description: string[];
  includes: string[];
  toBring: string[];
  guide: {
    name: string;
    bio: string;
    image: string;
    isVerified: boolean;
  };
}

export const EXPERIENCES: Experience[] = [
  {
    id: "shibuya-bars",
    title: "Hidden Shibuya Bars",
    category: "Nightlife",
    location: "Shibuya, Tokyo",
    locationName: "Shibuya Underground",
    basePrice: 5000,
    heroImage: "https://images.unsplash.com/photo-1554797589-7241bb691973?q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1554797589-7241bb691973",
      "https://images.unsplash.com/photo-1563191911-e65f8655ebf9",
      "https://images.unsplash.com/photo-1574096079513-d8259312b785"
    ],
    duration: "3.5 hrs",
    maxGroupSize: 6,
    languages: ["English", "Japanese"],
    meetingPoint: {
      lat: 35.6580,
      lng: 139.7016,
      name: "Hachiko Statue",
      description: ""
    },
    description: [],
    includes: [],
    toBring: [],
    guide: {
      name: "Kenji",
      bio: "",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kenji",
      isVerified: true
    }
  },
  {
    id: "akihabara-tech",
    title: "Akihabara Tech Tour",
    category: "Geek",
    location: "Akihabara, Tokyo",
    locationName: "Electric Town",
    basePrice: 2000,
    heroImage: "https://i.pinimg.com/736x/7d/d9/a3/7dd9a3e1e18274b783bf17f6df5566eb.jpg",
    gallery: [
      "https://i.pinimg.com/736x/76/a4/d5/76a4d55df936a8cb469e92d9b3ec54f9.jpg",
      "https://i.pinimg.com/736x/28/25/27/2825278f8b4c4ae06c68c4358ed145d7.jpg",
      "https://i.pinimg.com/1200x/12/b2/df/12b2df0d17bc46c9c0041bd3ca2f5d71.jpg"
    ],
    duration: "2 hrs",
    maxGroupSize: 10,
    languages: ["English"],
    meetingPoint: {
      lat: 35.6984,
      lng: 139.7711,
      name: "Akihabara Station",
      description: ""
    },
    description: [],
    includes: [],
    toBring: [],
    guide: {
      name: "Sarah",
      bio: "",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      isVerified: true
    }
  },
  {
    id: "kyoto-tea",
    title: "Kyoto Tea Ceremony",
    category: "Cultural",
    location: "Higashiyama, Kyoto",
    locationName: "Gion District",
    basePrice: 4500,
    heroImage: "https://images.unsplash.com/photo-1576085898323-21811073b743?q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1576085898323-21811073b743",
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
      "https://images.unsplash.com/photo-1470737603524-8694a0773017"
    ],
    duration: "1.5 hrs",
    maxGroupSize: 4,
    languages: ["English", "Japanese"],
    meetingPoint: {
      lat: 34.9948,
      lng: 135.7850,
      name: "Higashiyama Station",
      description: ""
    },
    description: [],
    includes: [],
    toBring: [],
    guide: {
      name: "Yuki",
      bio: "",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki",
      isVerified: true
    }
  }
];
