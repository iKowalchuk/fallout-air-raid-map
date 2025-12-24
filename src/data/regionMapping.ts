// Mapping between API region IDs (alerts.com.ua) and project region IDs
// API returns numeric IDs, project uses string identifiers

export const API_TO_PROJECT_REGION: Record<number, string> = {
  1: "vinnytsia",       // Vinnytsia Oblast
  2: "volyn",           // Volyn Oblast
  3: "dnipro",          // Dnipropetrovsk Oblast
  4: "donetsk",         // Donetsk Oblast
  5: "zhytomyr",        // Zhytomyr Oblast
  6: "zakarpattia",     // Zakarpattia Oblast
  7: "zaporizhzhia",    // Zaporizhzhia Oblast
  8: "ivano-frankivsk", // Ivano-Frankivsk Oblast
  9: "kyiv-oblast",     // Kyiv Oblast
  10: "kirovohrad",     // Kirovohrad Oblast
  11: "luhansk",        // Luhansk Oblast
  12: "lviv",           // Lviv Oblast
  13: "mykolaiv",       // Mykolaiv Oblast
  14: "odesa",          // Odesa Oblast
  15: "poltava",        // Poltava Oblast
  16: "rivne",          // Rivne Oblast
  17: "sumy",           // Sumy Oblast
  18: "ternopil",       // Ternopil Oblast
  19: "kharkiv",        // Kharkiv Oblast
  20: "kherson",        // Kherson Oblast
  21: "khmelnytskyi",   // Khmelnytskyi Oblast
  22: "cherkasy",       // Cherkasy Oblast
  23: "chernivtsi",     // Chernivtsi Oblast
  24: "chernihiv",      // Chernihiv Oblast
  25: "kyiv-city",      // Kyiv City
};

// Reverse mapping: project ID → API ID
export const PROJECT_TO_API_REGION: Record<string, number> = Object.fromEntries(
  Object.entries(API_TO_PROJECT_REGION).map(([apiId, projectId]) => [projectId, Number(apiId)])
);

// Regions that exist in project but not in API
export const REGIONS_WITHOUT_API: string[] = ["crimea", "sevastopol"];

// Convert API region ID to project ID
export function apiToProjectRegionId(apiId: number): string | null {
  return API_TO_PROJECT_REGION[apiId] ?? null;
}

// Convert project ID to API region ID
export function projectToApiRegionId(projectId: string): number | null {
  return PROJECT_TO_API_REGION[projectId] ?? null;
}
