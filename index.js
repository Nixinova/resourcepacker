#!/usr/bin/env node
const RPKR_VERSION = '1.0.1';

const fs = require('fs');
const copyfiles = require('copyfiles');
const jsonformat = require('json-format');

const log = str => console.log('<resourcepacker> ' + str);
const escapeRegex = str => str.replace(/[.*+?^/${}()|[\]\\]/g, '\\$&');

const CONFIG = {
    configver: 2,
    name: process.cwd().split(/\/|\\/).slice(-1)[0],
    packver: 'v1',
    mcver: '1.16.x',
    mcsnap: null,
    description: null,
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
const PACK_FORMATS = {
    1: ['1.6.x', '1.7.x', '1.8.x'],
    2: ['1.9.x', '1.10.x'],
    3: ['1.11.x', '1.12.x'],
    4: ['1.13.x', '1.14.x'],
    5: ['1.15.x', '1.16', '1.16.1'],
    6: ['1.16.x'],
};

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
            [...files, outputFolder],
            {},
            err => {
                const success = success => {
                    log(`${success ? 'S' : 'Uns'}uccessfully packaged version ${packver} of '${name}' for Minecraft ${mcver}`);
                }
                if (err) log('Error: ' + err), success(false);
                else if (description) {

                    let packFormat = 0;
                    for (let key in PACK_FORMATS) {
                        for (let val of PACK_FORMATS[key]) {
                            const matchExact = mcver == val;
                            const matchPartial = val.endsWith('.x') && val.replace('.x', '') == mcver.replace(/(^1\.\d+)\.\d+$/, '$1');
                            if (matchExact || matchPartial) packFormat = key;
                        }
                    }
                    for (let item in config) {
                        description = description
                            .replace(/&(?=[0-9a-fk-or])/g, '§') // formatting codes
                            .replace(RegExp(`<${escapeRegex(item)}>`, 'g'), config[item]) // custom parameters
                    }

                    let mcmetaContent = { "pack": { "pack_format": parseInt(packFormat), "description": description } };
                    if (languages) {
                        mcmetaContent.language = {};
                        for (let lang in languages) {
                            const matchRegex = /^\s*(.*?)\s*\((.*?)\)\s*/i;
                            let [, name, region] = languages[lang].match(matchRegex);
                            mcmetaContent.language[lang] = { "name": name, "region": region };
                        }
                    }

                    fs.writeFile(
                        outputFolder + '/pack.mcmeta',
                        jsonformat(mcmetaContent, { type: 'space' }),
                        err => {
                            if (err) log("FSWriteError: Could not create automatic pack.mcmeta file"), success(false);
                            else log("Created automatic pack.mcmeta file"), success(true);
                        }
                    );
                }
                else success(true);
            });

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
else if (arg(1).includes('v')) log('The current version of resourcepacker is ' + RPKR_VERSION);
else if (arg(1) === 'init') init();
else if (arg(1) === 'pack') package(arg(2));
else log('Unknown command; type `rpkr help` for help');