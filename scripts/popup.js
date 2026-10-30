'use strict';

(() => {
  const input1 = document.getElementById('input-1');
  const input2 = document.getElementById('input-2');
  const resultLength = document.getElementById('result-length');
  const resultCharacter = document.getElementById('result-character');
  const clearBtn = document.getElementById('clear');

  const MAX_INPUT_LENGTH = 2048;
  const MAX_DIFF_DETAILS = 5;
  const KEYS = ['saved_input_1', 'saved_input_2'];

  input1.maxLength = MAX_INPUT_LENGTH;
  input2.maxLength = MAX_INPUT_LENGTH;

  // In-memory only: cleared by the browser when it closes. Nothing goes to disk.
  const store =
    typeof chrome !== 'undefined' && chrome.storage && chrome.storage.session
      ? chrome.storage.session
      : null;

  /* ---------- DOM helpers (no innerHTML anywhere) ---------- */

  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function clearNode(el) {
    el.className = '';
    el.replaceChildren();
  }

  /* ---------- Character handling ---------- */

  // Iterate by Unicode code point, not UTF-16 code unit
  // (so emoji / astral characters are not split into broken halves).
  function toChars(str) {
    return Array.from(str);
  }

  function codePointLabel(ch) {
    if (ch === undefined) return 'none';
    return 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
  }

  // Make invisible / non-standard whitespace characters visible.
  function displayChar(ch) {
    if (ch === undefined) return '•';
    if (ch === ' ') return ' ';
    if (ch === '\t') return '→';
    if (ch === '\n' || ch === '\r') return '↵';
    if (/[\p{C}\p{Z}]/u.test(ch)) return '□';
    return ch;
  }

  function clampToLimit(el) {
    if (el.value.length > MAX_INPUT_LENGTH) {
      el.value = el.value.slice(0, MAX_INPUT_LENGTH);
    }
  }

  function getValues() {
    return [input1.value, input2.value];
  }

  /* ---------- Rendering ---------- */

  function updateLengths(chars1, chars2) {
    clearNode(resultLength);

    const len1 = chars1.length;
    const len2 = chars2.length;
    if (len1 === 0 && len2 === 0) return;

    const lenClass = len1 === len2 ? 'len-match' : 'len-mismatch';
    const frag = document.createDocumentFragment();

    if (len1 > 0) {
      frag.append('Length String 1: ', node('span', lenClass, String(len1)));
    }
    if (len1 > 0 && len2 > 0) frag.append(document.createElement('br'));
    if (len2 > 0) {
      frag.append('Length String 2: ', node('span', lenClass, String(len2)));
    }

    resultLength.append(frag);
  }

  function renderComparison(val1, val2, chars1, chars2) {
    clearNode(resultCharacter);

    if (val1 === '' && val2 === '') return;

    if (val1 === val2) {
      resultCharacter.textContent = 'Complete match! ✅';
      resultCharacter.className = 'match';
      return;
    }

    const maxLength = Math.max(chars1.length, chars2.length);
    const line1 = document.createElement('div');
    const line2 = document.createElement('div');
    line1.append('Str 1: ');
    line2.append('Str 2: ');

    const diffs = [];

    for (let i = 0; i < maxLength; i++) {
      const c1 = chars1[i];
      const c2 = chars2[i];
      const same = c1 === c2;

      if (same) {
        line1.append(displayChar(c1));
        line2.append(displayChar(c2));
      } else {
        line1.append(node('span', 'char-error', displayChar(c1)));
        line2.append(node('span', 'char-error', displayChar(c2)));
        diffs.push({ pos: i + 1, c1, c2 });
      }
    }

    resultCharacter.append(line1, line2);

    // Exact code points of the first differences (catches homoglyphs like
    // Latin "a" U+0061 vs Cyrillic "а" U+0430, and zero-width characters).
    const shown = diffs.slice(0, MAX_DIFF_DETAILS);
    for (const d of shown) {
      resultCharacter.append(
        node('div', 'diff-details', `Pos ${d.pos}: ${codePointLabel(d.c1)} vs ${codePointLabel(d.c2)}`)
      );
    }
    if (diffs.length > shown.length) {
      resultCharacter.append(
        node('div', 'diff-details', `…and ${diffs.length - shown.length} more differences`)
      );
    }
  }

  function render() {
    const [val1, val2] = getValues();
    const chars1 = toChars(val1);
    const chars2 = toChars(val2);
    updateLengths(chars1, chars2);
    renderComparison(val1, val2, chars1, chars2);
  }

  /* ---------- Session storage (memory only) ---------- */

  async function saveToStorage() {
    if (!store) return;
    try {
      await store.set({
        saved_input_1: input1.value,
        saved_input_2: input2.value
      });
    } catch (err) {
      console.error('Storage write failed:', err);
    }
  }

  async function clearStorage() {
    if (!store) return;
    try {
      await store.remove(KEYS);
    } catch (err) {
      console.error('Storage clear failed:', err);
    }
  }

  async function restoreFromStorage() {
    if (!store) return;
    try {
      const data = await store.get(KEYS);
      if (typeof data.saved_input_1 === 'string') input1.value = data.saved_input_1;
      if (typeof data.saved_input_2 === 'string') input2.value = data.saved_input_2;
    } catch (err) {
      console.error('Storage read failed:', err);
    }
  }

  // One-time cleanup of data left on disk by older versions (localStorage).
  function purgeLegacyStorage() {
    try {
      ['saved_input_1', 'saved_input_2', 'saved_at'].forEach((k) => localStorage.removeItem(k));
    } catch (_) {
      /* ignore */
    }
  }

  /* ---------- Events ---------- */

  function handleInput() {
    render();
    saveToStorage();
  }

  input1.addEventListener('input', handleInput);
  input2.addEventListener('input', handleInput);

  clearBtn.addEventListener('click', () => {
    input1.value = '';
    input2.value = '';
    clearStorage();
    render();
  });

  /* ---------- Init ---------- */

  (async () => {
    purgeLegacyStorage();
    await restoreFromStorage();
    clampToLimit(input1);
    clampToLimit(input2);
    render();
  })();
})();
