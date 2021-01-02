# Changelog

## 1.0.3
*2021-01-02*
- Added support for pack version 7 (*Minecraft* 1.17+).
- Added a warning when initialising inside an existing project.
- Changed the output folder name to more accurately combine the release and development versions.
- Changed the output of `rpkr` (without any parameters) to display a welcome message instead of an error.
- Bumped copyfiles dependency from 2.3.0 to 2.4.1.

## 1.0.2
*2020-08-08*
- Fixed special characters in custom parameter names not being escaped when substituting.

## 1.0.1
*2020-08-08*
- Added support for pack version 6 (*Minecraft* 1.16.2+).

## 1.0.0
*2020-08-01*
- Added `configver` parameter to the `.rpkr.json` configuration file.

### 1.0.0-pre3
*2020-07-18*
- **Breaking:** Changed configuration file from `.rpkr` (in a custom format) to `.rpkr.json` (in a JSON format).
- Added support for automatic langugage generation by setting the values of language codes in the `.rpkr.json` configuration file.

### 1.0.0-pre2
*2020-07-16*
- Added `description` property to `.rpkr`, which creates an automatic `pack.mcmeta` file if set.
  - Can contain references to other parameters in the `.rpkr` file (including custom ones) by enclosing the parameter name in angle brackets (`<>`).
  - Ampersands (`&`) are automatically converted to section signs (`§`) to become color codes.
  - Pack version is automatically generated from the value of `mcver`.
- Added support for custom variables in the `.rpkr` configuration file.

### 1.0.0-pre1
*2020-07-16*
- Supports the creation and reading of `.rpkr` configuration files with keys `name`, `packver`, `mcver`, `snapver`, and `files`.
- Supports packaging into either a pre-set (using `.rpkr`) or user-specified output folder.