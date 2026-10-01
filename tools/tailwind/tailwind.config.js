// =============================================================================
// CIVIL CONNECTION - TAILWIND CSS BUILD CONFIG (Tailwind CSS v3)
// -----------------------------------------------------------------------------
// The pages previously loaded Tailwind from https://cdn.tailwindcss.com (the
// Play CDN), which is not meant for production. This config holds the exact
// same design tokens ("Construct Modern" theme) that used to be inlined in
// every page, and is used by the Tailwind CLI to generate a static,
// production-ready stylesheet at css/tailwind.css.
//
// Rebuild after changing classes or tokens:
//   cd tools/tailwind && npm install && npm run build
// =============================================================================
const theme = {
    "extend": {
        "colors": {
            "surface-container-low": "#eef4ff",
            "on-primary-fixed-variant": "#3a4761",
            "on-primary-fixed": "#0e1b33",
            "status-success": "#2D8A60",
            "accent-hover": "#D96F0D",
            "on-primary": "#ffffff",
            "surface-variant": "#dbe3f1",
            "primary-container": "#17243c",
            "status-draft": "#9CA3AF",
            "secondary-container": "#fd9432",
            "surface": "#f8f9ff",
            "tertiary": "#000e27",
            "surface-dim": "#d3dae8",
            "on-tertiary-container": "#7a8caf",
            "background": "#f8f9ff",
            "text-main": "#20252C",
            "on-tertiary-fixed": "#061b39",
            "on-error-container": "#93000a",
            "outline-variant": "#c5c6ce",
            "secondary": "#914c00",
            "secondary-fixed-dim": "#ffb77f",
            "on-error": "#ffffff",
            "primary": "#020e26",
            "on-secondary-container": "#673400",
            "tertiary-fixed-dim": "#b5c7ed",
            "error-container": "#ffdad6",
            "surface-tint": "#525e79",
            "status-danger": "#EF4444",
            "surface-card": "#FFFFFF",
            "on-surface-variant": "#45474d",
            "on-secondary": "#ffffff",
            "on-primary-container": "#7f8ba8",
            "on-secondary-fixed-variant": "#6f3900",
            "tertiary-fixed": "#d7e3ff",
            "on-tertiary-fixed-variant": "#354767",
            "surface-bright": "#f8f9ff",
            "primary-fixed": "#d7e2ff",
            "tertiary-container": "#112442",
            "on-surface": "#141c26",
            "on-background": "#141c26",
            "secondary-fixed": "#ffdcc4",
            "surface-container-highest": "#dbe3f1",
            "on-tertiary": "#ffffff",
            "surface-container-lowest": "#ffffff",
            "inverse-on-surface": "#e9f1ff",
            "primary-fixed-dim": "#bac6e6",
            "inverse-surface": "#29313b",
            "surface-container-high": "#e1e9f6",
            "surface-container": "#e7eefc",
            "on-secondary-fixed": "#2f1500",
            "surface-canvas": "#F6F4EF",
            "status-info": "#3B82F6",
            "outline": "#75777e",
            "error": "#ba1a1a",
            "inverse-primary": "#bac6e6",
            "status-warning": "#F59E0B"
        },
        "borderRadius": {
            "DEFAULT": "0.125rem",
            "lg": "0.25rem",
            "xl": "0.5rem",
            "full": "0.75rem"
        },
        "spacing": {
            "margin-sm": "1rem",
            "space-xl": "2.5rem",
            "gutter-sm": "1rem",
            "space-lg": "1.5rem",
            "space-xs": "0.25rem",
            "gutter": "1.5rem",
            "margin": "2rem",
            "space-md": "1rem",
            "space-sm": "0.5rem"
        },
        "fontFamily": {
            "body-md": [
                "Inter"
            ],
            "body-sm": [
                "Inter"
            ],
            "headline-sm": [
                "Sora"
            ],
            "display-lg-mobile": [
                "Sora"
            ],
            "headline-md": [
                "Sora"
            ],
            "label-md": [
                "Inter"
            ],
            "body-lg": [
                "Inter"
            ],
            "title-md": [
                "Inter"
            ],
            "headline-xl-mobile": [
                "Sora"
            ],
            "display-lg": [
                "Sora"
            ],
            "headline-lg": [
                "Sora"
            ],
            "headline-xl": [
                "Sora"
            ],
            "label-sm": [
                "Inter"
            ]
        },
        "fontSize": {
            "body-md": [
                "15px",
                {
                    "lineHeight": "24px",
                    "fontWeight": "400"
                }
            ],
            "body-sm": [
                "13px",
                {
                    "lineHeight": "20px",
                    "fontWeight": "400"
                }
            ],
            "headline-sm": [
                "18px",
                {
                    "lineHeight": "26px",
                    "fontWeight": "600"
                }
            ],
            "display-lg-mobile": [
                "32px",
                {
                    "lineHeight": "40px",
                    "letterSpacing": "-0.01em",
                    "fontWeight": "700"
                }
            ],
            "headline-md": [
                "22px",
                {
                    "lineHeight": "30px",
                    "fontWeight": "600"
                }
            ],
            "label-md": [
                "14px",
                {
                    "lineHeight": "20px",
                    "letterSpacing": "0.01em",
                    "fontWeight": "600"
                }
            ],
            "body-lg": [
                "18px",
                {
                    "lineHeight": "28px",
                    "fontWeight": "400"
                }
            ],
            "title-md": [
                "16px",
                {
                    "lineHeight": "24px",
                    "fontWeight": "600"
                }
            ],
            "headline-xl-mobile": [
                "26px",
                {
                    "lineHeight": "34px",
                    "letterSpacing": "-0.01em",
                    "fontWeight": "700"
                }
            ],
            "display-lg": [
                "48px",
                {
                    "lineHeight": "56px",
                    "letterSpacing": "-0.02em",
                    "fontWeight": "700"
                }
            ],
            "headline-lg": [
                "28px",
                {
                    "lineHeight": "36px",
                    "letterSpacing": "-0.01em",
                    "fontWeight": "600"
                }
            ],
            "headline-xl": [
                "36px",
                {
                    "lineHeight": "44px",
                    "letterSpacing": "-0.015em",
                    "fontWeight": "700"
                }
            ],
            "label-sm": [
                "11px",
                {
                    "lineHeight": "16px",
                    "letterSpacing": "0.05em",
                    "fontWeight": "600"
                }
            ]
        }
    }
};

/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        // Static site served from the repository root (Vercel deployment)
        '../../*.html',
        '../../js/**/*.js',
        // frontend/ copy of the pages
        '../../frontend/*.html',
        '../../frontend/js/**/*.js',
        // Static pages bundled inside the Spring Boot applications
        '../../backend/src/main/resources/static/*.html',
        '../../backend/src/main/resources/static/js/**/*.js',
        '../../src/main/resources/static/*.html',
        '../../src/main/resources/static/js/**/*.js',
    ],
    theme: theme,
    plugins: [],
};
