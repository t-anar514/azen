export interface District {
  id: string;
  name: string;
  description: string;
  category: string; // Translation key for the category (e.g., "traditional", "nightlife")
}

export interface City {
  id: string;
  name: string;
  heroImage: string;
  teaser: string;
  introduction: string;
  history: {
    text: string;
    imageUrl: string;
  };
  culture: {
    text: string;
    imageUrl: string;
  };
  expenses: {
    text: string;
    imageUrl: string;
    tiers?: { category: string; amount: string }[];
  };
  climate: {
    text: string;
    imageUrl: string;
    seasons?: { name: string; temp: string; vibe: string }[];
  };
  districts: {
    mapUrl: string;
    list: District[];
  };
  gettingAround: string;
  vibe: {
    text: string;
    imageUrl: string;
  };
}

export const CITIES: City[] = [
  {
    id: "tokyo",
    name: "Tokyo",
    heroImage: "https://wise-plum-i7gqlbj6qp-4eiq9inapk.edgeone.dev/Tokyo%20Skyline%20Mount%20Fuji%20Print.jpg",
    teaser: "The high-velocity metropolis where the future intersects with tradition.",
    introduction: "Tokyo is not merely a city but a cluster of distinct villages connected by the world’s most complex train network. From the neon-drenched skyscrapers of Shinjuku to the quiet, incense-filled alleys of Asakusa, the energy here is kinetic yet impeccably organized.",
    history: {
      text: "Originally a fishing village named Edo, the city became Japan's political center in 1603. Following the Meiji Restoration in 1868, it was renamed Tokyo ('Eastern Capital'). Despite being leveled by the 1923 Great Kanto Earthquake and WWII bombings, Tokyo has consistently reborn itself, resulting in a dynamic, ever-changing skyline that values modernization over static preservation.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Tokyo_Imperial_Palace_pic_08.jpg/330px-Tokyo_Imperial_Palace_pic_08.jpg"
    },
    culture: {
      text: "Tokyo's vibe is defined by 'organized chaos' and a rigorous social contract. Silence on trains is a critical norm, and pedestrians strictly stand on the left of escalators. While reserved by day, festivals like Sanja Matsuri reveal a wild, vibrant side where portable shrines are jostled to amuse the spirits.",
      imageUrl: "https://www.tokyoupdates.metro.tokyo.lg.jp/en/2023/06/28/iStock-510923064.jpg"
    },
    expenses: {
      text: "Tokyo remains the premium entry point to Japan. While mid-range hotel rates have surged due to tourism, food costs remain elastic—offering everything from ¥2,000 konbini meals to ¥30,000 omakase dinners.",
      imageUrl: "https://photos.smugmug.com/photos/i-8r6Ftf2/0/L/i-8r6Ftf2-L.jpg",
      tiers: [
        { category: "Budget", amount: "¥5,000–¥8,000" },
        { category: "Mid-Range", amount: "¥15,000–¥25,000" },
        { category: "Luxury", amount: "¥50,000+" }
      ]
    },
    climate: {
      text: "The 'urban heat island' effect makes Tokyo summers intensely humid. Winter is remarkably dry and sunny, offering the best visibility for seeing Mount Fuji. Spring cherry blossoms bring crowds, while autumn goldens the ginkgo avenues of Meiji Jingu.",
      imageUrl: "https://att-japan.net/wp-content/uploads/2023/06/Tokyo_R.webp",
      seasons: [
        { name: "Spring", temp: "15°C", vibe: "Sakura Peak" },
        { name: "Summer", temp: "30°C", vibe: "High Humidity" },
        { name: "Autumn", temp: "18°C", vibe: "Golden Ginkgos" },
        { name: "Winter", temp: "5°C", vibe: "Dry & Sunny" }
      ]
    },
    districts: {
      mapUrl: "https://thetokyofiles.com/wp-content/uploads/2012/07/tokyo-neighborhood-map.jpg?w=400",
      list: [
        { id: "shinjuku", name: "Shinjuku", description: "The chaotic, neon-lit heart of Tokyo. Home to the world's busiest station, towering skyscrapers, and the atmospheric alleyways of Golden Gai.", category: "nightlife" },
        { id: "shibuya", name: "Shibuya", description: "The youth epicenter famous for the Scramble Crossing, trendy boutiques, and panoramic views from Shibuya Sky.", category: "youth" },
        { id: "ginza", name: "Ginza", description: "Tokyo's upscale boulevards and luxury department stores. A 'Pedestrian Paradise' on weekends when the main street closes to traffic.", category: "luxury" },
        { id: "akihabara", name: "Akihabara", description: "Global headquarters for Otaku culture, filled with electronics, retro games, and vibrant anime facades.", category: "geek-culture" },
        { id: "asakusa", name: "Asakusa", description: "The spiritual soul of 'Shitamachi', centered around Senso-ji Temple and the historic Nakamise-dori shopping street.", category: "traditional" }
      ]
    },
    gettingAround: "Tokyo is a train city. The JR Yamanote Line connects major hubs, but the network of multiple subway operators requires an IC Card for seamless travel.",
    vibe: {
      text: "A high-velocity cluster of urban villages where precision meets neon-lit energy.",
      imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1920"
    }
  },
  {
    id: "kyoto",
    name: "Kyoto",
    heroImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=2070",
    teaser: "The spiritual soul of Japan, defined by 2,000 temples and Zen serenity.",
    introduction: "Kyoto is the spiritual and historical heart of Japan, serving as the Imperial capital for over 1,000 years. Unlike the vertical sprawl of Tokyo, Kyoto is a grid of low-rise wooden heritage and Zen gardens.",
    history: {
      text: "Known as Heian-kyo, Kyoto was spared from WWII bombings due to its cultural significance, preserving its ancient street grid and machiya townhouses. It remains the best example of pre-modern Japanese urbanism, proud of its millennium-long tenure as the Imperial seat.",
      imageUrl: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/45753/186268/main-image"
    },
    culture: {
      text: "Kyoto culture is 'High Context' and steeped in elegance (miyabi). Gion is a workplace for geisha where photography is restricted to protect local traditions. The local dialect, Kyoto-ben, reflects the city's polite and indirect social nuances.",
      imageUrl: "/images/cities/kyoto-culture.png"
    },
    expenses: {
      text: "Kyoto's pricing spikes during Sakura and Autumn seasons. While luxury Ryokans can be expensive, budget-friendly 'Obanzai' home-style cooking offers a taste of traditional hospitality.",
      imageUrl: "https://photos.smugmug.com/photos/i-8r6Ftf2/0/L/i-8r6Ftf2-L.jpg",
      tiers: [
        { category: "Budget", amount: "¥4,000–¥7,000" },
        { category: "Mid-Range", amount: "¥12,000–¥20,000" },
        { category: "Luxury", amount: "¥40,000+" }
      ]
    },
    climate: {
      text: "Located in a basin, Kyoto traps heat in summer and cold in winter. Snow on the Golden Pavilion is a rare bucket-list sight, while the stifling summer humidity makes Gion Matsuri physically demanding.",
      imageUrl: "https://guidetokyoto.com/wp-content/uploads/2020/09/travel-info-chart-annual-rainfall-temperature-in-kyoto-2-600x450.png",
      seasons: [
        { name: "Spring", temp: "14°C", vibe: "Sakura Serenity" },
        { name: "Summer", temp: "32°C", vibe: "Humid & Festive" },
        { name: "Autumn", temp: "17°C", vibe: "Crimson Maples" },
        { name: "Winter", temp: "4°C", vibe: "Silent Temples" }
      ]
    },
    districts: {
      mapUrl: "https://testy-black-qaxiu3mnex-j9gxr8z8ov.edgeone.dev/Gemini%20Generated%20Image%20(1).png",
      list: [
        { id: "southern-higashiyama", name: "Southern Higashiyama", description: "The definitive image of old Kyoto, featuring preserved machiya houses and sloped cobblestone streets leading to Kiyomizu-dera.", category: "traditional" },
        { id: "gion", name: "Gion", description: "The famous Geisha district of exclusive tea houses and willow-lined canals, illuminated by lanterns at night.", category: "traditional" },
        { id: "arashiyama", name: "Arashiyama", description: "A scenic nature retreat featuring the iconic Bamboo Grove, Togetsukyo Bridge, and tranquil Zen temples.", category: "nature" },
        { id: "northern-higashiyama", name: "Northern Higashiyama", description: "A contemplative area home to the Silver Pavilion and the Philosopher's Path, centered on Zen aesthetics.", category: "zen" },
        { id: "downtown", name: "Downtown Kyoto", description: "The commercial hub featuring Nishiki Market ('Kyoto's Kitchen') and the atmospheric riverside dining of Pontocho.", category: "culinary" },
        { id: "center", name: "Central Kyoto", description: "Central Kyoto contains two of the most important tourist sites in the city: the Kyoto Gosho (Imperial Palace) and Nijo Castle, as well as a few smaller sights and attractions.", category: "imperial" },
        { id: "station", name: "Kyoto Station Area", description: "Comprising the Kyoto Station Building and the surrounding blocks, the Kyoto Station Area is not exactly a sightseeing destination, but odds are, you’ll wind up spending some time here. The shinkansen (bullet train), the Haruka airport express train and several other train lines all operate out of Kyoto Station, meaning you’ll almost certainly arrive here.", category: "hub" },
        { id: "southeast", name: "Southeast Kyoto", description: "Southeast Kyoto, at the far southern end of the Higashiyama Mountains, is home to two of Kyoto’s greatest sights: the Shinto wonderland of Fushimi-Inari-Taisha Shrine and the Zen world of Tofuku-ji Temple and all the subtemples that surround it", category: "spiritual" },
        { id: "kurama", name: "Kurama and Kibune", description: "Kurama and Kibune are a pair of tranquil rural villages an easy 30-minute train north of Kyoto on Eizan Line. They form the best half-day trip out of Kyoto.Surrounded by forested mountains, these two quaint villages will ease your soul after spending too long among the neon and concrete of the city below. The premier attraction is Kurama-dera, a mountaintop temple with great views. Combine a visit here with a walk over the mountain to the village of Kibune. ", category: "nature" },
        { id: "ohara", name: "Ohara", description: "Ohara is a tranquil rural village in the mountains north of Kyoto, about an hour (20 kilometers) from Kyoto Station by bus. In addition to several fine temples, the village is perfect for leisurely strolling.Sandwiched between the Hira-san-kei Mountains to the east and the Kitayama Mountains to the west, Ohara is a lovely valley that retains some of the rural charm that many visitors to Japan seek. The highlight is the superb Sanzen-in Temple, but there are also several smaller temples scattered about.", category: "rural" },
        { id: "takao", name: "Takao", description: "About one 50 minutes northwest of Kyoto by bus, Takao feels like worlds away. It’s a small village that’s home to three superb temples: Jingo-ji, Saimyo-ji and Kozan-ji. The first two easily rank among my most favorite temples in the Kyoto area. Best of all, you can do a brilliant hike from Takao down to Hozukyo (on the JR Sagano-San-in Line).", category: "rural" },
        { id: "uji", name: "Uji", description: "Uji is a suburb of Kyoto about 20 minutes south of Kyoto by train. The town is located on the banks of the Uji-gawa River, tucked against picturesque mountains, which are covered with tea plantations (you’ll need a car to properly explore these). While Uji isn’t one of Kyoto’s main attractions, it makes a decent half-day trip out of Kyoto for those who’ve got at least five days in the city.", category: "culinary" },
      ]
    },
    gettingAround: "Kyoto is a bus city struggling with congestion. Use trains to get close to your destination, then switch to walking or cycling.",
    vibe: {
      text: "A deliberate, aesthetic grid of low-rise heritage where time slows to the pace of a tea ceremony.",
      imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=2070"
    }
  },
  {
    id: "osaka",
    name: "Osaka",
    heroImage: "https://wise-plum-i7gqlbj6qp-4eiq9inapk.edgeone.dev/Osaka%20Umeda%20Attractions.jpg",
    teaser: "The Merchant's Kitchen: loud, friendly, and obsessed with food.",
    introduction: "Osaka is the counterweight to Tokyo's reserve. Known as 'The Nation’s Kitchen,' it is fueled by a culture of kuidaore (eating until you drop).",
    history: {
      text: "Ruled by merchants rather than aristocrats, Osaka's history is rooted in pragmatism and commerce. Toyotomi Hideyoshi established the castle here in 1583, but the city's true legacy is its role as the distribution center for the nation's rice and food.",
      imageUrl: "https://article.bespes-jt.com/hs-fs/hubfs/img_sec4_1.jpg?width=475&height=334&name=img_sec4_1.jpg"
    },
    culture: {
      text: "Osaka distinguishes itself by standing on the right of escalators (unlike Tokyo). It's a city of neon signs, standing bars, and 'B-grade gourmet'. Bargaining is culturally acceptable here, reflecting its merchant roots.",
      imageUrl: "https://d3w13n53foase7.cloudfront.net/medium_3224a413_ec8a_414c_8689_6586abe41c60_istock_1059001732_874d7ee0eb.jpg"
    },
    expenses: {
      text: "Osaka offers excellent value compared to Tokyo. Business hotels are cheaper, and the street food culture keeps dining costs low.",
      imageUrl: "https://photos.smugmug.com/photos/i-8r6Ftf2/0/L/i-8r6Ftf2-L.jpg",
      tiers: [
        { category: "Budget", amount: "¥3,500–¥6,000" },
        { category: "Mid-Range", amount: "¥10,000–¥18,000" },
        { category: "Luxury", amount: "¥35,000+" }
      ]
    },
    climate: {
      text: "Similar to Kyoto but moderated by the bay. Intensive heat in summer is matched by the spectacle of the Tenjin Matsuri. Autumn gingko leaves turn Midosuji Boulevard into a golden corridor.",
      imageUrl: "https://osaka.b-cdn.net/wp-content/uploads/2023/05/Osaka-weather-graph.gif",
      seasons: [
        { name: "Spring", temp: "15°C", vibe: "Castle Blossoms" },
        { name: "Summer", temp: "31°C", vibe: "Bay Breeze & BBQ" },
        { name: "Autumn", temp: "18°C", vibe: "Golden Midosuji" },
        { name: "Winter", temp: "6°C", vibe: "Neon Nights" }
      ]
    },
    districts: {
      mapUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Osaka_City_Map.png",
      list: [
        { id: "minami", name: "Minami (Namba)", description: "The beating heart of nightlife and food. Dotonbori Canal is a sensory explosion of neon and mechanical billboards.", category: "nightlife" },
        { id: "kita", name: "Kita (Umeda)", description: "The sophisticated northern hub of skyscrapers, luxury shopping, and massive underground networks.", category: "modern" },
        { id: "shinsekai", name: "Shinsekai", description: "A nostalgic, vintage district famous for kushikatsu and capturing the atmosphere of early 20th-century Osaka.", category: "retro" },
        { id: "castle", name: "Osaka Castle Area", description: "A historical parkland with massive granite walls and moats, serving as the city's primary green space.", category: "historical" },
        { id: "bay", name: "Osaka Bay Area", description: "Waterfront entertainment zone home to Universal Studios Japan and the world-class Kaiyukan aquarium.", category: "entertainment" }
      ]
    },
    gettingAround: "The Midosuji Line is the city's main artery. Private rail companies like Nankai and Hankyu are often superior to JR for regional travel.",
    vibe: {
      text: "Unpretentious and energetic; a neon-soaked playground where the people are as warm as the takoyaki.",
      imageUrl: "/images/cities/osaka-vibe.png"
    }
  },
  {
    id: "nagoya",
    name: "Nagoya",
    heroImage: "https://wise-plum-i7gqlbj6qp-4eiq9inapk.edgeone.dev/e2d46d1a382c2ecb5a97cadce715cf5c.jpg",
    teaser: "Japan's industrial powerhouse with a deep samurai soul.",
    introduction: "Nagoya is the industrial engine of Japan and a stronghold of samurai history. Often bypassed by travelers, it rewards those who stop with spacious avenues and world-class technology museums.",
    history: {
      text: "The historical pivot point of the nation, Nagoya is the birthplace of the three samurai who unified Japan. Nagoya Castle was built in 1612 as a strategic fortress.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Photo_of_Nagoya_Town%2C_1880-1890.jpg/330px-Photo_of_Nagoya_Town%2C_1880-1890.jpg"
    },
    culture: {
      text: "Nagoya has a unique cafe culture where 'Morning Service' gets you a free breakfast. The local cuisine features rich, umami-heavy red soybean paste (Hatcho Miso).",
      imageUrl: "https://www.nagoyaisnotboring.com/wp-content/uploads/2022/09/nagoya-odori-article-2021-cover-image.jpg"
    },
    expenses: {
      text: "Nagoya is the most affordable of the Golden Route cities. You can often find business hotels near the station for under ¥8,000.",
      imageUrl: "https://photos.smugmug.com/photos/i-8r6Ftf2/0/L/i-8r6Ftf2-L.jpg",
      tiers: [
        { category: "Budget", amount: "¥3,000–¥5,500" },
        { category: "Mid-Range", amount: "¥8,000–¥15,000" },
        { category: "Luxury", amount: "¥30,000+" }
      ]
    },
    climate: {
      text: "Nagoya is infamous for its summer heat and high humidity. Springs offer beautiful cherry blossoms along the Yamazaki River.",
      imageUrl: "https://www.alljapanrelocation.com/media/qaidjhsh/nagoya-en.png",
      seasons: [
        { name: "Spring", temp: "16°C", vibe: "River Blossoms" },
        { name: "Summer", temp: "33°C", vibe: "Intense Heat" },
        { name: "Autumn", temp: "19°C", vibe: "Maple Korankei" },
        { name: "Winter", temp: "6°C", vibe: "Clear Skies" }
      ]
    },
    districts: {
      mapUrl: "https://www.nagoya-info.jp/assets/otherlan/img/common/areamap.svg",
      list: [
        { id: "sakae", name: "Sakae", description: "The bustling downtown district, home to the Nagoya TV Tower and the futuristic Oasis 21 glass spaceship roof.", category: "modern" },
        { id: "osu", name: "Osu", description: "A vibrant covered arcade district that blends traditional temples with an eclectic mix of retro shops and street food.", category: "eclectic" },
        { id: "meieki", name: "Meieki", description: "The transport hub defined by vertical skyscrapers, offering high-end dining and convenient access to the Shinkansen.", category: "modern" },
        { id: "atsuta", name: "Atsuta", description: "A spiritual forested sanctuary housing Atsuta Jingu, one of Japan's most sacred and ancient shrines.", category: "spiritual" },
        { id: "port", name: "Port of Nagoya", description: "A maritime hub featuring one of Japan's largest public aquariums and the SCMAGLEV and Railway Park.", category: "leisure" }
      ]
    },
    gettingAround: "Nagoya is car-centric but has an efficient subway system. The Meijo Line loop is most useful for tourists.",
    vibe: {
      text: "Spacious, pragmatic, and prosperous. Nagoya offers a relaxed, authentic urban experience without the extreme crowds of its neighbors.",
      imageUrl: "https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&q=80&w=1974"
    }
  }
];
