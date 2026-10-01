// =============================================================================
// Copies the compiled stylesheet (../../css/tailwind.css) to the other copies
// of the static site (frontend/ and the Spring Boot static folders) so every
// copy serves the exact same build.
//
// Standalone: npm run sync
// Reusable:   const sync = require('./sync'); sync();
// =============================================================================
const fs = require('fs');
const path = require('path');

const source = path.resolve(__dirname, '../../css/tailwind.css');
const targets = [
    path.resolve(__dirname, '../../frontend/css/tailwind.css'),
    path.resolve(__dirname, '../../backend/src/main/resources/static/css/tailwind.css'),
    path.resolve(__dirname, '../../src/main/resources/static/css/tailwind.css'),
];

function sync() {
    if (!fs.existsSync(source)) {
        console.error(`Build output not found: ${source}. Run the Tailwind build first.`);
        return false;
    }

    for (const target of targets) {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.copyFileSync(source, target);
        console.log(`Synced -> ${path.relative(path.resolve(__dirname, '../..'), target)}`);
    }
    return true;
}

if (require.main === module) {
    if (!sync()) process.exit(1);
}

module.exports = sync;
