#!/usr/bin/env node
const RPKR_VERSION = '1.1.1';

const fs = require('fs');
const copyfiles = require('copyfiles');
const archiver = require('archiver');
const jsonFormat = require('json-format');
const packFormat = require('pack-format');

const log = str => console.log('<resourcepacker> ' + str);

const CONFIG = {
    configver: 2,
    name: process.cwd().replace(/^.+[/\\]([^/\\]+)$/, '$1'),
    packver: 'v1',
    mcver: '1.16.5',
    mcsnap: null,
    description: 'Default resource pack configuration.',
    languages: null,
    files: [
        "pack.png",
        "pack.mcmeta",
        "assets/**/*.png",
        "assets/**/*.mcmeta",
        "assets/**/*.json",
        "assets/**/*.lang",
        "assets/**/*.txt",
        "assets/**/*.fsh",
        "assets/**/*.bin"
    ]
};

function init({ force }) {
    if (fs.existsSync('.rpkr.json') && !force) {
        log('Warning: This folder is already initialised with an .rpkr.json configuration file.');
        log('Type `rpkr init force` to overwrite it with default settings.');
    }
    else fs.writeFile('.rpkr.json', jsonFormat(CONFIG), err => {
        if (err) throw 'FSWriteError: Cannot write to .rpkr.json configuration file.';
        else {
            if (force) log('Warning: Overwriting existing .rpkr.json configuration file.');
            log(`Successfully created .rpkr.json configuration file with default settings.`);
        }
    });
}

function package(output, { zipped }) {
    fs.readFile('.rpkr.json', 'utf8', (err, contents) => {
        if (err) init();

        let config = err ? CONFIG : JSON.parse(contents);
        let { name, packver, mcver, mcsnap, description, languages, files = CONFIG.files } = config;

        // Create version label
        let versionLabel = mcver;
        if (mcsnap) {
            if (mcsnap.match(/\d\dw\d\d\w/)) versionLabel = mcsnap; // snapshot
            if (mcsnap.match(/\w+\d+/)) versionLabel = mcver + '-' + mcsnap; // short name of pre and rc
            else versionLabel = mcver + ' ' + mcsnap; // full name of pre and rc
        }
        let outputPathName = output || `${name} ${packver} (${versionLabel})`;

        // Create automatic mcmeta file
        if (description) {
            let mcmetaContent = { pack: {} };
            mcmetaContent.pack.pack_format = packFormat(versionLabel) || packFormat(mcver);

            /// Compile description
            for (const item in config) {
                let escapedItem = item.replace(/[-\[\]{}().*+?^$\\\/|]/g, "\\$&");
                description = description
                    .replace(/&([0-9a-fk-or])/g, '§$1') // formatting codes
                    .replace(RegExp(`<${escapedItem}>`, 'g'), config[item]) // custom parameters
            }
            mcmetaContent.pack.description = description;

            /// Parse languages
            if (languages) {
                mcmetaContent.language = {};
                for (const lang in languages) {
                    const matchRegex = /^\s*(.*?)\s*\((.*?)\)\s*/i;
                    let [, name, region] = languages[lang].match(matchRegex);
                    mcmetaContent.language[lang] = { name, region };
                }
            }

            /// Write mcmeta to disc
            if (!zipped || output.includes('/')) fs.mkdirSync(outputPathName, { recursive: true });
            fs.writeFileSync(
                (zipped ? 'temp-' : outputPathName + '/') + 'pack.mcmeta',
                jsonFormat(mcmetaContent, { type: 'space' }),
                err => {
                    if (err) log('FSWriteError: Could not create automatic pack.mcmeta file');
                    else log('Created automatic pack.mcmeta file');
                }
            );
        }

        // Write output to disk
        const success = s => log(`${s ? 'S' : 'Uns'}uccessfully packaged version ${packver} of '${name}' for Minecraft ${mcver} to '${outputPathName.replace(/\/$|\.zip$/, '')}${zipped ? '.zip' : '/'}'`);
        log(`Packaging version ${packver} of '${name}'...`);
        if (zipped) {
            const filename = outputPathName + '.zip';
            const output = fs.createWriteStream(filename);
            if (fs.existsSync(filename)) log(`Warning: Overwriting existing file ${filename}.`);
            const archive = archiver('zip', { zlib: { level: 9 } });
            output.on('close', () => fs.unlink('temp-pack.mcmeta', err => err ? log(`Error: ${err}`) : success(true)));
            archive.pipe(output); // Start writing to zip file
            archive.file('temp-pack.mcmeta', { name: 'pack.mcmeta' });
            for (let glob of [...files]) archive.glob(glob);
            archive.finalize(); // End writing to zip file
        }
        else copyfiles([...files, outputPathName], {}, err => err ? (log('Error: ' + err), success(false)) : success(true));

    });
}

const arg = n => process.argv[n + 1] || '';
if (!arg(1)) {
    log('Welcome to resourcepacker, the simple way to package Minecraft resource packs.');
    log('Type `rpkr help` for a list of commands.');
}
else if (arg(1).includes('h')) {
    log(`\n
        rpkr --help
            Display this help message.
        rpkr init [--force]
            Initialise this directory with an .rpkr.json configuration file.
            Use '--force' to overwrite the existing .rpkr.json configuration file with default settings.
        rpkr pack [<name>|--folder]
            Package your resource pack into a zip file with its name described by the configuration file.
            Use '--folder'> to output the resource pack into a zip file instead of a folder.
            Or, use <name> to set a custom output folder name; append '.zip' to pack to a zip file instead.
        rpkr --version
            Display the current version of resourcepacker.
    `);
}
else if (arg(1).includes('v')) log('The current version of resourcepacker is ' + RPKR_VERSION);
else if (arg(1) === 'init') init({ force: /^--?f(orce)?/.test(arg(2)) });
else if (arg(1) === 'pack') {
    const zipExt = arg(2).endsWith('.zip');
    package(zipExt ? arg(2).replace(/\.zip$/, '') : arg(2).replace(/^--?f(older)?.*/, ''), { zipped: zipExt || !arg(2) });
}
else log('Unknown command; type `rpkr help` for help');
