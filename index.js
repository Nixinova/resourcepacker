#!/usr/bin/env node
const fs = require('fs');
const copyfiles = require('copyfiles');

const RPKR_VERSION = '1.0.0-pre1';
const CONFIG = { name: process.cwd().split(/\/|\\/).slice(-1), packver: '1.0.0', mcver: '1.16.x', mcsnap: '' }
const RPKR_DEFAULT = `
name: ${CONFIG.name}
packver: ${CONFIG.packver}
mcver: ${CONFIG.mcver}
mcsnap: ${CONFIG.mcsnap}
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

function init() {
    fs.writeFile('.rpkr', RPKR_DEFAULT, err => {
        if (err) throw "FSWriteError: Cannot write to .rpkr configuration file";
        else console.log("Created config file .rpkr with default settings")
    });
}

function package(output) {
    fs.readFile('.rpkr', 'utf8', (err, contents) => {

        let rpkrContent = RPKR_DEFAULT, config = CONFIG;
        if (err) init(); else rpkrContent = contents;

        let args = rpkrContent.split(/\s*\r?\n/);
        config.globs = args.slice(args.indexOf('files:') + 1);
        const matchRegex = key => RegExp('^' + key + ':\\s*')
        const setConfig = (arg, ...keys) => {
            for (let key of keys) if (arg.match(matchRegex(key))) config[key] = arg.replace(matchRegex(key), '');
        }
        args.filter(arg => {
            arg = arg.replace(/\s*#.*$/, '');
            setConfig(arg, 'name', 'packver', 'mcver', 'mcsnap')
        });

        let { globs, name, packver, mcver, mcsnap } = config;
        console.log(`Packaging version ${packver} of '${name}'...`);
        copyfiles(
            [...globs, output || `${name} ${packver} (${mcsnap || mcver})`],
            {},
            err => console.log(err || `Successfully packaged '${name}' version ${packver} for Minecraft ${mcver}`)
        );

    });
}

const arg = n => process.argv[n + 1] || '';
if (arg(1).includes('h')) {
    console.log(`
        rpkr help                   Display this help message
        rpkr init                   Initialize this directory with an rpkr configuration file
        rpkr pack [<output folder>] Package your resource pack
        rpkr version                Display the current version of resourcepacker
    `.trimRight());
}
else if (arg(1).includes('v')) console.log('Current version: ' + RPKR_VERSION);
else if (arg(1) === 'init') init();
else if (arg(1) === 'pack') package(arg(2));
else console.log('Unknown command; type `rpkr help` for help');