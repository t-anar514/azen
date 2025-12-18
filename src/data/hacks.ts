export interface HackStep {
  step: number;
  title: string;
  text: string;
  img: string;
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
    id: "luggage-forwarding",
    title: "Hands-Free Travel (Takkyubin)",
    category: "Logistics",
    summary: "Ship your suitcases from the airport to your hotel for under $20 and travel light.",
    coverImage: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&q=80&w=2070",
    steps: [
      { 
        step: 1, 
        title: "Find the Counter",
        text: "Look for the GPA, Yamato (Kuroneko), or Hands-Free Travel counter at the airport arrival hall.", 
        img: "https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&q=80&w=2070" 
      },
      { 
        step: 2, 
        title: "Fill the Waybill",
        text: "Fill out the blue waybill with your destination hotel's address and phone number. Keep the tracking slip.", 
        img: "https://images.unsplash.com/photo-1512418490979-9179599339e0?auto=format&fit=crop&q=80&w=2070" 
      }
    ],
    proTip: "Most hotels can also ship your bags back to the airport when you leave! Just ask at the front desk 24 hours before your flight.",
    relatedIds: ["suica-wallet", "pocket-wifi"]
  },
  {
    id: "suica-wallet",
    title: "The IC Card Shortcut",
    category: "Transport",
    summary: "Add a Suica or Pasmo to your Apple/Google Wallet for seamless transit without physical tickets.",
    coverImage: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&q=80&w=2006",
    steps: [
      { 
        step: 1, 
        title: "Open Wallet App",
        text: "Open the Apple Wallet or Google Pay app on your device and tap the '+' button.", 
        img: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=2074" 
      },
      { 
        step: 2, 
        title: "Select Transit Card",
        text: "Choose 'Transit Card' and search for 'Suica' or 'Pasmo'. You can create a new card instantly.", 
        img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=2070" 
      }
    ],
    proTip: "You don't even need to wake your phone or use FaceID/TouchID if you set it as your 'Express Transit' card.",
    relatedIds: ["luggage-forwarding", "trash-strategy"]
  },
  {
    id: "konbini-services",
    title: "Mastering the Konbini",
    category: "Food",
    summary: "Use 'Loppi' machines for museum tickets, print documents, or ship packages from any convenience store.",
    coverImage: "https://images.unsplash.com/photo-1580655653885-65763b2597ad?auto=format&fit=crop&q=80&w=2070",
    steps: [
      { 
        step: 1, 
        title: "Identify the Machine",
        text: "Locate the red 'Loppi' machine (Lawson/FamilyMart) or the multi-function copier (7-Eleven).", 
        img: "https://images.unsplash.com/photo-1604719312563-8912e9223c6a?auto=format&fit=crop&q=80&w=1974" 
      },
      { 
        step: 2, 
        title: "Ticket Selection",
        text: "Select 'Tickets' from the menu. Most machines have an English button for easier navigation.", 
        img: "https://images.unsplash.com/photo-1533923156502-be31530547c4?auto=format&fit=crop&q=80&w=1974" 
      }
    ],
    proTip: "Ghibli Museum tickets often sell out months in advance. The Loppi machine is your best bet for last-minute cancellations.",
    relatedIds: ["trash-strategy", "luggage-forwarding"]
  },
  {
    id: "trash-strategy",
    title: "The 'Trash' Strategy",
    category: "Etiquette",
    summary: "Navigate Japan with zero public trash cans by knowing exactly where to look.",
    coverImage: "https://images.unsplash.com/photo-1526951456023-1d041300977d?auto=format&fit=crop&q=80&w=2070",
    steps: [
      { 
        step: 1, 
        title: "Vending Machines",
        text: "Look for small recycling bins next to every vending machine. They usually take bottles and cans only.", 
        img: "https://images.unsplash.com/photo-1533446416143-690a98f795db?auto=format&fit=crop&q=80&w=1974" 
      },
      { 
        step: 2, 
        title: "Konbini Bins",
        text: "Convenience stores always have trash bins near the entrance or inside. Use them after you finish your snack.", 
        img: "https://images.unsplash.com/photo-1604719312563-8912e9223c6a?auto=format&fit=crop&q=80&w=1974" 
      }
    ],
    proTip: "Carry a small 'trash bag' (a plastic bag from a konbini) in your backpack to store garbage until you reach your hotel.",
    relatedIds: ["suica-wallet", "konbini-services"]
  },
  {
    id: "h1",
    title: "JR Pass vs. Single Tickets",
    category: "Money",
    summary: "The JR Pass price increased in 2023. Unless you are traveling long distances daily, single tickets or regional passes are often cheaper.",
    coverImage: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=2070",
    steps: [
      { step: 1, title: "Check Routes", text: "Calculate your planned shinkansen trips.", img: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=2070" }
    ],
    proTip: "Use a JR Pass calculator online before you buy.",
    relatedIds: ["suica-wallet"],
    trapAlternative: null
  },
  {
    id: "h2",
    title: "Robot Restaurant",
    category: "Tourist Trap",
    summary: "Often cited as overpriced and lacking authentic culture.",
    coverImage: "https://images.unsplash.com/photo-1555681962-37bd1179727a?auto=format&fit=crop&q=80&w=2070",
    steps: [
      { step: 1, title: "Alternative Options", text: "Consider traditional performances instead.", img: "https://images.unsplash.com/photo-1555681962-37bd1179727a?auto=format&fit=crop&q=80&w=2070" }
    ],
    proTip: "Authentic culture is often found in small neighborhood shrines.",
    relatedIds: ["konbini-services"],
    trapAlternative: "Visit a local Kabuki show or a themed cafe in Akihabara."
  }
];
