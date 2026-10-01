// =============================================================================
// Copies the compiled stylesheet (../../css/tailwind.css) to the other copies
// of the static site (frontend/ and the Spring Boot static folders) so every
// copy serves the exact same build.
// =============================================================================
const fs = require('fs');
const path = require('path');

const source = path.resolve(__dirname, '../../css/tailwind.css');
const targets = [
    path.resolve(__dirname, '../../frontend/css/tailwind.css'),
    path.resolve(__dirname, '../../backend/src/main/resources/static/css/tailwind.css'),
    path.resolve(__dirname, '../../src/main/resources/static/css/tailwind.css'),
];

if (!fs.existsSync(source)) {
    console.error(`Build output not found: ${source}. Run the Tailwind build first.`);
    process.exit(1);
}

for (const target of targets) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
    console.log(`Synced -> ${path.relative(path.resolve(__dirname, '../..'), target)}`);
}
