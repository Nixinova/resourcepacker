# Changelog

## 1.0.0-pre2
*2020-07-16*
- Added `description` property to `.rpkr`, which creates an automatic `pack.mcmeta` file if set.
  - Can contain references to other parameters in the `.rpkr` file (including custom ones) by enclosing the parameter name in angle brackets (`<>`).
  - Ampersands (`&`) are automatically converted to section signs (`§`) to become color codes.
  - Pack version is automatically generated from the value of `mcver`.

## 1.0.0-pre1
*2020-07-16*
- Supports the creation and reading of `.rpkr` configuration files with keys `name`, `packver`, `mcver`, `snapver`, and `files`.
- Supports packaging into either a pre-set (using `.rpkr`) or user-specified output folder.