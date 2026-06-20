I can't visually verify the rendered UI in this environment (no browser automation tool available), but I confirmed both new components compile and are served without error by the dev server (Portal.vue and Catalogue.vue modules return HTTP 200, build passes cleanly). Please do a visual check in your browser at http://localhost:5173/.

What was added
1. Landing portal at / — Portal.vue
A two-choice screen ("FrontOffice" vs "BackOffice") on a blue gradient background, each a clickable card with icon, description, and a "Continuer →" link:

FrontOffice → /Catalogue
BackOffice → /Login_Unique (your existing login page, just moved off /)
2. FrontOffice catalogue at /Catalogue — Catalogue.vue
A public, card-grid view of every asset (Computer/Monitor/Printer/Phone/NetworkEquipment merged into one list):

Photo or placeholder icon per card (loaded in the background so the list isn't blocked waiting on images)
Useful details: Name, Status, Location, Manufacturer, Model, Inventory number — plus a type badge (translated: Ordinateur/Écran/Imprimante/Téléphone/Équipement réseau)
One search box that filters across all 7 criteria you listed (Name, Status, Location, Manufacturer, Item_Type, Model, Inventory_Number) at once — type "Dell" or "Administration" or "ITU-2026-0003" and it matches
"← Accueil" button to go back to the portal
3. New service helpers, following your existing patterns:

parcServices.js — get_all_items() loops over the asset types like your findAssetId/importAssets do, using expand_dropdowns=true so GLPI returns readable names ("Dell", "Administration") instead of raw ids; getItemImage() fetches an asset's first linked photo via /​{itemtype}/{id}/Document_Item then downloads it
glpiServices.js — glpiDownloadDocument(), a small fetch wrapper matching glpiUploadDocument's style, that streams a document's binary content (GLPI requires Accept: application/octet-stream for that) and turns it into a blob URL for <img>
4. Router (index.js): / → Portal, /Login_Unique → your login page (moved from /), /Catalogue → the new catalogue.

One thing worth testing live: image loading does one fetch+download per asset that has a photo, so with more assets the catalogue could feel slower to "fill in" pictures — if that becomes noticeable, batching or caching blob URLs would be the next step.

