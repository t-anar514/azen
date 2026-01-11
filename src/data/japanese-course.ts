export type Phrase = {
  id: string;
  japanese: string;
  romaji: string;
  english: string;
  context?: string;
};

export type PhraseCollection = {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  phrases: Phrase[];
};


export const phraseCollections: PhraseCollection[] = [
  {
    id: "daily",
    title: "Daily Essentials",
    description: "Top 5 Phrases for Daily Use",
    coverImage: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=1000",
    phrases: [

      {
        id: "hello",
        japanese: "こんにちは",
        romaji: "Konnichiwa",
        english: "Hello",
        context: "Used during the day (10am - 5pm).",
      },
      {
        id: "thanks",
        japanese: "ありがとう",
        romaji: "Arigatou",
        english: "Thank you",
        context: "Casual. Use 'Arigatou Gozaimasu' for politeness.",
      },
      {
        id: "excuse",
        japanese: "すみません",
        romaji: "Sumimasen",
        english: "Excuse me / Sorry",
        context: "The magic word. Use it to call staff or apologize.",
      },
      {
        id: "yesno",
        japanese: "はい / いいえ",
        romaji: "Hai / Iie",
        english: "Yes / No",
        context: "'Hai' also means 'I'm listening'.",
      },
      {
        id: "please",
        japanese: "お願いします",
        romaji: "Onegaishimasu",
        english: "Please (Request)",
        context: "Use when ordering or asking for something.",
      },
    ],
  },
  {
    id: "survival",
    title: "Survival Mode",
    description: "If you get lost or in trouble, say these.",
    coverImage: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=1000",
    phrases: [

      {
        id: "toilet",
        japanese: "トイレはどこですか？",
        romaji: "Toire wa doko desu ka?",
        english: "Where is the toilet?",
        context: "Essential. 'Doko' means where.",
      },
      {
        id: "menu",
        japanese: "英語メニューはありますか？",
        romaji: "Eigo menyu wa arimasu ka?",
        english: "Do you have an English menu?",
        context: "Many places have them!",
      },
      {
        id: "understand",
        japanese: "わかりません",
        romaji: "Wakarimasen",
        english: "I don't understand",
        context: "Say it with a smile.",
      },
      {
        id: "wantgo",
        japanese: "~に行きたいです",
        romaji: "~ ni ikitai desu",
        english: "I want to go to ~",
        context: "Show a map and point while saying this.",
      },
    ],
  },
  {
    id: "golden",
    title: "Golden Rules",
    description: "8 Must-Know Phrases",
    coverImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1000",
    phrases: [

      {
        id: "itadakimasu",
        japanese: "いただきます",
        romaji: "Itadakimasu",
        english: "I humbly receive (before eating)",
        context: "Clasp hands together before eating.",
      },
      {
        id: "gochisou",
        japanese: "ごちそうさまでした",
        romaji: "Gochisousama deshita",
        english: "Thank you for the meal (after eating)",
        context: "Say it to the chef or staff when leaving.",
      },
      {
        id: "shitsurei",
        japanese: "失礼します",
        romaji: "Shitsurei shimasu",
        english: "Excuse me (entering/leaving)",
        context: "Used when entering a room or ending a call.",
      },
      {
        id: "daijoubu",
        japanese: "大丈夫です",
        romaji: "Daijoubu desu",
        english: "It's okay / I'm fine",
        context: "Can mean 'No thanks' or 'I'm good'.",
      },
      {
        id: "recommend",
        japanese: "おすすめは？",
        romaji: "Osusume wa?",
        english: "What do you recommend?",
        context: "Great for restaurants.",
      },
      {
        id: "thisone",
        japanese: "これをお願いします",
        romaji: "Kore o onegaishimasu",
        english: "This one please",
        context: "Point to the menu item.",
      },
      {
        id: "check",
        japanese: "お会計をお願いします",
        romaji: "Okaikei o onegaishimasu",
        english: "Check, please",
        context: "Cross fingers (x) is a gesture for check.",
      },
      {
        id: "delicious",
        japanese: "美味しいです",
        romaji: "Oishii desu",
        english: "It's delicious",
        context: "Staff love hearing this.",
      },
    ],
  },
  {
    id: "vibes",
    title: "Local Vibes",
    description: "Slang and connectors to bridge the gap.",
    coverImage: "https://images.unsplash.com/photo-1480796090211-37d3534b4c45?auto=format&fit=crop&q=80&w=1000",
    phrases: [

      {
        id: "yabai",
        japanese: "ヤバい",
        romaji: "Yabai",
        english: "Crazy / Cool / Bad",
        context: "Context dependent. Like 'OMG'.",
      },
      {
        id: "majide",
        japanese: "まじで？",
        romaji: "Majide?",
        english: "Seriously?",
        context: "Casual reaction.",
      },
      {
        id: "naruhodo",
        japanese: "なるほど",
        romaji: "Naruhodo",
        english: "I see / That makes sense",
        context: "Good for active listening.",
      },
      {
        id: "meccha",
        japanese: "めっちゃ",
        romaji: "Meccha",
        english: "Very / Super",
        context: "e.g., 'Meccha oishii' (Super delicious).",
      },
      {
        id: "tashikani",
        japanese: "確かに",
        romaji: "Tashikani",
        english: "Exactly / True",
        context: "Agreeing with someone.",
      },
      {
        id: "ukeru",
        japanese: "ウケる",
        romaji: "Ukeru",
        english: "Funny / Hilarious",
        context: "Used when something is funny.",
      },
    ],
  },
];
