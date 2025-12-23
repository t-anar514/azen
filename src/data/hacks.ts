export interface HackStep {
  step: number;
  title: string;
  text: string;
}

export interface Hack {
  id: string;
  title: string;
  category: "Food" | "Transport" | "Money" | "Logistics" | "Etiquette" | "Tourist Trap";
  summary: string;
  steps: HackStep[];
  proTip: string;
  coverImage: string;
  relatedIds: string[];
  trapAlternative?: string | null;
}

export const HACKS: Hack[] = [
  {
    id: "suica-setup",
    title: "Mobile Suica Mastery",
    category: "Transport",
    summary: "Skip queues and handle payments with your phone.",
    coverImage: "https://newsdig.ismcdn.jp/mwimgs/6/f/-/img_6f00f9238ad2d367346f77a7a5945270157032.jpg",
    steps: [
      { step: 1, title: "Open Apple Wallet", text: "Tap the '+' icon to start." },
      { step: 2, title: "Select Transit Card", text: "Search for Suica or PASMO." },
      { step: 3, title: "Load Funds", text: "Use Mastercard/Amex for initial balance." },
      { step: 4, title: "Enable Express Mode", text: "No FaceID needed for tapping." },
      { step: 5, title: "Tap to Go", text: "Hover near the blue IC reader." }
    ],
    proTip: "If your foreign card fails, charge with cash at 7-Eleven ATMs.",
    relatedIds: ["luggage-forwarding", "konbini-mastery"]
  },
  {
    id: "luggage-forwarding",
    title: "Hands-Free Travel (Takkyubin)",
    category: "Logistics",
    summary: "Send bags between hotels so you can travel light.",
    coverImage: "https://www.kuronekoyamato.co.jp/ytc/en/send/services/same-day-delivery/img/index_h01.png",
    steps: [
      { step: 1, title: "Pack Early", text: "Prepare the night before checkout." },
      { step: 2, title: "Visit Front Desk", text: "Ask for a Green Waybill (Prepaid)." },
      { step: 3, title: "Fill Details", text: "Fill 'To' address and delivery date." },
      { step: 4, title: "Pay & Handover", text: "Fee is usually ¥2,000–¥3,000." },
      { step: 5, title: "Receive", text: "Bags wait in your next hotel room." }
    ],
    proTip: "Airport Deadline: Send 2-3 days before your flight departure.",
    relatedIds: ["suica-setup", "shinkansen-baggage"]
  },
  {
    id: "konbini-mastery",
    title: "Mastering the Konbini",
    category: "Food",
    summary: "Konbini are 24/7 hubs for food, cash, and services.",
    coverImage: "https://learnjapanese123.com/wp-content/uploads/2019/07/conbini-tips-blog-thumbnail.jpg",
    steps: [
      { step: 1, title: "ATMs", text: "Use 7-Eleven for international cards." },
      { step: 2, title: "Food Heating", text: "Clerk will offer to heat your bento." },
      { step: 3, title: "Trash Separation", text: "Sort bottles from burnables." },
      { step: 4, title: "Ticket Machines", text: "Use copy machines for events/Disney." },
      { step: 5, title: "Age Verification", text: "Tap 'Yes' on screen for alcohol." }
    ],
    proTip: "Show QR codes to staff if machine menus are too complex.",
    relatedIds: ["trash-tactics", "suica-setup"]
  },
  {
    id: "shinkansen-baggage",
    title: "Bullet Train Baggage",
    category: "Transport",
    summary: "SmartEx booking and oversized baggage rules.",
    coverImage: "https://images.travelandleisureasia.com/wp-content/uploads/sites/5/2024/01/24163511/shinkansens-japan.jpeg",
    steps: [
      { step: 1, title: "Download SmartEx", text: "Official app for Shinkansen booking." },
      { step: 2, title: "Measure Luggage", text: "160cm-250cm total is 'Oversized'." },
      { step: 3, title: "Book Seat Area", text: "Select last row with storage." },
      { step: 4, title: "Tap Through", text: "Link ticket to your phone/IC card." },
      { step: 5, title: "Stow Correctly", text: "Place bag in reserved space." }
    ],
    proTip: "Unauthorized oversized bags incur ¥1,000 fine and moving cars.",
    relatedIds: ["luggage-forwarding", "suica-setup"]
  },
  {
    id: "trash-tactics",
    title: "Urban Trash Tactics",
    category: "Etiquette",
    summary: "Public bins are rare. Know how to manage your waste.",
    coverImage: "https://rimage.gnst.jp/livejapan.com/public/article/detail/a/00/02/a0002380/img/basic/a0002380_main.jpg",
    steps: [
      { step: 1, title: "Carry a Bag", text: "Keep a small plastic bag for personal trash." },
      { step: 2, title: "Eat at Source", text: "Return wrappers to the food vendor." },
      { step: 3, title: "Vending Machine Bins", text: "For bottles/cans ONLY. Don't stuff paper." },
      { step: 4, title: "Spot Real Bins", text: "Found at Konbini and train platforms." },
      { step: 5, title: "Hotel Drop-off", text: "Clear your daily bag back at the hotel." }
    ],
    proTip: "Round holes in bins are for recyclables only; don't block them.",
    relatedIds: ["konbini-mastery", "suica-setup"]
  }
];
