// Mapping from GeoJSON region names to project region IDs
// Based on src/features/alerts/utils/region-mapping.ts and src/data/regions.ts

const REGION_NAME_TO_ID: Record<string, string> = {
  // Standard oblasts
  "Хмельницька область": "khmelnytskyi",
  "Вінницька область": "vinnytsia",
  "Рівненська область": "rivne",
  "Волинська область": "volyn",
  "Дніпропетровська область": "dnipro",
  "Житомирська область": "zhytomyr",
  "Закарпатська область": "zakarpattia",
  "Запорізька область": "zaporizhzhia",
  "Івано-Франківська область": "ivano-frankivsk",
  "Київська область": "kyiv-oblast",
  "Кіровоградська область": "kirovohrad",
  "Луганська область": "luhansk",
  "Миколаївська область": "mykolaiv",
  "Одеська область": "odesa",
  "Полтавська область": "poltava",
  "Сумська область": "sumy",
  "Тернопільська область": "ternopil",
  "Харківська область": "kharkiv",
  "Херсонська область": "kherson",
  "Черкаська область": "cherkasy",
  "Чернігівська область": "chernihiv",
  "Чернівецька область": "chernivtsi",
  "Львівська область": "lviv",
  "Донецька область": "donetsk",

  // Occupied territories
  "Автономна Республіка Крим": "crimea",
  Севастополь: "sevastopol",
  "м. Севастополь": "sevastopol",

  // Kyiv city
  "м. Київ": "kyiv-city",
  Київ: "kyiv-city",
};

/**
 * Map GeoJSON region name to project region ID
 */
export function mapRegionNameToId(regionName: string): string | null {
  return REGION_NAME_TO_ID[regionName] ?? null;
}
