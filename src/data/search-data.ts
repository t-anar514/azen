import { CITIES } from "./cities";
import { HACKS } from "./hacks";
import { EXPERIENCES } from "./experiences";
import { phraseCollections } from "./japanese-course";

export type SearchCategory = 'Cities' | 'Hacks' | 'Experiences' | 'Phrases' | 'Places' | 'Posts' | 'Tours';

export interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: SearchCategory;
  url: string;
}

/**
 * Generates the search index.
 * If messages are provided (from next-intl), it uses translated titles and subtitles.
 */
export const getSearchIndex = (locale: string, messages?: any): SearchItem[] => {
  const index: SearchItem[] = [];

  // Helper to safely get translated string
  const getT = (path: string, fallback: string) => {
    if (!messages) return fallback;
    const parts = path.split('.');
    let current = messages;
    for (const part of parts) {
      if (current && current[part]) {
        current = current[part];
      } else {
        return fallback;
      }
    }
    return typeof current === 'string' ? current : fallback;
  };

  // Add Cities
  CITIES.forEach(city => {
    const cityName = getT(`Data.Cities.${city.id}.name`, city.name);
    const cityTeaser = getT(`Data.Cities.${city.id}.teaser`, city.teaser || '');

    index.push({
      id: city.id,
      title: cityName,
      subtitle: cityTeaser,
      category: 'Cities',
      url: `/${locale}/essentials/${city.id}`
    });

    // Add Districts
    city.districts.list.forEach(district => {
      const districtName = getT(`Data.Cities.${city.id}.districts.${district.id}.name`, district.name);
      const districtDesc = getT(`Data.Cities.${city.id}.districts.${district.id}.description`, district.description);

      index.push({
        id: `${city.id}-${district.id}`,
        title: districtName,
        subtitle: `${districtDesc}`,
        category: 'Cities',
        url: `/${locale}/essentials/${city.id}`
      });
    });
  });

  // Add Hacks
  HACKS.forEach(hack => {
    const hackTitle = getT(`Data.Hacks.${hack.id}.title`, hack.title);
    const hackSummary = getT(`Data.Hacks.${hack.id}.summary`, hack.summary);

    index.push({
      id: hack.id,
      title: hackTitle,
      subtitle: hackSummary,
      category: 'Hacks',
      url: `/${locale}/blog/${hack.id}`
    });
  });

  // Add Experiences
  EXPERIENCES.forEach(exp => {
    const title = getT(`Experiences.${exp.id}.title`, exp.title);
    const category = getT(`Experiences.${exp.id}.category`, exp.category);

    index.push({
      id: exp.id,
      title: title,
      subtitle: `${category} • ${exp.location}`,
      category: 'Experiences',
      url: `/${locale}/experiences/${exp.id}`
    });
  });

  // Static destinations for the newer feature pages (the items they list —
  // places, posts — are DB-backed and merged in client-side via /api/search).
  index.push({
    id: 'tours-custom',
    title: 'Захиалгат аялал',
    subtitle: '4 асуултаар хувийн өдрийн төлөвлөгөө',
    category: 'Tours',
    url: `/${locale}/tours/custom`
  });
  index.push({
    id: 'guides-apply',
    title: 'Хөтөч болох',
    subtitle: 'Нутгийн хөтөчөөр бүртгүүлэх',
    category: 'Tours',
    url: `/${locale}/guides/apply`
  });

  // Add Phrases
  phraseCollections.forEach(collection => {
    collection.phrases.forEach(phrase => {
      const translatedTitle = getT(`Learn.phrasebook.collections.${collection.id}.phrases.${phrase.id}.english`, phrase.english);
      index.push({
        id: phrase.id,
        title: translatedTitle,
        subtitle: `${phrase.japanese} (${phrase.romaji})`,
        category: 'Phrases',
        url: `/${locale}/learn`
      });
    });
  });


  return index;
};
