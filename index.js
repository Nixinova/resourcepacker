#!/usr/bin/env node
const RPKR_VERSION = '1.0.0-pre3';

const fs = require('fs');
const copyfiles = require('copyfiles');
const jsonformat = require('json-format');
const log = str => console.log('<resourcepacker> ' + str);

const CONFIG = {
    name: process.cwd().split(/\/|\\/).slice(-1)[0],
    packver: '1.0.0', mcver: '1.16.x', mcsnap: null,
    description: null, languages: null,
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
const PACK_FORMATS = { '1.6,1.7,1.8': 1, '1.9,1.10': 2, '1.11,1.12': 3, '1.13,1.14': 4, '1.15,1.16': 5 };

function init() {
    fs.writeFile('.rpkr.json', jsonformat(CONFIG), err => {
        if (err) throw "FSWriteError: Cannot write to .rpkr.json configuration file";
        else log("Successfully created config file .rpkr.json with default settings");
    });
}

function package(output) {
    fs.readFile('.rpkr.json', 'utf8', (err, contents) => {
        if (err) init();
        let config = err ? CONFIG : JSON.parse(contents);
        let { files, name, packver, mcver, mcsnap, description, languages } = config;
        let outputFolder = output || `${name} ${packver} (${mcsnap || mcver})`;

        log(`Packaging version ${packver} of '${name}'...`);
        copyfiles(
            [...files, outputFolder], {},
            (err) => {
                const success = x => {
                    log(`${x == null ? 'Uns' : 'S'}uccessfully packaged version ${packver} of '${name}' for Minecraft ${mcver}`);
                }
                if (err) log('Error: ' + err), success(false);
                else if (description) {

                    let packFormat = 0, mcverMajor = mcver.replace(/^(\d\.\d+).*/, '$1');

                    for (let key in PACK_FORMATS) {
                        if (key.includes(mcverMajor)) packFormat = PACK_FORMATS[key];
                    }
                    for (let item in config) {
                        description = description.replace(/&(?=\w)/g, '§').replace(RegExp('<' + item + '>', 'g'), config[item]);
                    }

                    let mcmetaContent = { "pack": { "pack_format": packFormat, "description": description } };
                    if (languages) {
                        mcmetaContent.language = {};
                        for (let lang in languages) {
                            const matchRegex = /^\s*(.*?)\s*\((.*?)\)\s*/i;
                            let [, name, region] = languages[lang].match(matchRegex);
                            mcmetaContent.language[lang] = { "name": name, "region": region};
                        }
                    }

                    fs.writeFile(outputFolder + '/pack.mcmeta', jsonformat(mcmetaContent, { type: 'space' }), err => {
                        if (err) log("FSWriteError: Could not create automatic pack.mcmeta file"), success(false);
                        else log("Created automatic pack.mcmeta file"), success();
                    });
                }
                else success();
            }
        );

    });
}

const arg = n => process.argv[n + 1] || '';
if (arg(1).includes('h')) {
    log(`
        rpkr help                   Display this help message
        rpkr init                   Initialize this directory with an rpkr configuration file
        rpkr pack [<output folder>] Package your resource pack
        rpkr version                Display the current version of resourcepacker
    `.trimRight());
}
else if (arg(1).includes('v')) log('Current version: ' + RPKR_VERSION);
else if (arg(1) === 'init') init();
else if (arg(1) === 'pack') package(arg(2));
else log('Unknown command; type `rpkr help` for help');