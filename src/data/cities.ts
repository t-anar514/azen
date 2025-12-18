export interface District {
  name: string;
  description: string;
}

export interface CityContent {
  text: string;
  imageUrl: string;
}

export interface City {
  id: string;
  name: string;
  heroImage: string;
  teaser: string;
  introduction: string;
  history: CityContent;
  culture: CityContent;
  expenses: CityContent;
  climate: CityContent;
  districts: {
    mapUrl: string;
    list: District[];
  };
  gettingAround: string;
  vibe: string;
}

export const CITIES: City[] = [
  {
    id: "tokyo",
    name: "Tokyo",
    heroImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=2094",
    teaser: "The neon-lit heart of Japan where tradition meets the future.",
    introduction: "Tokyo is a city of contrasts—a sprawling metropolis where sky-high skyscrapers stand next to ancient temples. It's a place where you can experience the world's busiest crossing and a quiet tea ceremony in the same afternoon.",
    history: {
      text: "Originally a small fishing village named Edo, the city became Japan's political center in 1603 when Tokugawa Ieyasu established his shogunate here. Renamed Tokyo ('Eastern Capital') in 1868, it has survived the 1923 Great Kanto Earthquake and the devastation of WWII to become the most populous metropolitan area in the world.",
      imageUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=2070"
    },
    culture: {
      text: "Tokyo's culture is a fascinating blend of extreme modernity and deep-rooted tradition. You'll find hyper-efficient technology alongside centuries-old etiquette. Seasonal festivals (matsuri) and the cherry blossom season (hanami) remain central to local life.",
      imageUrl: "https://images.unsplash.com/photo-1528150177508-7c0c1664f695?auto=format&fit=crop&q=80&w=1974"
    },
    expenses: {
      text: "While Tokyo is often seen as expensive, it offers options for every budget. Modern convenience stores (konbini) provide high-quality affordable meals, while Michelin-starred dining is available for those seeking luxury. Public transport is exceptionally cost-effective for its quality.",
      imageUrl: "https://images.unsplash.com/photo-1610448106192-3c3e80c9bc0d?auto=format&fit=crop&q=80&w=2070"
    },
    climate: {
      text: "Tokyo has four distinct seasons. Springs are mild and famous for cherry blossoms. Summers are hot and humid with frequent rainfall. Autumns bring crisp air and stunning red maples, while winters are cold but generally sunny and dry.",
      imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=2070"
    },
    districts: {
      mapUrl: "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?auto=format&fit=crop&q=80&w=2071",
      list: [
        { name: "Shinjuku", description: "The administrative and commercial heart, home to the world's busiest station and vibrant nightlife in Golden Gai." },
        { name: "Shibuya", description: "The center of youth culture and fashion, famous for the iconic Hachiko statue and Scramble Crossing." },
        { name: "Asakusa", description: "A glimpse into old Tokyo, centered around the historic Senso-ji Temple and Nakamise shopping street." },
        { name: "Ginza", description: "The city's upscale shopping, dining, and entertainment district, featuring numerous department stores and art galleries." }
      ]
    },
    gettingAround: "Tokyo's rail network is legendary but can be overwhelming. The Yamanote Loop Line is your best friend, connecting most major hubs. Suica or Pasmo cards are essential for seamless travel across different operators.",
    vibe: "High-energy, efficient, and endlessly surprising. Tokyo is both overwhelming and perfectly organized."
  },
  {
    id: "osaka",
    name: "Osaka",
    heroImage: "https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&q=80&w=1974",
    teaser: "Japan's kitchen, famous for its street food and outgoing locals.",
    introduction: "Osaka is known as 'Tenka no Daidokoro' (the nation's kitchen). It's a city that prioritizes food, fun, and commerce over the reserved elegance of Tokyo or Kyoto.",
    history: {
      text: "Historically the hub of Japan's rice trade, Osaka was the country's economic capital during the Edo period. Often called the 'City of Water' due to its numerous canals, it has always been a merchant city with a more relaxed and pragmatic social code than the imperial centers.",
      imageUrl: "https://images.unsplash.com/photo-1590253553890-392d736a503c?auto=format&fit=crop&q=80&w=2074"
    },
    culture: {
      text: "The culture here is defined by 'Kuidaore'—the philosophy of eating until you drop. Osakans are known for being more outspoken, humorous, and friendly than their Tokyo counterparts. It's the birthplace of Bunraku puppetry and modern Japanese comedy.",
      imageUrl: "https://images.unsplash.com/photo-1533282960533-51328aa49826?auto=format&fit=crop&q=80&w=2142"
    },
    expenses: {
      text: "Osaka is generally slightly more affordable than Tokyo, especially when it comes to dining and accommodation. The street food culture in Dotonbori allows for incredible culinary experiences without breaking the bank.",
      imageUrl: "https://images.unsplash.com/photo-1549633030-89d07439bd5f?auto=format&fit=crop&q=80&w=2080"
    },
    climate: {
      text: "Similar to Tokyo but often a few degrees warmer. Summers can be particularly intense due to the 'urban heat island' effect. The city is beautiful in autumn when the gingko trees along Midosuji Boulevard turn bright yellow.",
      imageUrl: "https://images.unsplash.com/photo-1589463349208-892428737acc?auto=format&fit=crop&q=80&w=1974"
    },
    districts: {
      mapUrl: "https://images.unsplash.com/photo-1501560379305-169481353018?auto=format&fit=crop&q=80&w=2070",
      list: [
        { name: "Dotonbori", description: "The heart of Osaka's food scene, famous for its massive neon signs, moving billboards, and takoyaki stalls." },
        { name: "Shinsekai", description: "A nostalgic neighborhood with a unique retro atmosphere, Kushikatsu restaurants, and the Tsutenkaku Tower." },
        { name: "Umeda", description: "The city's main terminal area with massive underground malls, modern skyscrapers, and the Umeda Sky Building." },
        { name: "Namba", description: "A major entertainment district offering theater, shopping, and the iconic Glico Running Man." }
      ]
    },
    gettingAround: "The Midosuji Subway Line is the main artery of Osaka, running North-South. The Osaka Loop Line (JR) is also useful for reaching major sightseeing spots like Osaka Castle.",
    vibe: "Boisterous, friendly, and unpretentious. People in Osaka are known for their humor and love for a good bargain."
  },
  {
    id: "kyoto",
    name: "Kyoto",
    heroImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=2070",
    teaser: "The cultural soul of Japan, home to thousands of temples and shrines.",
    introduction: "For over a thousand years, Kyoto was the capital of Japan. Today, it remains the country's cultural heart, where geisha still walk the streets of Gion and silence is found in Zen rock gardens.",
    history: {
      text: "Founded in 794 as Heian-kyo, Kyoto served as the imperial capital for over 1,000 years. Because it was largely spared from bombing during WWII, it retains much of its pre-modern architecture and layout, standing as the ultimate repository of Japanese classical culture.",
      imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=2070"
    },
    culture: {
      text: "Kyoto is the center of traditional Japanese arts: tea ceremony, flower arrangement (ikebana), and kaiseki dining. The city's 17 UNESCO World Heritage sites and thousands of temples reflect a culture that values serenity, seasonality, and refinement.",
      imageUrl: "https://images.unsplash.com/photo-1624253321171-1be53e12f5f4?auto=format&fit=crop&q=80&w=1974"
    },
    expenses: {
      text: "Kyoto can be quite pricey, especially during peak seasons like cherry blossoms or autumn leaves. High-end ryokans and traditional kaiseki meals are significant investments, but temple entries are relatively affordable.",
      imageUrl: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&q=80&w=1974"
    },
    climate: {
      text: "Located in a basin, Kyoto experiences extreme temperatures. Summers are notoriously humid and stifling, while winters are piercingly cold. However, the seasonal beauty of snow on Kinkaku-ji or maples in Arashiyama is unparalleled.",
      imageUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&q=80&w=2070"
    },
    districts: {
      mapUrl: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?auto=format&fit=crop&q=80&w=2070",
      list: [
        { name: "Gion", description: "The famous entertainment district where traditional wooden machiya houses line the streets and geisha can occasionally be spotted." },
        { name: "Arashiyama", description: "A scenic area on the outskirts of the city, famous for its Sagano Bamboo Grove and Tenryu-ji Temple." },
        { name: "Higashiyama", description: "A well-preserved historic district with narrow lanes leading to famous temples like Kiyomizu-dera and Yasaka Pagoda." },
        { name: "Pontocho", description: "A narrow, atmospheric alley running parallel to the Kamogawa River, packed with traditional restaurants and bars." }
      ]
    },
    gettingAround: "Kyoto is best explored by bus and on foot. While there are a few subway lines, many of the best temples are most easily reached by the extensive city bus network.",
    vibe: "Serene, refined, and deeply traditional. Kyoto moves at a different pace, encouraging slow exploration and reflection."
  }
];
