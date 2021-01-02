#!/usr/bin/env node
const RPKR_VERSION = '1.0.3';

const fs = require('fs');
const copyfiles = require('copyfiles');
const jsonformat = require('json-format');

const log = str => console.log('<resourcepacker> ' + str);
const escapeRegex = str => str.replace(/[.*+?^/${}()|[\]\\]/g, '\\$&');

const CONFIG = {
    configver: 2,
    name: process.cwd().split(/\/|\\/).slice(-1)[0],
    packver: 'v1.0',
    mcver: '1.16.4',
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
const PACK_FORMATS = {
    1: ['1.6.x', '1.7.x', '1.8.x'],
    2: ['1.9.x', '1.10.x'],
    3: ['1.11.x', '1.12.x'],
    4: ['1.13.x', '1.14.x'],
    5: ['1.15.x', '1.16', '1.16.1'],
    6: ['1.16.x'],
    7: ['1.17.x'],
};

function init(force) {
    if (fs.existsSync('.rpkr.json') && !force.includes('f')) {
        log('Warning: This folder is already initialised with an .rpkr.json configuration file.');
        log('Type `rpkr init force` to overwrite it with default settings.');
    }
    else fs.writeFile('.rpkr.json', jsonformat(CONFIG), err => {
        if (err) throw 'FSWriteError: Cannot write to .rpkr.json configuration file.';
        else {
            if (force.includes('f')) log('Warning: Overwriting existing .rpkr.json configuration file.');
            log(`Successfully created .rpkr.json configuration file with default settings.`);
        }
    });
}

function package(output) {
    fs.readFile('.rpkr.json', 'utf8', (err, contents) => {
        if (err) init();
        let config = err ? CONFIG : JSON.parse(contents);
        let { files, name, packver, mcver, mcsnap, description, languages } = config;

        let qualifiedName = mcver;
        if (mcsnap) {
            if (mcsnap.match(/\d\dw\d\d\w/)) qualifiedName = mcsnap; // snapshot
            if (mcsnap.match(/\w+\d+/)) qualifiedName = mcver + '-' + mcsnap; // short name of pre and rc
            else qualifiedName = mcver + ' ' + mcsnap; // full name of pre and rc
        }

        let outputFolder = output || `${name} ${packver} (${qualifiedName})`;

        log(`Packaging version ${packver} of '${name}'...`);
        copyfiles(
            [...files, outputFolder],
            {},
            err => {
                const success = success => {
                    log(`${success ? 'S' : 'Uns'}uccessfully packaged version ${packver} of '${name}' for Minecraft ${mcver}`);
                };
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
                            .replace(/&([0-9a-fk-or])/g, '§$1') // formatting codes
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
                            if (err) log('FSWriteError: Could not create automatic pack.mcmeta file'), success(false);
                            else log('Created automatic pack.mcmeta file'), success(true);
                        }
                    );
                }
                else success(true);
            });

    });
}

const arg = n => process.argv[n + 1] || '';
if (!arg(1)) {
    log('Welcome to resourcepacker, the simple way to package Minecraft resource packs.');
    log('Type `rpkr help` for a list of commands.');
}
else if (arg(1).includes('h')) {
    log(`
        rpkr help               Display this help message
        rpkr init               Initialise this directory with a configuration file
            rpkr init [force]   Overwite the existing configuration file with default settings
        rpkr pack               Package your resource pack into a folder described by the configuration file
            rpkr pack [<name>]  Package your resource pack into a set named output folder
        rpkr version            Display the current version of resourcepacker
    `.trimRight());
}
else if (arg(1).includes('v')) log('The current version of resourcepacker is ' + RPKR_VERSION);
else if (arg(1) === 'init') init(arg(2));
else if (arg(1) === 'pack') package(arg(2));
else log('Unknown command; type `rpkr help` for help');