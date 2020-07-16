#!/usr/bin/env node
const fs = require('fs');
const copyfiles = require('copyfiles');
const log = str => console.log('<resourcepacker> ' + str);

const RPKR_VERSION = '1.0.0-pre2';
const CONFIG = { name: process.cwd().split(/\/|\\/).slice(-1), packver: '1.0.0', mcver: '1.16.x', mcsnap: '', description: '' };
const RPKR_DEFAULT = `
name: ${CONFIG.name}
packver: ${CONFIG.packver}
mcver: ${CONFIG.mcver}
mcsnap: ${CONFIG.mcsnap}
description: ${CONFIG.description}
files:
pack.png
pack.mcmeta
assets/**/*.png
assets/**/*.mcmeta
assets/**/*.json
assets/**/*.lang
assets/**/*.txt
assets/**/*.fsh
assets/**/*.bin
`.trim();

const PACKVERS = { '1.6,1.7,1.8': 1, '1.9,1.10': 2, '1.11,1.12': 3, '1.13,1.14': 4, '1.15,1.16': 5 };

function init() {
    fs.writeFile('.rpkr', RPKR_DEFAULT, err => {
        if (err) throw "FSWriteError: Cannot write to .rpkr configuration file";
        else log("Successfully created config file .rpkr with default settings")
    });
}

function package(output) {
    fs.readFile('.rpkr', 'utf8', (err, contents) => {
        let hasError = false;

        let rpkrData = RPKR_DEFAULT.split('\n'), config = CONFIG;
        if (err) init(); else rpkrData = contents.split('\n');

        for (let param of rpkrData) {
            let parts = param.split(':');
            if (!parts[1]) break;
            let key = parts[0];
            let val = parts[1].slice(1).trim();
            config[key] = val;
        }
        config.globs = rpkrData.slice(rpkrData.indexOf('files:') + 1);

        let { globs, name, packver, mcver, mcsnap, description } = config;
        let outputFolder = output || `${name} ${packver} (${mcsnap || mcver})`
        log(`Packaging version ${packver} of '${name}'...`);
        copyfiles(
            [...globs, outputFolder], {},
            (err) => {
                const success = x => {
                    log(`${x ? 'Uns' : 'S'}uccessfully packaged version ${packver} of '${name}' for Minecraft ${mcver}`);
                }
                if (err) hasError = true, log('Error: ' + err), success(false);
                else if (description) {
                    let packver = 0, mcverMajor = mcver.replace(/^(\d\.\d+).*/, '$1');
                    for (let key in PACKVERS) { if (key.includes(mcverMajor)) packver = PACKVERS[key]; }
                    for (let item in config) {
                        description = description.replace(/&(?=\w)/g, '§').replace(RegExp('<' + item + '>', 'g'), config[item]);
                    }
                    const mcmetaContent = `{\n  "pack": {\n    "pack_format": ${packver},\n    "description": ${JSON.stringify(description)}\n  }\n}`;
                    fs.writeFile(outputFolder + '/pack.mcmeta', mcmetaContent, err => {
                        if (err) hasError = true, log("FSWriteError: Could not create automatic pack.mcmeta file"), success(false);
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