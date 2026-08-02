'use strict';

(() => {
  const input1 = document.getElementById('input-1');
  const input2 = document.getElementById('input-2');
  const resultLength = document.getElementById('result-length');
  const resultCharacter = document.getElementById('result-character');
  const clearBtn = document.getElementById('clear');

  const MAX_INPUT_LENGTH = 10000;
  input1.maxLength = MAX_INPUT_LENGTH;
  input2.maxLength = MAX_INPUT_LENGTH;

  const STORAGE_TTL_MS = 5 * 60 * 1000;

  const ESCAPE_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch] || ch);
  }

  function clampToLimit(el) {
    if (el.value.length > MAX_INPUT_LENGTH) {
      el.value = el.value.slice(0, MAX_INPUT_LENGTH);
    }
  }

  function getValues() {
    return [input1.value.trim(), input2.value.trim()];
  }

  function updateLengths(val1, val2) {
    const len1 = val1.length;
    const len2 = val2.length;

    if (len1 === 0 && len2 === 0) {
      resultLength.innerHTML = '';
      return;
    }

    const lenClass = len1 === len2 ? 'len-match' : 'len-mismatch';
    const parts = [];
    if (len1 > 0) parts.push(`Length String 1: <span class="${lenClass}">${len1}</span>`);
    if (len2 > 0) parts.push(`Length String 2: <span class="${lenClass}">${len2}</span>`);
    resultLength.innerHTML = parts.join('<br>');
  }

  function renderComparison(val1, val2) {
    resultCharacter.className = '';
    resultCharacter.innerHTML = '';

    if (val1 === '' && val2 === '') return;

    if (val1 === val2) {
      resultCharacter.textContent = 'Complete match! ✅';
      resultCharacter.className = 'match';
      return;
    }

    const maxLength = Math.max(val1.length, val2.length);
    let line1 = '';
    let line2 = '';

    for (let i = 0; i < maxLength; i++) {
      const c1 = val1[i];
      const c2 = val2[i];
      const same = c1 === c2;
      const shown1 = c1 !== undefined ? escapeHTML(c1) : '•';
      const shown2 = c2 !== undefined ? escapeHTML(c2) : '•';

      line1 += same ? shown1 : `<span class="char-error">${shown1}</span>`;
      line2 += same ? shown2 : `<span class="char-error">${shown2}</span>`;
    }

    resultCharacter.innerHTML = `Str 1: ${line1}<br>Str 2: ${line2}`;
  }

  function render() {
    const [val1, val2] = getValues();
    updateLengths(val1, val2);
    renderComparison(val1, val2);
  }

  function saveToStorage() {
    try {
      localStorage.setItem('saved_input_1', input1.value);
      localStorage.setItem('saved_input_2', input2.value);
      localStorage.setItem('saved_at', String(Date.now()));
    } catch (err) {
      console.error('Storage write failed:', err);
    }
  }

  function clearStorage() {
    try {
      localStorage.removeItem('saved_input_1');
      localStorage.removeItem('saved_input_2');
      localStorage.removeItem('saved_at');
    } catch (err) {
      console.error('Storage clear failed:', err);
    }
  }

  function restoreFromStorage() {
    try {
      const savedAt = Number(localStorage.getItem('saved_at'));
      const isFresh = savedAt && (Date.now() - savedAt) <= STORAGE_TTL_MS;

      if (!isFresh) {
        clearStorage();
        return;
      }

      const saved1 = localStorage.getItem('saved_input_1');
      const saved2 = localStorage.getItem('saved_input_2');
      if (saved1 !== null) input1.value = saved1;
      if (saved2 !== null) input2.value = saved2;
    } catch (err) {
      console.error('Storage read failed:', err);
    }
  }

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

  restoreFromStorage();
  clampToLimit(input1);
  clampToLimit(input2);
  render();
})();
