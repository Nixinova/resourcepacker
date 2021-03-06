#!/usr/bin/env node

const RPKR_VERSION = '1.2.1';

const { init, pack } = require('./index');

const indent = (n: number): string => ' '.repeat(n * 4);
const usage = (command: string, ...desc: string[]): void => {
    console.log('\n' + indent(2) + command);
    for (let msg of desc) console.log(indent(3) + msg);
}

const arg = (n: number): string => process.argv[n + 1] || '';

if (!arg(1)) {
    console.log('Welcome to resourcepacker, the simple way to package Minecraft resource packs.');
    console.log('Type `rpkr help` for a list of commands.');
}
else if (arg(1).includes('h')) {
    console.log(`\n${indent(1)}resourcepacker commands:`);
    usage(`rpkr help`,
        `Display this help message.`,
    );
    usage(`rpkr init [--force]`,
        `Initialise this directory with an .rpkr.json configuration file.`,
        `Use '--force' to overwrite the existing .rpkr.json configuration file with default settings.`,
    );
    usage(`rpkr pack [[<input>] (<output>|--folder)]`,
        `Package your resource pack into a zip file with its name described by the configuration file.`,
        `Use '--folder' to output the resource pack into a zip file instead of a folder.`,
        `Or, use <output> to set a custom output folder name; append '.zip' to pack to a zip file instead.`,
    );
    usage(`rpkr version`,
        `Display the current version of resourcepacker.`,
    );
}
else if (arg(1).includes('v')) {
    console.log('The current version of resourcepacker is ' + RPKR_VERSION);
}
else if (arg(1) === 'init') {
    init({ force: /^-*f/.test(arg(2)) });
}
else if (arg(1) === 'pack') {
    const [input, out]: string[] = arg(3) ? [arg(2), arg(3)] : ['.', arg(2)];
    const zipExt: boolean = out.endsWith('.zip');
    const zipArg: boolean = /^-*z/.test(out);
    const output: string = zipExt ? out.replace(/\.zip$/, '') : (zipArg ? '' : out)
    pack(input, output, { zipped: !arg(2) || zipExt || zipArg });
}
else {
    console.log('<resourcepacker> Unknown command; type `rpkr help` for help');
}
