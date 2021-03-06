const fs = require('fs');
const copyfiles = require('copyfiles');
const movefiles = require('glob-move');
const archiver = require('archiver');
const packFormat = require('pack-format');

type rpkrConfig = { [key: string]: any };
type booleanConfig = { [key: string]: boolean };
type mcmeta = {
    pack: { pack_format: number | undefined, description: string, }
    language?: {
        [lang: string]: { name: string, region: string, }
    }
}

const log = (msg: string): void => console.log('<resourcepacker> ' + msg);

const CONFIG: rpkrConfig = {
    configver: 2,
    name: process.cwd().replace(/^.+[/\\]([^/\\]+)$/, '$1'),
    packver: 'v1',
    mcver: '1.16.5',
    mcsnap: null,
    description: 'Default resource pack configuration, which creates an automatic pack.mcmeta file when packing.',
    languages: null,
    files: [
        "pack.png",
        "pack.mcmeta",
        "assets/**/*.png",
        "assets/**/*.mcmeta",
        "assets/**/*.json",
        "assets/**/lang/**/*.lang",
        "assets/**/texts/**/*.txt",
        "assets/**/sounds/**/*.ogg",
        "assets/**/shaders/**/*.fsh",
        "assets/**/shaders/**/*.bin",
    ],
};

function init({ force }: booleanConfig = { force: false }) {
    if (fs.existsSync('.rpkr.json') && !force) {
        log('Warning: This folder is already initialised with an .rpkr.json configuration file.');
        log('Type `rpkr init force` to overwrite it with default settings.');
    }
    else fs.writeFile('.rpkr.json', JSON.stringify(CONFIG, null, '\t'), (err: Error) => {
        if (err) throw 'FSWriteError: Cannot write to .rpkr.json configuration file.';
        else {
            if (force) log('Warning: Overwriting existing .rpkr.json configuration file.');
            log(`Successfully created .rpkr.json configuration file with default settings.`);
        }
    });
}

function pack(input: string = '.', output: string, { zipped }: booleanConfig = { zipped: true }) {
    fs.readFile('.rpkr.json', 'utf8', (err: Error, contents: string) => {
        if (err) init();

        let config: rpkrConfig = err ? CONFIG : JSON.parse(contents);
        let { name, packver, mcver, mcsnap, description, languages, files = CONFIG.files } = config;

        // Create version label
        let versionLabel: string = mcver;
        if (mcsnap) {
            if (mcsnap.match(/\d\dw\d\d\w/)) versionLabel = mcsnap; // snapshot
            if (mcsnap.match(/\w+\d+/)) versionLabel = mcver + '-' + mcsnap; // short name of pre and rc
            else versionLabel = mcver + ' ' + mcsnap; // full name of pre and rc
        }
        output = output || `${name} ${packver} (${versionLabel})`;

        // Create automatic mcmeta file
        const mcmetaTemp = 'temp-pack.mcmeta';
        if (description) {
            const mcmetaContent: mcmeta = { pack: { pack_format: 0, description: '' } };

            mcmetaContent.pack.pack_format = packFormat(versionLabel, 'resource') || packFormat(mcver, 'resource') || 0;

            /// Compile description
            for (const item in config) {
                let escapedItem: string = item.replace(/[-\[\]{}().*+?^$\\\/|]/g, "\\$&");
                description = description
                    .replace(/&([0-9a-fk-or])/g, '§$1') // formatting codes
                    .replace(RegExp(`<${escapedItem}>`, 'g'), config[item]) // custom parameters
            }
            mcmetaContent.pack.description = description;

            /// Parse languages
            if (languages) {
                mcmetaContent.language = {};
                for (const lang in languages) {
                    const matcher: RegExp = /^\s*(.*?)\s*\((.*?)\)\s*/i;
                    let [, name, region] = languages[lang].match(matcher);
                    mcmetaContent.language[lang] = { name, region };
                }
            }

            /// Write mcmeta to disc
            if (!zipped || output.includes('/')) fs.mkdirSync(output, { recursive: true });
            fs.writeFileSync(
                (zipped ? mcmetaTemp : output + '/pack.mcmeta'),
                JSON.stringify(mcmetaContent, null, '\t'),
                (err: Error) => {
                    if (err) log('FSWriteError: Could not create automatic pack.mcmeta file');
                    else log('Created automatic pack.mcmeta file');
                }
            );
        }

        // Localise paths
        for (let i in files) {
            files[i] = input.replace(/\/$/, '') + '/' + files[i];
        }

        // Write output to disk
        const success = function (s: boolean): void {
            const outFile: string = output.replace(/\/$|\.zip$/, '') + (zipped ? '.zip' : '/');
            log(`${s ? 'S' : 'Uns'}uccessfully packaged version ${packver} of '${name}' for Minecraft ${mcver} to '${outFile}'`);
        }
        log(`Packaging version ${packver} of '${name}'...`);

        if (zipped) {
            const zipFilename: string = output + '.zip';
            if (fs.existsSync(zipFilename)) log(`Warning: Overwriting existing file ${zipFilename}.`);
            const outFile = fs.createWriteStream(zipFilename);
            const zipFile = archiver('zip', { zlib: { level: 9 } });
            outFile.on('close', function () {
                fs.unlink(mcmetaTemp, (err: Error) => err ? log(`Error: ${err}`) : success(true));
            });
            zipFile.pipe(outFile); // Start writing to zip file
            zipFile.file(mcmetaTemp, { name: 'pack.mcmeta' });
            for (let glob of [...files]) zipFile.glob(glob.replace(/^.\//, ''));
            zipFile.finalize(); // End writing to zip file
        }
        else {
            copyfiles([...files, output], {}, (err: Error) => {
                if (err) {
                    log(`Error: ${err}`);
                    success(false);
                }
                else if (input !== '.') {
                    const oldOutput = output + '/' + input;
                    movefiles(oldOutput + '/*', output)
                        .then(function() {
                            fs.rmdirSync(oldOutput);
                            success(true);
                        })
                        .catch((err: Error) => log(`Error: ${err}`))
                }
                else success(true);
            });
        }

    });
}

export = { init, pack };
