import { ItemType } from "@/components/planner/Timeline";

export interface SampleItinerary {
  id: string;
  duration: number; // Days
  heroImage: string;
  basePrice: number;
  activities: ItemType[];
}

export const SAMPLE_ITINERARIES: SampleItinerary[] = [
  {
    id: "golden-route",
    duration: 14,
    heroImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200", // Kyoto pagoda
    basePrice: 250000,
    activities: [
      { id: "gr-1", title: "Arrival at Narita", date: "2025-05-01", type: "flight", location: "Narita Airport", cost: 0, lat: 35.7720, lng: 140.3929 },
      { id: "gr-2", title: "Shinjuku Exploration", date: "2025-05-02", type: "spot", location: "Shinjuku Station", cost: 0, lat: 35.6895, lng: 139.7004 },
      { id: "gr-3", title: "Hakone Day Trip", date: "2025-05-04", type: "nature", location: "Lake Ashi", cost: 5000, lat: 35.2017, lng: 139.0232 },
      { id: "gr-4", title: "Bullet Train to Kyoto", date: "2025-05-06", type: "transport", location: "Kyoto Station", cost: 14000, lat: 34.9858, lng: 135.7588 },
      { id: "gr-5", title: "Fushimi Inari Shrines", date: "2025-05-07", type: "culture", location: "Fushimi Inari", cost: 0, lat: 34.9671, lng: 135.7727 },
      { id: "gr-6", title: "Osaka Dotonbori", date: "2025-05-10", type: "food", location: "Dotonbori", cost: 3000, lat: 34.6687, lng: 135.5013 },
      { id: "gr-7", title: "Hiroshima Peace Park", date: "2025-05-12", type: "landmark", location: "Peace Memorial", cost: 10000, lat: 34.3955, lng: 132.4536 }
    ]
  },
  {
    id: "tokyo-deep-dive",
    duration: 7,
    heroImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200", // Tokyo skyline
    basePrice: 120000,
    activities: [
      { id: "tdd-1", title: "Akihabara Tech Culture", date: "2025-06-01", type: "shopping", location: "Electric Town", cost: 0, lat: 35.6984, lng: 139.7711 },
      { id: "tdd-2", title: "Shibuya Scramble", date: "2025-06-02", type: "spot", location: "Shibuya Crossing", cost: 0, lat: 35.6595, lng: 139.7004 },
      { id: "tdd-3", title: "Asakusa Senso-ji", date: "2025-06-03", type: "culture", location: "Senso-ji", cost: 0, lat: 35.7148, lng: 139.7967 },
      { id: "tdd-4", title: "Nakano Broadway", date: "2025-06-05", type: "shopping", location: "Nakano Broadway", cost: 0, lat: 35.7088, lng: 139.6657 }
    ]
  },
  {
    id: "kyoto-zen",
    duration: 5,
    heroImage: "https://i.pinimg.com/736x/3a/d7/fe/3ad7fe4f962de763b1e5c6b91ec04c5a.jpg", // Zen garden
    basePrice: 85000,
    activities: [
      { id: "kz-1", title: "Arashiyama Bamboo Grove", date: "2025-04-10", type: "nature", location: "Bamboo Grove", cost: 0, lat: 35.0158, lng: 135.6706 },
      { id: "kz-2", title: "Ryoan-ji Zen Garden", date: "2025-04-11", type: "culture", location: "Ryoan-ji", cost: 500, lat: 35.0345, lng: 135.7182 },
      { id: "kz-3", title: "Gion Evening Walk", date: "2025-04-12", type: "nightlife", location: "Gion District", cost: 0, lat: 35.0037, lng: 135.7750 },
      { id: "kz-4", title: "Uji Tea Ceremony", date: "2025-04-14", type: "culture", location: "Byodo-in", cost: 3000, lat: 34.8893, lng: 135.8077 }
    ]
  },
  {
    id: "classic-japan-14",
    duration: 14,
    heroImage: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=1200", // Mt Fuji & Five Lakes
    basePrice: 265000,
    activities: [
      { id: "cj-1", title: "Arrival in Tokyo", date: "2025-09-01", type: "flight", location: "Haneda Airport", cost: 0, lat: 35.5494, lng: 139.7798 },
      { id: "cj-2", title: "Full day in Tokyo", date: "2025-09-02", type: "spot", location: "Shibuya Crossing", cost: 0, lat: 35.6595, lng: 139.7004 },
      { id: "cj-3", title: "Day Trip to Kamakura", date: "2025-09-03", type: "landmark", location: "Kamakura Daibutsu", cost: 3000, lat: 35.3168, lng: 139.5357 },
      { id: "cj-4", title: "Transfer to Mt Fuji", date: "2025-09-04", type: "transport", location: "Lake Kawaguchi", cost: 4500, lat: 35.5138, lng: 138.7518 },
      { id: "cj-5", title: "Mt Fuji to Hakone", date: "2025-09-05", type: "transport", location: "Hakone-Yumoto", cost: 3500, lat: 35.2324, lng: 139.1069 },
      { id: "cj-6", title: "Hakone to Kyoto", date: "2025-09-06", type: "transport", location: "Kyoto Station", cost: 13000, lat: 34.9858, lng: 135.7588 },
      { id: "cj-7", title: "Fushimi Inari and Uji", date: "2025-09-07", type: "culture", location: "Byodo-in Temple", cost: 600, lat: 34.8893, lng: 135.8077 },
      { id: "cj-8", title: "Arashiyama and Nara", date: "2025-09-08", type: "nature", location: "Nara Park", cost: 0, lat: 34.6851, lng: 135.8048 },
      { id: "cj-9", title: "Transfer to Osaka", date: "2025-09-09", type: "transport", location: "Osaka Namba", cost: 800, lat: 34.6670, lng: 135.5004 },
      { id: "cj-10", title: "Full day in Osaka", date: "2025-09-10", type: "food", location: "Dotonbori", cost: 5000, lat: 34.6687, lng: 135.5013 },
      { id: "cj-11", title: "Hiroshima Day Trip", date: "2025-09-11", type: "landmark", location: "Miyajima", cost: 12000, lat: 34.3027, lng: 132.3197 },
      { id: "cj-12", title: "Rest & Back to Tokyo", date: "2025-09-12", type: "activity", location: "Tokyo Station", cost: 14500, lat: 35.6812, lng: 139.7671 },
      { id: "cj-13", title: "Tokyo Exploration", date: "2025-09-13", type: "spot", location: "Ginza", cost: 0, lat: 35.6717, lng: 139.7650 },
      { id: "cj-14", title: "Flight out", date: "2025-09-14", type: "flight", location: "Narita Airport", cost: 0, lat: 35.7720, lng: 140.3929 }
    ]
  }
];
