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
      description: "Outside Shibuya Station, Hachiko Exit. Look for the guide with the Teal Azen flag."
    },
    description: [
      "Step away from the neon lights of the Scramble Crossing and into the narrow, smoke-filled alleys where Tokyo's salarymen relax. This tour takes you to three hand-picked 'izakayas' that don't have English menus and are rarely visited by tourists.",
      "Experience the authentic 'Showa' era vibe of Nonbei Yokocho (Drunkard's Alley) and learn the local etiquette of drinking and socializing in Japan's most vibrant district."
    ],
    includes: [
      "3 Signature Drinks",
      "Assorted Local Snacks (Yakitori/Edamame)",
      "Certified Local Guide",
      "Entry Fees"
    ],
    toBring: [
      "Passport for ID (if looking young)",
      "Cash for extra drinks",
      "Comfortable walking shoes"
    ],
    guide: {
      name: "Kenji",
      bio: "Local expert since 2015. Born and raised in Shibuya.",
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
    heroImage: "https://images.unsplash.com/photo-1582236240224-b3e949d0dd44?q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1582236240224-b3e949d0dd44",
      "https://images.unsplash.com/photo-1562113530-579e07ca3ff3",
      "https://images.unsplash.com/photo-1618336753974-aae8e04506aa"
    ],
    duration: "2 hrs",
    maxGroupSize: 10,
    languages: ["English"],
    meetingPoint: {
      lat: 35.6984,
      lng: 139.7711,
      name: "Akihabara Station",
      description: "Electric Town Gate. We meet in front of the Gundam Cafe."
    },
    description: [
      "Explore the multi-story electronics meccas and hidden back-alley component shops of Electric Town. From the latest robotics to retro gaming consoles, this tour is a deep dive into Tokyo's tech heritage.",
      "Learn about the evolution of Akihabara from a post-war black market to the world's leading hub for otaku culture and electronics."
    ],
    includes: [
      "Interactive Electronics Demo",
      "Retro Gaming Arcade Credits",
      "Custom Tech Guide"
    ],
    toBring: [
      "Fully charged camera",
      "Your inner geek"
    ],
    guide: {
      name: "Sarah",
      bio: "Tech journalist and Tokyo resident for 8 years.",
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
    heroImage: "https://images.unsplash.com/photo-1545060411-827fc516f849?q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1545060411-827fc516f849",
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
      "https://images.unsplash.com/photo-1512412086892-33d39f1124d0"
    ],
    duration: "1.5 hrs",
    maxGroupSize: 4,
    languages: ["English", "Japanese"],
    meetingPoint: {
      lat: 34.9948,
      lng: 135.7850,
      name: "Higashiyama Station",
      description: "Exit 2. The guide will be wearing a traditional kimono."
    },
    description: [
      "Find peace in the heart of Kyoto with a traditional Way of Tea (Chado) experience in a private 200-year-old machiya house. Learn the philosophy of Zen and the intricate movements of preparing matcha.",
      "This is a quiet, meditative experience focused on mindfulness and seasonal beauty."
    ],
    includes: [
      "Premium Uji Matcha",
      "Wagashi (Seasonal Sweets)",
      "Tea Master Instruction",
      "Zen Philosophy Guide"
    ],
    toBring: [
      "Clean socks (mandatory for entering the tea room)",
      "An open mind"
    ],
    guide: {
      name: "Yuki",
      bio: "Licensed Tea Ceremony practitioner and Kyoto native.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki",
      isVerified: true
    }
  }
];
