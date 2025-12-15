export type Phrase = {
  japanese: string;
  romaji: string;
  english: string;
  context?: string;
};

export type PhraseCollection = {
  title: string;
  description: string;
  phrases: Phrase[];
};

export const phraseCollections: PhraseCollection[] = [
  {
    title: "Daily Essentials",
    description: "Top 5 Phrases for Daily Use",
    phrases: [
      {
        japanese: "こんにちは",
        romaji: "Konnichiwa",
        english: "Hello",
        context: "Used during the day (10am - 5pm).",
      },
      {
        japanese: "ありがとう",
        romaji: "Arigatou",
        english: "Thank you",
        context: "Casual. Use 'Arigatou Gozaimasu' for politeness.",
      },
      {
        japanese: "すみません",
        romaji: "Sumimasen",
        english: "Excuse me / Sorry",
        context: "The magic word. Use it to call staff or apologize.",
      },
      {
        japanese: "はい / いいえ",
        romaji: "Hai / Iie",
        english: "Yes / No",
        context: "'Hai' also means 'I'm listening'.",
      },
      {
        japanese: "お願いします",
        romaji: "Onegaishimasu",
        english: "Please (Request)",
        context: "Use when ordering or asking for something.",
      },
    ],
  },
  {
    title: "Survival Mode",
    description: "If you get lost or in trouble, say these.",
    phrases: [
      {
        japanese: "トイレはどこですか？",
        romaji: "Toire wa doko desu ka?",
        english: "Where is the toilet?",
        context: "Essential. 'Doko' means where.",
      },
      {
        japanese: "英語メニューはありますか？",
        romaji: "Eigo menyu wa arimasu ka?",
        english: "Do you have an English menu?",
        context: "Many places have them!",
      },
      {
        japanese: "わかりません",
        romaji: "Wakarimasen",
        english: "I don't understand",
        context: "Say it with a smile.",
      },
      {
        japanese: "~に行きたいです",
        romaji: "~ ni ikitai desu",
        english: "I want to go to ~",
        context: "Show a map and point while saying this.",
      },
    ],
  },
  {
    title: "Golden Rules",
    description: "8 Must-Know Phrases",
    phrases: [
      {
        japanese: "いただきます",
        romaji: "Itadakimasu",
        english: "I humbly receive (before eating)",
        context: "Clasp hands together before eating.",
      },
      {
        japanese: "ごちそうさまでした",
        romaji: "Gochisousama deshita",
        english: "Thank you for the meal (after eating)",
        context: "Say it to the chef or staff when leaving.",
      },
      {
        japanese: "失礼します",
        romaji: "Shitsurei shimasu",
        english: "Excuse me (entering/leaving)",
        context: "Used when entering a room or ending a call.",
      },
      {
        japanese: "大丈夫です",
        romaji: "Daijoubu desu",
        english: "It's okay / I'm fine",
        context: "Can mean 'No thanks' or 'I'm good'.",
      },
      {
        japanese: "おすすめは？",
        romaji: "Osusume wa?",
        english: "What do you recommend?",
        context: "Great for restaurants.",
      },
      {
        japanese: "これをお願いします",
        romaji: "Kore o onegaishimasu",
        english: "This one please",
        context: "Point to the menu item.",
      },
      {
        japanese: "お会計をお願いします",
        romaji: "Okaikei o onegaishimasu",
        english: "Check, please",
        context: "Cross fingers (x) is a gesture for check.",
      },
      {
        japanese: "美味しいです",
        romaji: "Oishii desu",
        english: "It's delicious",
        context: "Staff love hearing this.",
      },
    ],
  },
  {
    title: "Local Vibes",
    description: "Slang and connectors to bridge the gap.",
    phrases: [
      {
        japanese: "ヤバい",
        romaji: "Yabai",
        english: "Crazy / Cool / Bad",
        context: "Context dependent. Like 'OMG'.",
      },
      {
        japanese: "まじで？",
        romaji: "Majide?",
        english: "Seriously?",
        context: "Casual reaction.",
      },
      {
        japanese: "なるほど",
        romaji: "Naruhodo",
        english: "I see / That makes sense",
        context: "Good for active listening.",
      },
      {
        japanese: "めっちゃ",
        romaji: "Meccha",
        english: "Very / Super",
        context: "e.g., 'Meccha oishii' (Super delicious).",
      },
      {
        japanese: "確かに",
        romaji: "Tashikani",
        english: "Exactly / True",
        context: "Agreeing with someone.",
      },
      {
        japanese: "ウケる",
        romaji: "Ukeru",
        english: "Funny / Hilarious",
        context: "Used when something is funny.",
      },
    ],
  },
];
