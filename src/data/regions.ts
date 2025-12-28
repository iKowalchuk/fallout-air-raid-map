import type { Region } from "@/schemas";

/**
 * Occupied territories that are always shown as alert (red) on the map.
 * These regions don't receive alerts from the API but should be visually
 * distinguished as dangerous zones.
 */
const ALWAYS_ALERT_REGIONS = new Set(["crimea", "sevastopol"]);

/**
 * Helper to check if a region is currently alerted (from API or always-alert)
 */
export function isRegionAlerted(
  regionId: string,
  alertedRegions: string[],
): boolean {
  return (
    alertedRegions.includes(regionId) || ALWAYS_ALERT_REGIONS.has(regionId)
  );
}

const UKRAINE_REGIONS: Region[] = [
  // Left side - Western regions (north to south, 13 regions)
  { id: "volyn", nameUa: "Волинська", nameEn: "Volyn", position: "left" },
  { id: "rivne", nameUa: "Рівненська", nameEn: "Rivne", position: "left" },
  { id: "lviv", nameUa: "Львівська", nameEn: "Lviv", position: "left" },
  {
    id: "ternopil",
    nameUa: "Тернопільська",
    nameEn: "Ternopil",
    position: "left",
  },
  {
    id: "khmelnytskyi",
    nameUa: "Хмельницька",
    nameEn: "Khmelnytskyi",
    position: "left",
  },
  {
    id: "zakarpattia",
    nameUa: "Закарпатська",
    nameEn: "Zakarpattia",
    position: "left",
  },
  {
    id: "ivano-frankivsk",
    nameUa: "Івано-Франківська",
    nameEn: "Ivano-Frankivsk",
    position: "left",
  },
  {
    id: "chernivtsi",
    nameUa: "Чернівецька",
    nameEn: "Chernivtsi",
    position: "left",
  },
  {
    id: "vinnytsia",
    nameUa: "Вінницька",
    nameEn: "Vinnytsia",
    position: "left",
  },
  {
    id: "kirovohrad",
    nameUa: "Кіровоградська",
    nameEn: "Kirovohrad",
    position: "left",
  },
  {
    id: "mykolaiv",
    nameUa: "Миколаївська",
    nameEn: "Mykolaiv",
    position: "left",
  },
  { id: "odesa", nameUa: "Одеська", nameEn: "Odesa", position: "left" },
  { id: "kherson", nameUa: "Херсонська", nameEn: "Kherson", position: "left" },

  // Right side - Eastern regions (north to south, 14 regions)
  {
    id: "chernihiv",
    nameUa: "Чернігівська",
    nameEn: "Chernihiv",
    position: "right",
  },
  { id: "sumy", nameUa: "Сумська", nameEn: "Sumy", position: "right" },
  {
    id: "zhytomyr",
    nameUa: "Житомирська",
    nameEn: "Zhytomyr",
    position: "right",
  },
  {
    id: "kyiv-oblast",
    nameUa: "Київська",
    nameEn: "Kyiv Oblast",
    position: "right",
  },
  {
    id: "kyiv-city",
    nameUa: "м. Київ",
    nameEn: "Kyiv City",
    position: "right",
  },
  { id: "poltava", nameUa: "Полтавська", nameEn: "Poltava", position: "right" },
  { id: "kharkiv", nameUa: "Харківська", nameEn: "Kharkiv", position: "right" },
  { id: "luhansk", nameUa: "Луганська", nameEn: "Luhansk", position: "right" },
  {
    id: "cherkasy",
    nameUa: "Черкаська",
    nameEn: "Cherkasy",
    position: "right",
  },
  {
    id: "dnipro",
    nameUa: "Дніпропетровська",
    nameEn: "Dnipro",
    position: "right",
  },
  { id: "donetsk", nameUa: "Донецька", nameEn: "Donetsk", position: "right" },
  {
    id: "zaporizhzhia",
    nameUa: "Запорізька",
    nameEn: "Zaporizhzhia",
    position: "right",
  },
  { id: "crimea", nameUa: "АР Крим", nameEn: "Crimea", position: "right" },
  {
    id: "sevastopol",
    nameUa: "м. Севастополь",
    nameEn: "Sevastopol",
    position: "right",
  },
];

export function getRegionById(id: string): Region | undefined {
  return UKRAINE_REGIONS.find((r) => r.id === id);
}

export function getLeftRegions(): Region[] {
  return UKRAINE_REGIONS.filter((r) => r.position === "left");
}

export function getRightRegions(): Region[] {
  return UKRAINE_REGIONS.filter((r) => r.position === "right");
}

export function getAllRegions(): Region[] {
  return UKRAINE_REGIONS;
}
