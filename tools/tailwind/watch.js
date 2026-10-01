// =============================================================================
// Development watcher.
//
// Watches the content files (HTML pages + JS) that feed the Tailwind build and,
// after every change (debounced), recompiles css/tailwind.css and syncs the
// result to the other copies of the static site — including edits made while
// this process stays active.
//
// Implemented with Node's own fs.watch + a full build per change instead of
// the Tailwind CLI's `--watch`: chaining `--watch && npm run sync` would only
// sync once the watcher exited, and a wrapper around `--watch` would depend on
// the CLI's watcher staying alive. A full rebuild takes well under a second
// for this project's page count.
// =============================================================================
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const sync = require('./sync');

const root = path.resolve(__dirname, '../..');

// (directory, file extensions that should trigger a rebuild)
const watched = [
    [root, ['.html']],                                             // root pages
    [path.join(root, 'js'), ['.js']],
    [path.join(root, 'frontend'), ['.html']],
    [path.join(root, 'frontend/js'), ['.js']],
    [path.join(root, 'backend/src/main/resources/static'), ['.html']],
    [path.join(root, 'backend/src/main/resources/static/js'), ['.js']],
    [path.join(root, 'src/main/resources/static'), ['.html']],
    [path.join(root, 'src/main/resources/static/js'), ['.js']],
    [__dirname, ['.js']],                                          // tailwind.config.js
    [path.join(__dirname, 'src'), ['.css']],                       // src/input.css
];

const DEBOUNCE_MS = 300;
let rebuildTimer = null;

function build() {
    const result = spawnSync(
        'npx',
        [
            'tailwindcss',
            '-c', './tailwind.config.js',
            '-i', './src/input.css',
            '-o', '../../css/tailwind.css',
            '--minify'
        ],
        { cwd: __dirname, stdio: 'inherit', shell: true }
    );

    if (result.status !== 0) {
        console.error('Build failed — keeping the previous css/tailwind.css.');
        return;
    }
    sync();
}

function scheduleRebuild(label) {
    console.log(`Change detected (${label}) — rebuilding...`);
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(build, DEBOUNCE_MS);
}

console.log('Watching for changes in the Civil Connection pages (Ctrl+C to stop)...');

// Initial build so the session always starts from a fresh, synced stylesheet.
build();

for (const [dir, extensions] of watched) {
    if (!fs.existsSync(dir)) continue;
    fs.watch(dir, (event, filename) => {
        if (!filename || !extensions.some(ext => filename.endsWith(ext))) return;
        scheduleRebuild(filename);
    });
}
