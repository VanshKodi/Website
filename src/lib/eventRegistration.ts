// Gauntlet event RSVPs land in their OWN Google Sheet / tab — never the
// club-membership sheet from registration.ts. To wire it up:
//   1. Create a new Google Sheet (or a new 'Gauntlet' tab) for event RSVPs.
//   2. Extensions → Apps Script, paste the snippet below, deploy as a Web app
//      (Execute as: Me, Who has access: Anyone), and paste the /exec URL into
//      GAUNTLET_SHEET_WEBHOOK_URL.
//   3. Until then the form runs in demo mode: RSVPs are kept in localStorage
//      (key 'cliqueGauntletRegistrations') so the page still works.
//
// Apps Script for the Gauntlet sheet:
// ```javascript
// function doPost(e) {
//   const ss = SpreadsheetApp.getActiveSpreadsheet();
//   let sheet = ss.getSheetByName('Gauntlet');
//   if (!sheet) sheet = ss.insertSheet('Gauntlet');
//   if (sheet.getLastRow() === 0) {
//     sheet.appendRow(['Timestamp', 'Name', 'Email', 'Referral']);
//   }
//   const p = e.parameter;
//   sheet.appendRow([new Date(), p.name, p.email, p.referral]);
//   return ContentService
//     .createTextOutput(JSON.stringify({ ok: true }))
//     .setMimeType(ContentService.MimeType.JSON);
// }
// ```

// This URL ships inside the client bundle (any visitor can read it in
// devtools), so it is not a secret. It is hardcoded as the default so that
// every build works with zero env vars - GitHub Pages builds have none, and
// an empty URL silently drops RSVPs into localStorage demo mode instead of
// the Sheet (same approach as registration.ts).
// Optional override, in case the sheet is ever replaced:
//   local dev → `.env.local` (gitignored via `*.local`)
//   Railway   → dashboard → Variables
const ENV_URL = ((import.meta.env.VITE_GAUNTLET_SHEET_WEBHOOK_URL as string | undefined) ?? '').trim();

export const GAUNTLET_SHEET_WEBHOOK_URL =
  ENV_URL || 'https://script.google.com/macros/s/AKfycbxXAjZX9BdAQSYeVyp1fhBwne_1EHorfDvjlqAKfNn27gUskgHlfgwyVpcJKA2rYdWS/exec';

export interface GauntletRegistration {
  name: string;
  email: string;
  referral: string; // member name (or free text), can be ''
}

export const isGauntletSheetConfigured = (): boolean => GAUNTLET_SHEET_WEBHOOK_URL.length > 0;

export async function submitGauntletRegistration(data: GauntletRegistration): Promise<void> {
  if (!isGauntletSheetConfigured()) {
    const key = 'cliqueGauntletRegistrations';
    let queue: unknown[] = [];
    try {
      queue = JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      // corrupt store — start fresh
    }
    queue.push({ ...data, submittedAt: new Date().toISOString() });
    try {
      localStorage.setItem(key, JSON.stringify(queue));
    } catch {
      // ignore
    }
    console.warn('[CLIQUE] Gauntlet sheet webhook not configured — RSVP stored locally only.', data);
    return;
  }

  // Form-encoded + no-cors: Apps Script web apps don't send CORS headers, so
  // the response is opaque — a resolved fetch means the row was delivered.
  const body = new URLSearchParams(Object.entries(data));
  await fetch(GAUNTLET_SHEET_WEBHOOK_URL, { method: 'POST', mode: 'no-cors', body });
}
