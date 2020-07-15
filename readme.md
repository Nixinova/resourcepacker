# resourcepacker

**resourcepacker** (or **rpkr** for short) is a useful tool for packaging *Minecraft* resource packs from a messy working directory into a clean output folder.

## Usage

Install resourcepacker on npm by typing **`npm install -g resourcepacker`** in the command prompt. You must have Node.js installed.

After installing resourcepacker, type **`rpkr init`** to ready your directory with a configuration file (`.rpkr`). For information on how to use this configuration file, please see the **Configuration** section below.

To package a resource pack, simply type **`rpkr pack`** and your resource pack will be packaged into an output folder. You can control which directory the files are outputted to by placing the output folder name in quotes after this command; for example, `rpkr pack "My Pack 1.16"` outputs to folder "My Pack 1.16". If the output folder is not set, it defaults to the format `name packver (mcver)`, where each value comes from the `.rpkr` file.

## Configuration

The `.rpkr` configuration file can be edited to fine tune the output of your resource pack. Comments can be added using a hash (`#`).

### Parameters

* `name`: The name of your resource pack. Defaults to the name of the current folder.
* `packver`: The version of your resource pack. Defaults to "1.0.0".
* `mcver`: The Minecraft version your resource pack is made for. Defaults to "1.16.x".
* `mcsnap`: The Minecraft development version your resource pack is made for. Blank by default.
* `files`: File globs that will be passed through into your output folder. More information below.

### Files

By default, the following globs (file path formats) are found in the `.rpkr` configuration file. You can add or remove and globs that you like; for example, if you have a `readme.txt` file in the root directory that you want outputted, place `readme.txt` on its own line.

```
pack.png
pack.mcmeta
assets/**/*.png
assets/**/*.mcmeta
assets/**/*.json
assets/**/*.lang
assets/**/*.txt
assets/**/*.fsh
assets/**/*.bin
```

Key:
* `*`: Any string of characters, excluding slashes.
* `**`: Any string of characters, including slashes.

## Try it out
Clone [this repository](https://github.com/Nixinova/resourcepacker.git), `cd` into that directory, and then type **`node index.js pack`** to pack the contents of this repository into a clean output folder. You'll see that out of all of the messy files in this folder, only the `assets`, `pack.png`, and `pack.mcmeta` files are outputted.