// =============================================================================
// CIVIL CONNECTION - FRONTEND CONFIGURATION
// =============================================================================

// -----------------------------------------------------------------------------
// REST API (Spring Boot backend)
// -----------------------------------------------------------------------------
// baseUrl defines where the frontend sends its /api/* requests:
//
//   '' (default)
//       Same origin. Use this when the pages are served BY the backend
//       (e.g. http://localhost:8080/profissionais.html).
//
//   'http://localhost:8080'
//       Use this when opening the HTML files directly (file://) or serving
//       them from a separate static server while the backend runs locally.
//       (Opening via file:// falls back to this automatically.)
//
//   'https://seu-backend.exemplo.com'
//       Use this when the backend is deployed (Render, Railway, Fly.io, VPS...)
//       and the frontend is deployed elsewhere (e.g. Vercel).
//
// When the API cannot be reached, the pages automatically fall back to the
// demonstration data bundled in js/app.js so the site keeps working.
const API_CONFIG = {
    baseUrl: ''
};

window.CIVIL_API_CONFIG = API_CONFIG;

// -----------------------------------------------------------------------------
// Supabase (kept for reference / optional direct frontend integrations)
// -----------------------------------------------------------------------------
const SUPABASE_CONFIG = {
    url: 'https://ssattrkimtsvlgjlucng.supabase.co/rest/v1/',
    publishableKey: 'sb_publishable_SDQh99AWxAOYhVkbd-ITbA_uOhaIi7i',
    headers: {
        'apikey': 'sb_publishable_SDQh99AWxAOYhVkbd-ITbA_uOhaIi7i',
        'Authorization': 'Bearer sb_publishable_SDQh99AWxAOYhVkbd-ITbA_uOhaIi7i'
    }
};

window.SUPABASE_CONFIG = SUPABASE_CONFIG;
