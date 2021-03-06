[![Latest version](https://img.shields.io/github/v/release/Nixinova/resourcepacker?label=latest&style=flat-square)](https://github.com/Nixinova/resourcepacker/releases)
[![npm downloads](https://img.shields.io/npm/dt/resourcepacker?style=flat-square)](https://www.npmjs.com/package/resourcepacker)
[![Last updated](https://img.shields.io/github/release-date-pre/Nixinova/resourcepacker?label=updated&style=flat-square)](https://github.com/Nixinova/resourcepacker/releases)

# resourcepacker

**resourcepacker** (or **rpkr** for short) is a useful tool for packaging *Minecraft* resource packs from a messy working directory into a clean output folder.

## Usage

### Command-line

Install [resourcepacker on npm](https://www.npmjs.com/package/resourcepacker) by typing **`npm install -g resourcepacker`** into the command line.

After installing resourcepacker, `cd` to the directory your resource is located in, then type **`rpkr init`** to ready your directory with a configuration file (`.rpkr.json`). Customise the values in this configuration file to your liking. For information on how to use this configuration file, please see the **Configuration** section below.

To package a resource pack, simply type **`rpkr pack`** and your resource pack will be packaged into an output folder. You can control which directory the files are outputted to by placing the output folder name in quotes after this command; for example, `rpkr pack "My Pack 1.16"` outputs to folder "My Pack 1.16". If the output folder is not set in the command line, it defaults to the format "`<name>` `<packver>` (`<mcver>`)", where each value comes from the `.rpkr.json` file.

### Node

Install resourcepacker locally using **`npm install resourcepacker`**. Two functions are exported: `init` and `pack`.

- `init(options?: object)`:
   Initialize with a `.rpkr.json` configuration file. The following options are available:
  - `force`: Overwrite an existing `.rpkr.json` file.
- `pack(input: string, output: string, options?: object)`: 
  Package a resource pack from folder `input` into folder `output`. Set `input` to `"."` (a dot) to use the current folder.
  - `zipped`: Output to a zip file instead of a folder.

Example:

```js
const rpkr = require('resourcepacker')
rpkr.init({force: true})
rpkr.pack('My Pack', 'Output', {zipped: false})
```

## Configuration

The `.rpkr.json` configuration file can be edited to fine tune the output of your resource pack. Available parameters can be found below, with further explanations found in sub-sections.

### Parameters

* `configver`: The `.rpkr.json` file version. Leave as-is.
* `name`: The name of your resource pack. Defaults to the name of the current folder.
* `packver`: The version of your resource pack. Defaults to "1.0.0".
* `mcver`: The Minecraft version your resource pack is made for. Defaults to "1.16.x".
* `mcsnap` (optional): The Minecraft development version your resource pack is made for. Blank by default.
* `description` (optional): The content in the description field of the automatic `pack.mcmeta` file. Only generates an automatic `pack.mcmeta` when set. More information below.
* `languages` (optional): A list of languages to add to the automatically-generated `pack.mcmeta` file.
* `files`: File globs that will be passed through into your output folder. More information below.

#### Description

The `description` parameter, when set, will be the contents of the `description` key of an automatically-generated `pack.mcmeta` file. An automatic `pack.mcmeta` file is only created when this parameter is set. Other parameters in `.rpkr.json` can be referenced by placing the parameter name in angle brackets (`<>`). Color codes can be declared using either ampersands (`&`) or section signs (`§`) followed by a hexidecimal digit. The value of the `pack_version` key in `pack.mcmeta` is determined by the value of `mcver`.

For example, a `description` of `&b<name> &l<packver>` sets the `description` key of `pack.mcmeta` to the value of the `name` parameter in aqua followed by the contents of the `packver` parameter in bold.

#### Languages

The `languages` parameter is an object where each key is the language code your pack is adding or modifying (which much match a language file inside `assets/minecraft/lang`) with the value being the name of the language in the format "`language` (`variant`)". For example, if your resource pack modifies British English, use `"en_gb": "English (United Kingdom)"`. Multiple custom languages can be added.

#### Files

You can add or remove any globs (file path formats) as you see fit to the `.rpkr.json` configuration file under the "`files`" array; for example, if you have a `readme.txt` file in the root directory that you want outputted, add `readme.txt` to the array. Use "`**`" to specify any number of nested subfolders (including zero) and "`*`" to specify any string of characters (excluding slashes). By default, the following globs are specified in the `files` array:

```
pack.png
pack.mcmeta
assets/**/*.png
assets/**/*.mcmeta
assets/**/*.json
assets/**/lang/**/*.lang
assets/**/texts/**/*.txt
assets/**/sounds/**/*.ogg
assets/**/shaders/**/*.fsh
assets/**/shaders/**/*.bin
```

## Try it out
Clone [this repository](https://github.com/Nixinova/resourcepacker.git) then type **`cd resourcepacker && npm install && node . pack`** to pack the contents of this repository into a clean output folder.
You'll see that out of all of the messy files in this folder, only the `assets`, `pack.png`, and `pack.mcmeta` files are outputted.
