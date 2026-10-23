// Curated & verified reciter metadata mapped to Quran.com API v4 Recitation IDs
// Portraits are authentic Wikimedia Commons files or null for fallback calligraphy seals.
export const VERIFIED_RECITERS = [
  {
    id: 7,
    reciter_name: 'Mishari Rashid al-`Afasy',
    arabic_name: 'مشاري راشد العفاسي',
    style: 'Murattal',
    photo_url: 'https://upload.wikimedia.org/wikipedia/commons/2/24/%D0%9C%D0%B8%D1%88%D0%B0%D1%80%D0%B8_%D0%A0%D0%B0%D1%88%D0%B8%D0%B4.jpg',
    country: 'Kuwait',
    surahs_count: 114,
    bio: 'Imam of the Grand Mosque of Kuwait and internationally acclaimed Qari renowned for his melodic recitation.',
  },
  {
    id: 2,
    reciter_name: 'AbdulBaset AbdulSamad',
    arabic_name: 'عبد الباسط عبد الصمد',
    style: 'Murattal',
    photo_url: 'https://upload.wikimedia.org/wikipedia/commons/7/71/Abdul_Basit_Abd_us-Samad_in_South_Africa_in_1966_%283%29.jpg',
    country: 'Egypt',
    surahs_count: 114,
    bio: 'One of the most revered and iconic Quranic reciters in modern history, celebrated as the Voice of Heaven.',
  },
  {
    id: 1,
    reciter_name: 'AbdulBaset AbdulSamad',
    arabic_name: 'عبد الباسط عبد الصمد',
    style: 'Mujawwad',
    photo_url: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Abdul_Basit_%27Abd_us-Samad_with_King_Faisal.jpg',
    country: 'Egypt',
    surahs_count: 114,
    bio: 'The majestic Mujawwad recitation by Sheikh AbdulBaset, showcasing masterclass breath control and Tajweed.',
  },
  {
    id: 6,
    reciter_name: 'Mahmoud Khalil Al-Husary',
    arabic_name: 'محمود خليل الحصري',
    style: 'Murattal',
    photo_url: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Hussary.jpg',
    country: 'Egypt',
    surahs_count: 114,
    bio: 'Pioneer of Quranic audio recordings whose flawless articulation serves as the global standard for Tajweed.',
  },
  {
    id: 12,
    reciter_name: 'Mahmoud Khalil Al-Husary',
    arabic_name: 'محمود خليل الحصري',
    style: 'Muallim',
    photo_url: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Hussary.jpg',
    country: 'Egypt',
    surahs_count: 114,
    bio: 'Educational Muallim recitation by Sheikh Al-Husary designed for learning and mastering pronunciation.',
  },
  {
    id: 9,
    reciter_name: 'Mohamed Siddiq al-Minshawi',
    arabic_name: 'محمد صديق المنشاوي',
    style: 'Murattal',
    photo_url: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Elminshwey.jpg',
    country: 'Egypt',
    surahs_count: 114,
    bio: 'Beloved reciter renowned for his deeply emotional, introspective, and soulful Murattal cadence.',
  },
  {
    id: 8,
    reciter_name: 'Mohamed Siddiq al-Minshawi',
    arabic_name: 'محمد صديق المنشاوي',
    style: 'Mujawwad',
    photo_url: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Elminshwey.jpg',
    country: 'Egypt',
    surahs_count: 114,
    bio: 'The sorrowful, reverent Mujawwad recitation of Sheikh Al-Minshawi, touching hearts across the Muslim world.',
  },
  {
    id: 3,
    reciter_name: 'Abdur-Rahman as-Sudais',
    arabic_name: 'عبدالرحمن السديس',
    style: 'Murattal',
    photo_url: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Abdul_Rahman_Al-Sudais_-_Cropped.png',
    country: 'Saudi Arabia',
    surahs_count: 114,
    bio: 'Chief Imam and Khateeb of the Grand Mosque (Masjid al-Haram) in Makkah.',
  },
  {
    id: 10,
    reciter_name: 'Sa`ud ash-Shuraym',
    arabic_name: 'سعود الشريم',
    style: 'Murattal',
    photo_url: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Saud_Shuraim_doing_the_Khutbah.png',
    country: 'Saudi Arabia',
    surahs_count: 114,
    bio: 'Former Imam and Khateeb of the Grand Mosque in Makkah, celebrated for his moving Taraweeh prayers.',
  },
  {
    id: 4,
    reciter_name: 'Abu Bakr al-Shatri',
    arabic_name: 'أبو بكر الشاطري',
    style: 'Murattal',
    photo_url: null, // Graceful calligraphy seal fallback
    country: 'Saudi Arabia',
    surahs_count: 114,
    bio: 'Leading Saudi Qari with a calm, rhythmic, and peaceful recitation style.',
  },
  {
    id: 5,
    reciter_name: 'Hani ar-Rifai',
    arabic_name: 'هاني الرفاعي',
    style: 'Murattal',
    photo_url: null, // Graceful calligraphy seal fallback
    country: 'Saudi Arabia',
    surahs_count: 114,
    bio: 'Renowned Imam of the Anani Mosque in Jeddah, distinguished by his profoundly tearful and humble recitation.',
  },
  {
    id: 11,
    reciter_name: 'Mohamed al-Tablawi',
    arabic_name: 'محمد محمود الطبلاوي',
    style: 'Murattal',
    photo_url: null, // Graceful calligraphy seal fallback
    country: 'Egypt',
    surahs_count: 114,
    bio: 'Former Sheikh of Egyptian Reciters, famed for his strong resonance and expressive vocal mastery.',
  },
];

export const DEFAULT_RECITER = VERIFIED_RECITERS[0]; // Mishari Rashid Al-Afasy

export const getReciterById = (id) => {
  const numId = Number(id);
  return VERIFIED_RECITERS.find((r) => r.id === numId) || {
    id: numId,
    reciter_name: `Reciter ${id}`,
    arabic_name: 'قارئ كريم',
    style: 'Murattal',
    photo_url: null,
    surahs_count: 114,
  };
};
