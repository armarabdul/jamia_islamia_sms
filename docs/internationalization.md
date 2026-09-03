# Jamia Islamia - Bilingual (English & Urdu RTL) Strategy

## Internationalization Architecture
1. **Frontend i18n Engine**:
   - `i18next` and `react-i18next` manage client translations on both Web and Mobile.
   - Translation dictionaries located at `web/src/i18n/locales/en.json` and `web/src/i18n/locales/ur.json`.
   - Switching language updates `document.documentElement.dir = ('ur' ? 'rtl' : 'ltr')` and `document.documentElement.lang`.
   - User language choice is persisted to `localStorage` and synchronized with `User.language_preference` on the backend.

2. **Bidirectional (RTL / LTR) Layout Standard**:
   - Built exclusively with CSS Logical Properties:
     - `margin-inline-start`, `margin-inline-end` instead of `margin-left` / `margin-right`.
     - `padding-inline-start`, `padding-inline-end` instead of `padding-left` / `padding-right`.
     - `inset-inline-start`, `inset-inline-end` instead of `left` / `right`.
   - Direction-aware icon flipping via `.rtl-flip` for navigation arrows while preserving symmetrical iconography (clocks, badges, book icons).

3. **Typography**:
   - **English**: Modern sans-serif (`Outfit`, `Plus Jakarta Sans`, `Inter`).
   - **Urdu**: Authentic Nastaliq and Arabic Naskh fonts (`Noto Nastaliq Urdu`, `Noto Sans Arabic`) with adjusted line-height standards to ensure diacritics and ligatures do not clip.
