// Mapping between alerts.in.ua API region UIDs and project region IDs
// API returns numeric UIDs, project uses string identifiers

// Oblast name (Ukrainian) to project region ID mapping
const OBLAST_NAME_TO_PROJECT_REGION: Record<string, string> = {
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
  "Автономна Республіка Крим": "crimea",
  "м. Севастополь": "sevastopol",
  "м. Київ": "kyiv-city",
};

// alerts.in.ua UID to project region ID mapping
const UID_TO_PROJECT_REGION: Record<number, string> = {
  3: "khmelnytskyi", // Khmelnytskyi Oblast
  4: "vinnytsia", // Vinnytsia Oblast
  5: "rivne", // Rivne Oblast
  8: "volyn", // Volyn Oblast
  9: "dnipro", // Dnipropetrovsk Oblast
  10: "zhytomyr", // Zhytomyr Oblast
  11: "zakarpattia", // Zakarpattia Oblast
  12: "zaporizhzhia", // Zaporizhzhia Oblast
  13: "ivano-frankivsk", // Ivano-Frankivsk Oblast
  14: "kyiv-oblast", // Kyiv Oblast
  15: "kirovohrad", // Kirovohrad Oblast
  16: "luhansk", // Luhansk Oblast (occupied)
  17: "mykolaiv", // Mykolaiv Oblast
  18: "odesa", // Odesa Oblast
  19: "poltava", // Poltava Oblast
  20: "sumy", // Sumy Oblast
  21: "ternopil", // Ternopil Oblast
  22: "kharkiv", // Kharkiv Oblast
  23: "kherson", // Kherson Oblast
  24: "cherkasy", // Cherkasy Oblast
  25: "chernihiv", // Chernihiv Oblast
  26: "chernivtsi", // Chernivtsi Oblast
  27: "lviv", // Lviv Oblast
  28: "donetsk", // Donetsk Oblast
  29: "crimea", // Crimea (occupied)
  30: "sevastopol", // Sevastopol (occupied)
  31: "kyiv-city", // Kyiv City
};

// Convert API UID to project ID
export function uidToProjectRegionId(uid: number | string): string | null {
  const numericUid = typeof uid === "string" ? parseInt(uid, 10) : uid;
  return UID_TO_PROJECT_REGION[numericUid] ?? null;
}

// Get all API UIDs
export function getAllUids(): number[] {
  return Object.keys(UID_TO_PROJECT_REGION).map(Number);
}

// Convert oblast name to project ID
export function oblastNameToProjectRegionId(
  oblastName: string | undefined,
): string | null {
  if (!oblastName) return null;
  return OBLAST_NAME_TO_PROJECT_REGION[oblastName] ?? null;
}
