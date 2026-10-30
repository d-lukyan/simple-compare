# Simple Compare

A lightweight browser extension for comparing two strings character by character.

Built for cases where a single wrong character matters: hashes, tokens, IDs, API keys, filenames, paths.

## Features

- ⚡ Instant comparison while typing
- 🔍 Character-by-character difference highlighting
- 🧬 Exact Unicode code points for mismatches (e.g. `U+0061` vs `U+0430`), so lookalike characters (Latin `a` vs Cyrillic `а`) are not invisible
- 👁️ Invisible characters (tabs, non-breaking and zero-width spaces) are shown as visible markers
- 📏 Length comparison (in Unicode characters)
- 🧹 One-click **Clear All** button
- 🧠 Input is kept in browser memory only and erased when the browser closes

## Use Cases

- Compare cryptographic hashes (MD5, SHA-1, SHA-256, SHA-512, etc.)
- Verify copied API keys or access tokens
- Compare UUIDs
- Check long filenames or paths
- Find a single typo or a hidden character in a single-line string

## How It Works

1. Enter or paste the first string.
    
2. Enter or paste the second string.
    
3. The extension immediately:
    
    - compares string lengths;
    - highlights every mismatched character;
    - lists the code points of the first differences;
    - tells you if the strings are identical.

Strings are compared exactly as entered. Leading and trailing spaces are **not** trimmed: a trailing space counts as a difference.

Input is limited to 2048 characters per field.

## Privacy

Simple Compare works entirely on your device.

- No analytics, tracking, or transmission of entered text. Input is processed locally in the browser.
- No network requests: all code and the Fira Code font are bundled inside the extension.
- Entered text is stored with `storage.session`, which lives in browser memory only. It is cleared when the browser restarts or the extension is reloaded, updated, or disabled.
- This is not encryption. While the browser is open, the text sits in memory in plain form. Do not rely on it as protection against malware running on your machine.

## Permissions

|Permission|Why|
|---|---|
|`storage`|Keeps the entered strings in browser memory so they survive closing the popup. Cleared when the browser closes.|

No host permissions, no content scripts, no background page.

## Limitations

- **Single-line fields only.** Browsers do not keep line breaks in a single-line text field: they are removed or replaced when you paste. Two strings that differ only by a line break (for example a trailing newline copied from a terminal) may be shown as identical or as differing by a space. Strip or inspect line breaks before comparing.
- Comparison is by Unicode code point, not by grapheme cluster. Composed sequences (e.g. some emoji with modifiers, or `é` as `e` + combining accent) are compared piece by piece.
- The comparison is positional. One inserted character early in the string will mark everything after it as different. This is a strict comparator, not a diff tool.

## Installation

1. Clone or download this repository.
2. Open your browser's extensions page.
3. Enable **Developer Mode** (Chromium-based browsers).
4. Select **Load Temporary Add-on** (Firefox) or **Load unpacked** (Chromium-based browsers).
5. Choose the project folder.

Note: Firefox temporary add-ons are unloaded when the browser restarts. That is a Firefox behavior and not related to the extension's storage.

## Credits

- Font: [Fira Code](https://github.com/tonsky/FiraCode).

## License

Source code: see `LICENSE`. Fira Code font: SIL Open Font License 1.1, see `OFL.txt`.
