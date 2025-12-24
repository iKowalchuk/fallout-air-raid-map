import type { Region } from "@/schemas";

const UKRAINE_REGIONS: Region[] = [
  // Left side regions (Western Ukraine)
  { id: "kyiv-city", nameUa: "м. Київ", nameEn: "Kyiv City", position: "left" },
  {
    id: "chernihiv",
    nameUa: "Чернігівська",
    nameEn: "Chernihiv",
    position: "left",
  },
  {
    id: "chernivtsi",
    nameUa: "Чернівецька",
    nameEn: "Chernivtsi",
    position: "left",
  },
  { id: "cherkasy", nameUa: "Черкаська", nameEn: "Cherkasy", position: "left" },
  {
    id: "khmelnytskyi",
    nameUa: "Хмельницька",
    nameEn: "Khmelnytskyi",
    position: "left",
  },
  { id: "kherson", nameUa: "Херсонська", nameEn: "Kherson", position: "left" },
  {
    id: "ternopil",
    nameUa: "Тернопільська",
    nameEn: "Ternopil",
    position: "left",
  },
  { id: "sumy", nameUa: "Сумська", nameEn: "Sumy", position: "left" },
  { id: "rivne", nameUa: "Рівненська", nameEn: "Rivne", position: "left" },
  { id: "poltava", nameUa: "Полтавська", nameEn: "Poltava", position: "left" },
  { id: "odesa", nameUa: "Одеська", nameEn: "Odesa", position: "left" },
  {
    id: "mykolaiv",
    nameUa: "Миколаївська",
    nameEn: "Mykolaiv",
    position: "left",
  },

  // Right side regions (Eastern Ukraine)
  { id: "lviv", nameUa: "Львівська", nameEn: "Lviv", position: "right" },
  { id: "luhansk", nameUa: "Луганська", nameEn: "Luhansk", position: "right" },
  {
    id: "kirovohrad",
    nameUa: "Кіровоградська",
    nameEn: "Kirovohrad",
    position: "right",
  },
  {
    id: "kyiv-oblast",
    nameUa: "Київська",
    nameEn: "Kyiv Oblast",
    position: "right",
  },
  {
    id: "zaporizhzhia",
    nameUa: "Запорізька",
    nameEn: "Zaporizhzhia",
    position: "right",
  },
  {
    id: "zakarpattia",
    nameUa: "Закарпатська",
    nameEn: "Zakarpattia",
    position: "right",
  },
  {
    id: "ivano-frankivsk",
    nameUa: "Івано-Франківська",
    nameEn: "Ivano-Frankivsk",
    position: "right",
  },
  { id: "donetsk", nameUa: "Донецька", nameEn: "Donetsk", position: "right" },
  {
    id: "dnipro",
    nameUa: "Дніпропетровська",
    nameEn: "Dnipro",
    position: "right",
  },
  { id: "volyn", nameUa: "Волинська", nameEn: "Volyn", position: "right" },
  {
    id: "vinnytsia",
    nameUa: "Вінницька",
    nameEn: "Vinnytsia",
    position: "right",
  },
  { id: "kharkiv", nameUa: "Харківська", nameEn: "Kharkiv", position: "right" },
  {
    id: "zhytomyr",
    nameUa: "Житомирська",
    nameEn: "Zhytomyr",
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
