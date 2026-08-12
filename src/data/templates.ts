import { ItemType } from "@/components/planner/Timeline";

/**
 * A template activity stores a relative day index rather than a calendar date,
 * so templates never expire and item dates always agree with whatever start
 * date the planner applies. See `src/lib/planner/templateDates.ts`.
 */
export type TemplateActivity = Omit<ItemType, "date"> & {
  /** 0 = arrival day. Must stay below the template's `duration`. */
  dayOffset: number;
};

export interface SampleItinerary {
  id: string;
  duration: number; // Days
  heroImage: string;
  basePrice: number;
  activities: TemplateActivity[];
}

export const SAMPLE_ITINERARIES: SampleItinerary[] = [
  {
    id: "golden-route",
    duration: 14,
    heroImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200", // Kyoto pagoda
    basePrice: 285000,
    activities: [
      // Өдөр 1 — Токио руу ирэх
      { id: "gr-1", title: "Наритад газардах", dayOffset: 0, type: "flight", location: "Нарита олон улсын нисэх буудал", cost: 0, lat: 35.7720, lng: 140.3929, notes: "Visit Japan Web-д урьдчилан бүртгүүлбэл гаалийн дараалал богиносно. QR кодоо утсандаа хадгалаарай." },
      { id: "gr-2", title: "JR Pass идэвхжүүлэх", dayOffset: 0, type: "ticket", location: "Нарита JR төв", cost: 80000, lat: 35.7720, lng: 140.3929, notes: "14 хоногийн энгийн JR Pass. Идэвхжүүлсэн өдрөөс тоологдоно, тиймээс ирсэн өдрөө нээх нь хамгийн ашигтай." },
      { id: "gr-3", title: "Narita Express-ээр хот руу", dayOffset: 0, type: "train", location: "Токио станц", cost: 0, lat: 35.6812, lng: 139.7671, notes: "JR Pass-д багтана. 60 орчим минут. Суудал захиалах шаардлагатай ч төлбөргүй." },
      { id: "gr-4", title: "Токио дахь буудал (4 шөнө)", dayOffset: 0, type: "hotel", location: "Асакүса", cost: 36000, lat: 35.7145, lng: 139.7925, notes: "4 шөнийн нийт үнэ. Асакүса нь Гинза, Асакүса метроны шугамд ойр, төвөөс хямд." },
      { id: "gr-5", title: "Өдөр тутмын хоол ба конбини", dayOffset: 0, type: "food", location: "Япон даяар", cost: 12000, lat: 35.6812, lng: 139.7671, notes: "14 хоногийн өглөөний цай, үдийн хоол, ундааны ойролцоо зардал. 7-Eleven, Lawson, FamilyMart хямд бөгөөд чанартай." },

      // Өдөр 2 — Баруун Токио
      { id: "gr-6", title: "Мэйжи сүм ба Ёёоги цэцэрлэг", dayOffset: 1, type: "culture", location: "Мэйжи Жингү", cost: 0, lat: 35.6764, lng: 139.6993, notes: "Нар мандахаас нээлттэй. Өглөө эрт очвол бараг хүнгүй. Модны навчис 11-р сард шарладаг." },
      { id: "gr-7", title: "Харажүкү Такэшита гудамж", dayOffset: 1, type: "shopping", location: "Харажүкү", cost: 0, lat: 35.6702, lng: 139.7027, notes: "Амралтын өдөр маш их хүнтэй. Крепе амтлаарай." },
      { id: "gr-8", title: "Шибүяа уулзвар ба Хачико", dayOffset: 1, type: "spot", location: "Шибүяа уулзвар", cost: 0, lat: 35.6595, lng: 139.7004, notes: "Дээрээс харах бол Shibuya Sky-гийн тасалбарыг онлайнаар урьдчилан ав — нар жаргах цаг хамгийн эрт дуусдаг." },
      { id: "gr-9", title: "Ичиран рамен", dayOffset: 1, type: "food", location: "Шибүяа", cost: 1200, lat: 35.6612, lng: 139.7010, notes: "Тус бүр тусгаарлагдсан ширээтэй. Автоматаас тасалбар аваад маягт дээрээ хүслээ тэмдэглэнэ." },
      { id: "gr-10", title: "Шинжүкү Омоидэ Ёкочо оройн хоол", dayOffset: 1, type: "meal", location: "Омоидэ Ёкочо", cost: 3500, lat: 35.6938, lng: 139.6994, notes: "Жижиг якитори газрууд. Бэлэн мөнгө авч яв — зарим нь карт авахгүй." },
      { id: "gr-11", title: "Suica карт цэнэглэх", dayOffset: 1, type: "transport", location: "Токио", cost: 5000, lat: 35.6812, lng: 139.7671, notes: "JR Pass метронд хамаарахгүй тул Suica/Pasmo зайлшгүй хэрэгтэй. 14 хоногийн ойролцоо дүн." },

      // Өдөр 3 — Зүүн Токио
      { id: "gr-12", title: "Сэнсо-жи сүм ба Накамисэ", dayOffset: 2, type: "culture", location: "Сэнсо-жи", cost: 0, lat: 35.7148, lng: 139.7967, notes: "Сүмийн талбай 24 цаг нээлттэй. 8:00-аас өмнө очвол Накамисэ гудамж хоосон, зураг сайхан гарна." },
      { id: "gr-13", title: "Токио Скайтри ажиглалтын тавцан", dayOffset: 2, type: "landmark", location: "Токио Скайтри", cost: 2700, lat: 35.7101, lng: 139.8107, notes: "Тэнгэр цэлмэг өдөр Фүжи уул харагдана. Онлайн тасалбар хямд бөгөөд дараалалгүй." },
      { id: "gr-14", title: "Цүкижи гадна зах", dayOffset: 2, type: "food", location: "Цүкижи", cost: 2500, lat: 35.6654, lng: 139.7707, notes: "9:00-11:00 цагт хамгийн идэвхтэй. Ням, Даваа гарагт олон дэлгүүр хаалттай." },
      { id: "gr-15", title: "teamLab Planets", dayOffset: 2, type: "activity", location: "Тоёосү", cost: 3900, lat: 35.6486, lng: 139.7906, notes: "Хөл нүцгэн ордог, өвдөг хүртэл ус руу ордог тул шуумгалж болох өмд өмс. Тасалбар заавал урьдчилан." },

      // Өдөр 4 — Камакүра
      { id: "gr-16", title: "Камакүра руу галт тэрэг", dayOffset: 3, type: "train", location: "Камакүра станц", cost: 0, lat: 35.3192, lng: 139.5468, notes: "JR Yokosuka шугам, JR Pass-д багтана. Токио станцаас 1 цаг." },
      { id: "gr-17", title: "Камакүрагийн Их Будда", dayOffset: 3, type: "landmark", location: "Котокү-ин", cost: 300, lat: 35.3168, lng: 139.5357, notes: "Хөшөөний дотор орох бол нэмэлт 50 иен. 17:00 цагт хаана." },
      { id: "gr-18", title: "Хококү-жи хулсан сүм", dayOffset: 3, type: "nature", location: "Хококү-жи", cost: 400, lat: 35.3216, lng: 139.5636, notes: "Хулсан ойд суугаад матча цай уух боломжтой (нэмэлт 600 иен). Арашиямагаас хүн олон дахин цөөн." },
      { id: "gr-19", title: "Эношимад нар жаргах", dayOffset: 3, type: "photo", location: "Эношима", cost: 0, lat: 35.2991, lng: 139.4803, notes: "Цэлмэг өдөр Фүжи уулын дэвсгэр дээр нар жаргана. Энодэн галт тэрэг далайн эрэг дагуу явдаг." },

      // Өдөр 5 — Хаконэ руу
      { id: "gr-20", title: "Хаконэ руу шилжих", dayOffset: 4, type: "train", location: "Одавара станц", cost: 0, lat: 35.2564, lng: 139.1552, notes: "Токиогоос Кодама шинкансэнээр 35 минут, JR Pass-д багтана. Нозоми-д JR Pass хүчингүй." },
      { id: "gr-21", title: "Хаконэ Фрий Пасс авах", dayOffset: 4, type: "ticket", location: "Одавара станц", cost: 6100, lat: 35.2564, lng: 139.1552, notes: "2 хоногийн пасс. Уулын галт тэрэг, дүүжин зам, усан онгоц, автобус бүгд багтана. JR Pass Хаконэд хамаарахгүй." },
      { id: "gr-22", title: "Хаконэ Задгай агаарын музей", dayOffset: 4, type: "culture", location: "Chokoku-no-mori", cost: 2000, lat: 35.2447, lng: 139.0500, notes: "Пикассогийн тусдаа павильонтой. Уулын навчисны өнгө 11-р сарын эхээр хамгийн сайхан." },
      { id: "gr-23", title: "Рёкан дээр буудаллах (2 шөнө)", dayOffset: 4, type: "hotel", location: "Хаконэ-Юмото", cost: 26000, lat: 35.2324, lng: 139.1069, notes: "2 шөнийн нийт үнэ, онсэнтэй рёкан. Шивээстэй бол хувийн онсэн (kashikiri) урьдчилан захиалаарай." },
      { id: "gr-24", title: "Кайсэки оройн хоол", dayOffset: 4, type: "meal", location: "Хаконэ-Юмото", cost: 8000, lat: 35.2324, lng: 139.1069, notes: "Рёканы уламжлалт олон зүйлт хоол, ихэвчлэн 18:00-19:00 цагт. Юкатагаа өмсөөд очно." },

      // Өдөр 6 — Хаконэ
      { id: "gr-25", title: "Оwakudani галт уулын хөндий", dayOffset: 5, type: "nature", location: "Оwakudani", cost: 0, lat: 35.2447, lng: 139.0197, notes: "Фрий Пасст багтана. Хүхрийн уураар чанасан хар өндөг идвэл 7 жил нас нэмнэ гэдэг. Амьсгалын замын өвчтэй бол болгоомжил." },
      { id: "gr-26", title: "Аши нуурын усан онгоц", dayOffset: 5, type: "activity", location: "Аши нуур", cost: 0, lat: 35.2017, lng: 139.0232, notes: "Фрий Пасст багтана. Цэлмэг өдөр Фүжи уул усан дээр тусаж харагдана." },
      { id: "gr-27", title: "Хаконэ жинжагийн усан тори", dayOffset: 5, type: "photo", location: "Хаконэ жинжа", cost: 0, lat: 35.2045, lng: 139.0256, notes: "Усан дээрх улаан тори. Зураг авах дараалал өдөр дунд урт болдог, өглөө эрт оч." },
      { id: "gr-28", title: "Онсэнд орох", dayOffset: 5, type: "activity", location: "Хаконэ", cost: 1500, lat: 35.2324, lng: 139.1069, notes: "Усанд орохын өмнө биеэ бүрэн угаана. Алчуураа усанд хийхгүй. Шивээстэй хүнийг зарим онсэн оруулахгүй." },

      // Өдөр 7 — Киото руу
      { id: "gr-29", title: "Киото руу шинкансэн", dayOffset: 6, type: "train", location: "Киото станц", cost: 0, lat: 34.9858, lng: 135.7588, notes: "Одаварагаас Хикари 2 цаг, JR Pass-д багтана. Фүжи уул баруун талын D/E суудлаас харагдана." },
      { id: "gr-30", title: "Киото дахь буудал (4 шөнө)", dayOffset: 6, type: "hotel", location: "Киото станцын орчим", cost: 34000, lat: 34.9858, lng: 135.7588, notes: "4 шөнийн нийт үнэ. Станцын орчим автобус, галт тэрэгний холболт хамгийн сайн." },
      { id: "gr-31", title: "Хотын автобус ба метроны зардал", dayOffset: 6, type: "transport", location: "Киото", cost: 2400, lat: 34.9858, lng: 135.7588, notes: "Киотод автобус гол тээвэр болдог. ICOCA болон Suica хоёулаа ажиллана." },
      { id: "gr-32", title: "Хигашияма оройн зугаалга", dayOffset: 6, type: "culture", location: "Хигашияма", cost: 0, lat: 34.9948, lng: 135.7850, notes: "Нэнэ-но-мичи, Санэн-зака гудамж орой гэрэлтүүлэгтэй, өдрөөс хамаагүй чимээгүй." },

      // Өдөр 8 — Киото зүүн
      { id: "gr-33", title: "Фүшими Инари мянган тори", dayOffset: 7, type: "culture", location: "Фүшими Инари Тайшя", cost: 0, lat: 34.9671, lng: 135.7727, notes: "24 цаг нээлттэй, тасалбаргүй. 7:00-аас өмнө очвол хүнгүй зураг авна. Оргил хүртэл 2-3 цаг." },
      { id: "gr-34", title: "Фүшимигийн сакэ музей", dayOffset: 7, type: "activity", location: "Гэккэйкан Окура", cost: 400, lat: 34.9315, lng: 135.7614, notes: "Тасалбарт амталгаа багтана. Фүшими бол Японы хамгийн том сакэ үйлдвэрлэлийн бүс." },
      { id: "gr-35", title: "Кийомизү-дэра", dayOffset: 7, type: "culture", location: "Кийомизү-дэра", cost: 500, lat: 34.9949, lng: 135.7850, notes: "Намрын навчисны шөнийн гэрэлтүүлэг 11-р сард тусдаа тасалбартай." },
      { id: "gr-36", title: "Кабуки үзвэр (нэг үзэгдэл)", dayOffset: 7, type: "music", location: "Минами-за театр", cost: 2000, lat: 35.0036, lng: 135.7723, notes: "Нэг үзэгдлийн тасалбар хямд. Англи хэлний чихэвч түрээслэх боломжтой." },
      { id: "gr-37", title: "Гион гэйшагийн хороолол", dayOffset: 7, type: "nightlife", location: "Гион", cost: 0, lat: 35.0037, lng: 135.7750, notes: "Гэйко, майкогийн зургийг зөвшөөрөлгүй авахыг хориглодог бөгөөд торгууль ногдуулдаг." },

      // Өдөр 9 — Киото баруун
      { id: "gr-38", title: "Арашияма хулсан ой", dayOffset: 8, type: "nature", location: "Арашияма хулсан төгөл", cost: 0, lat: 35.0158, lng: 135.6706, notes: "8:00-аас өмнө очвол чимээгүй. Тэнгүү гүүр, сармагчны цэцэрлэг ойрхон." },
      { id: "gr-39", title: "Кинкаку-жи алтан павильон", dayOffset: 8, type: "landmark", location: "Кинкаку-жи", cost: 500, lat: 35.0394, lng: 135.7292, notes: "9:00 цагт нээнэ. Тасалбар нь сахиус хэлбэртэй, дурсгал болгон авч үлддэг." },
      { id: "gr-40", title: "Рёан-жи чулуун цэцэрлэг", dayOffset: 8, type: "culture", location: "Рёан-жи", cost: 600, lat: 35.0345, lng: 135.7182, notes: "15 чулууны 14 нь л аль ч цэгээс нэг зэрэг харагддаг." },
      { id: "gr-41", title: "Чайны ёслолын хичээл", dayOffset: 8, type: "activity", location: "Киото", cost: 4000, lat: 35.0116, lng: 135.7681, notes: "Урьдчилан захиална. Англи хэлтэй хөтөчтэй хувилбар бий, кимоно түрээслэх нэмэлт үйлчилгээтэй." },
      { id: "gr-42", title: "Шожин рёори оройн хоол", dayOffset: 8, type: "meal", location: "Киото", cost: 3500, lat: 34.9948, lng: 135.7850, notes: "Сүмийн уламжлалт ногооны хоол. Вегетариан, веган хүнд тохиромжтой." },

      // Өдөр 10 — Нара
      { id: "gr-43", title: "Нара руу галт тэрэг", dayOffset: 9, type: "train", location: "Нара станц", cost: 0, lat: 34.6851, lng: 135.8048, notes: "JR Нара шугам, Киотогоос 45 минут, JR Pass-д багтана." },
      { id: "gr-44", title: "Нара парк ба буга", dayOffset: 9, type: "nature", location: "Нара парк", cost: 200, lat: 34.6851, lng: 135.8048, notes: "Буганы крекер (шика сэнбэй) 200 иен. Хоол барьвал буга бөхийж мэндчилдэг. Уут, газрын зургаа нуу — буга иддэг." },
      { id: "gr-45", title: "Тодай-жи их Будда", dayOffset: 9, type: "landmark", location: "Тодай-жи", cost: 800, lat: 34.6889, lng: 135.8398, notes: "Дэлхийн хамгийн том модон барилгуудын нэг. 17:00 цагт хаана." },
      { id: "gr-46", title: "Нишики захын амталгаа", dayOffset: 9, type: "food", location: "Нишики зах", cost: 2000, lat: 35.0050, lng: 135.7648, notes: "Киото буцаж ирээд. \"Киотогийн гал зуух\" гэдэг. Явж байхдаа идэхийг хориглосон дэлгүүр цөөнгүй." },

      // Өдөр 11 — Осака руу
      { id: "gr-47", title: "Осака руу шилжих", dayOffset: 10, type: "train", location: "Осака Намба", cost: 0, lat: 34.6670, lng: 135.5004, notes: "JR Киото шугамаар 30 минут, JR Pass-д багтана." },
      { id: "gr-48", title: "Осака дахь буудал (3 шөнө)", dayOffset: 10, type: "hotel", location: "Намба", cost: 14000, lat: 34.6670, lng: 135.5004, notes: "3 шөнийн нийт үнэ. Намба нь Дотонбори болон Кансай нисэх буудлын холболтод ойр." },
      { id: "gr-49", title: "Осака метроны зардал", dayOffset: 10, type: "transport", location: "Осака", cost: 1500, lat: 34.6670, lng: 135.5004, notes: "JR Pass Осака хотын метронд хамаарахгүй." },
      { id: "gr-50", title: "Дотонборийн шөнийн гэрэл", dayOffset: 10, type: "nightlife", location: "Дотонбори", cost: 3000, lat: 34.6687, lng: 135.5013, notes: "Глико гүйгчийн самбар. Такояки, окономияки, кушикацу амтлаарай — кушикацуг хоёр дахин дүрэхийг хориглоно." },

      // Өдөр 12 — Осака
      { id: "gr-51", title: "Осака цайз ба цэцэрлэг", dayOffset: 11, type: "castle", location: "Осака цайз", cost: 1200, lat: 34.6873, lng: 135.5262, notes: "Цайзын хүрээлэн үнэгүй, дотоод музей тасалбартай. Намрын навчис 11-р сард гоё." },
      { id: "gr-52", title: "Күромон зах", dayOffset: 11, type: "market", location: "Күромон Ичиба", cost: 0, lat: 34.6653, lng: 135.5060, notes: "Шинэ далайн хоолыг газар дээр нь шарж өгнө. Өглөө 9-10 цагт хамгийн сонголт сайтай." },
      { id: "gr-53", title: "Үмэда Sky Building", dayOffset: 11, type: "spot", location: "Үмэда", cost: 1500, lat: 34.7052, lng: 135.4899, notes: "Нээлттэй тэнгэрийн цэцэрлэг. Нар жаргах цагаас 30 минутын өмнө очвол хамгийн сайхан." },
      { id: "gr-54", title: "Вагю оройн хоол", dayOffset: 11, type: "meal", location: "Осака", cost: 6000, lat: 34.6687, lng: 135.5013, notes: "Кобэ болон Мацүсака үхрийн мах. Сайн газрууд урьдчилсан захиалгатай." },

      // Өдөр 13 — Хирошима ба Мияжима
      { id: "gr-55", title: "Хирошима руу шинкансэн", dayOffset: 12, type: "train", location: "Хирошима станц", cost: 0, lat: 34.3978, lng: 132.4756, notes: "Санё шинкансэн Хикари 1 цаг 40 минут, JR Pass-д багтана. Өглөө 7-8 цагт гарвал бүх зүйлд амжина." },
      { id: "gr-56", title: "Энх тайвны дурсгалын цэцэрлэг ба музей", dayOffset: 12, type: "landmark", location: "Энх тайвны дурсгалын цэцэрлэг", cost: 200, lat: 34.3955, lng: 132.4536, notes: "Музей 200 иен. Сэтгэл хөдөлгөм, хүнд агуулгатай — 2 цаг гаргаарай." },
      { id: "gr-57", title: "Мияжима руу гатлага онгоц", dayOffset: 12, type: "transport", location: "Мияжимагүчи", cost: 0, lat: 34.3033, lng: 132.3033, notes: "JR-ийн гатлага онгоц JR Pass-д багтана. 10 минут." },
      { id: "gr-58", title: "Ицүкүшима сүм ба усан тори", dayOffset: 12, type: "culture", location: "Ицүкүшима жинжа", cost: 300, lat: 34.2959, lng: 132.3197, notes: "Далайн түрлэгийн цагийг урьдчилан шалга — өндөр түрлэгийн үед тори усан дээр хөвж байгаа мэт харагдана." },
      { id: "gr-59", title: "Миясэн уулын дүүжин зам", dayOffset: 12, type: "nature", location: "Мисэн уул", cost: 2000, lat: 34.2794, lng: 132.3197, notes: "Оргилд зэрлэг сармагчин, буга бий. Сүүлийн буух цагийг заавал шалга, ихэвчлэн 17:00." },
      { id: "gr-60", title: "Мияжимагийн шинэ хясаа", dayOffset: 12, type: "food", location: "Омотэсандо гудамж", cost: 1500, lat: 34.2971, lng: 132.3205, notes: "Шарсан хясаа болон момижи манжү. Ихэнх дэлгүүр 17:00 цагт хаадаг." },
      { id: "gr-61", title: "Хирошима окономияки", dayOffset: 12, type: "meal", location: "Окономимүра", cost: 1800, lat: 34.3927, lng: 132.4596, notes: "Хирошимагийн хэв маяг давхарлаж хийдэг, гоймонтой — Осакагийнхаас өөр." },

      // Өдөр 14 — Буцах
      { id: "gr-62", title: "Бэлэг дурсгал ба нөөц зардал", dayOffset: 13, type: "gift", location: "Шинсайбаши", cost: 10000, lat: 34.6723, lng: 135.5013, notes: "Нөөц зардал. Дон Кихотэ 24 цаг ажилладаг, 5000 иенээс дээш tax-free боломжтой." },
      { id: "gr-63", title: "Кансай нисэх буудал руу", dayOffset: 13, type: "transport", location: "Кансай олон улсын нисэх буудал", cost: 0, lat: 34.4342, lng: 135.2328, notes: "JR Haruka экспресс JR Pass-д багтана, 75 минут. Нислэгээс 3 цагийн өмнө очиж бай." },
      { id: "gr-64", title: "Буцах нислэг", dayOffset: 13, type: "flight", location: "Кансай олон улсын нисэх буудал", cost: 0, lat: 34.4342, lng: 135.2328, notes: "Tax-free худалдан авалтын бичиг баримтаа гаальд үзүүлнэ. Барааг задлаагүй байх шаардлагатай." },
    ]
  },
  {
    id: "tokyo-deep-dive",
    duration: 7,
    heroImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200", // Tokyo skyline
    basePrice: 120000,
    activities: [
      { id: "tdd-1", title: "Akihabara Tech Culture", dayOffset: 0, type: "shopping", location: "Electric Town", cost: 0, lat: 35.6984, lng: 139.7711 },
      { id: "tdd-2", title: "Shibuya Scramble", dayOffset: 1, type: "spot", location: "Shibuya Crossing", cost: 0, lat: 35.6595, lng: 139.7004 },
      { id: "tdd-3", title: "Asakusa Senso-ji", dayOffset: 2, type: "culture", location: "Senso-ji", cost: 0, lat: 35.7148, lng: 139.7967 },
      { id: "tdd-4", title: "Nakano Broadway", dayOffset: 4, type: "shopping", location: "Nakano Broadway", cost: 0, lat: 35.7088, lng: 139.6657 }
    ]
  },
  {
    id: "kyoto-zen",
    duration: 5,
    heroImage: "https://i.pinimg.com/736x/3a/d7/fe/3ad7fe4f962de763b1e5c6b91ec04c5a.jpg", // Zen garden
    basePrice: 85000,
    activities: [
      { id: "kz-1", title: "Arashiyama Bamboo Grove", dayOffset: 0, type: "nature", location: "Bamboo Grove", cost: 0, lat: 35.0158, lng: 135.6706 },
      { id: "kz-2", title: "Ryoan-ji Zen Garden", dayOffset: 1, type: "culture", location: "Ryoan-ji", cost: 500, lat: 35.0345, lng: 135.7182 },
      { id: "kz-3", title: "Gion Evening Walk", dayOffset: 2, type: "nightlife", location: "Gion District", cost: 0, lat: 35.0037, lng: 135.7750 },
      { id: "kz-4", title: "Uji Tea Ceremony", dayOffset: 4, type: "culture", location: "Byodo-in", cost: 3000, lat: 34.8893, lng: 135.8077 }
    ]
  },
  {
    id: "classic-japan-14",
    duration: 14,
    heroImage: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=1200", // Mt Fuji & Five Lakes
    basePrice: 265000,
    activities: [
      { id: "cj-1", title: "Arrival in Tokyo", dayOffset: 0, type: "flight", location: "Haneda Airport", cost: 0, lat: 35.5494, lng: 139.7798 },
      { id: "cj-2", title: "Full day in Tokyo", dayOffset: 1, type: "spot", location: "Shibuya Crossing", cost: 0, lat: 35.6595, lng: 139.7004 },
      { id: "cj-3", title: "Day Trip to Kamakura", dayOffset: 2, type: "landmark", location: "Kamakura Daibutsu", cost: 3000, lat: 35.3168, lng: 139.5357 },
      { id: "cj-4", title: "Transfer to Mt Fuji", dayOffset: 3, type: "transport", location: "Lake Kawaguchi", cost: 4500, lat: 35.5138, lng: 138.7518 },
      { id: "cj-5", title: "Mt Fuji to Hakone", dayOffset: 4, type: "transport", location: "Hakone-Yumoto", cost: 3500, lat: 35.2324, lng: 139.1069 },
      { id: "cj-6", title: "Hakone to Kyoto", dayOffset: 5, type: "transport", location: "Kyoto Station", cost: 13000, lat: 34.9858, lng: 135.7588 },
      { id: "cj-7", title: "Fushimi Inari and Uji", dayOffset: 6, type: "culture", location: "Byodo-in Temple", cost: 600, lat: 34.8893, lng: 135.8077 },
      { id: "cj-8", title: "Arashiyama and Nara", dayOffset: 7, type: "nature", location: "Nara Park", cost: 0, lat: 34.6851, lng: 135.8048 },
      { id: "cj-9", title: "Transfer to Osaka", dayOffset: 8, type: "transport", location: "Osaka Namba", cost: 800, lat: 34.6670, lng: 135.5004 },
      { id: "cj-10", title: "Full day in Osaka", dayOffset: 9, type: "food", location: "Dotonbori", cost: 5000, lat: 34.6687, lng: 135.5013 },
      { id: "cj-11", title: "Hiroshima Day Trip", dayOffset: 10, type: "landmark", location: "Miyajima", cost: 12000, lat: 34.3027, lng: 132.3197 },
      { id: "cj-12", title: "Rest & Back to Tokyo", dayOffset: 11, type: "activity", location: "Tokyo Station", cost: 14500, lat: 35.6812, lng: 139.7671 },
      { id: "cj-13", title: "Tokyo Exploration", dayOffset: 12, type: "spot", location: "Ginza", cost: 0, lat: 35.6717, lng: 139.7650 },
      { id: "cj-14", title: "Flight out", dayOffset: 13, type: "flight", location: "Narita Airport", cost: 0, lat: 35.7720, lng: 140.3929 }
    ]
  }
];
