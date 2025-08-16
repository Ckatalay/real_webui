document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('calcForm');
  const diagonal1Input = document.getElementById('diagonal1');
  const aspect1Input = document.getElementById('aspect_ratio1');
  const diagonal2Input = document.getElementById('diagonal2');
  const aspect2Input = document.getElementById('aspect_ratio2');

  const rect1 = document.getElementById('screenRect1');
  const rect2 = document.getElementById('screenRect2');
  const areaLabel1 = document.getElementById('areaLabel1');
  const areaLabel2 = document.getElementById('areaLabel2');

  const compare = document.getElementById('compare');

  let pixelsPerInch = null;

  function syncDefaults() {
    // Mark form as pristine to avoid Safari close-tab prompt
    diagonal1Input.defaultValue = diagonal1Input.value;
    aspect1Input.defaultValue = aspect1Input.value;
    diagonal2Input.defaultValue = diagonal2Input.value;
    aspect2Input.defaultValue = aspect2Input.value;
  }

  function viewportLimits() {
    const paddingX = 48; // total horizontal padding/margins around content
    const paddingY = 48; // total vertical padding/margins
    const maxW = Math.max(1, window.innerWidth - paddingX);
    const maxH = Math.max(1, window.innerHeight - paddingY - 220); // leave space for inputs
    return { maxW, maxH };
  }

  function getInchesFromDom(rectEl) {
    const w = parseFloat(rectEl.getAttribute('data-width-inches'));
    const h = parseFloat(rectEl.getAttribute('data-height-inches'));
    return { w, h };
  }

  function computeFitScale(widthIn1, heightIn1, widthIn2, heightIn2) {
    const { maxW, maxH } = viewportLimits();

    // Available width is split between two screens plus gaps
    const gap = 16; // CSS .compare gap
    const containerW = maxW - gap; // total width available for both rectangles

    // We want a single scale s such that both screens fit: s*max(widthIn1, widthIn2) must fit half width each
    // More precisely: s*widthIn1 + s*widthIn2 <= containerW  and  max(s*heightIn1, s*heightIn2) <= maxH
    const scaleW = containerW / (widthIn1 + widthIn2);
    const scaleH = maxH / Math.max(heightIn1, heightIn2);

    return Math.min(scaleW, scaleH);
  }

  function render() {
    const s1 = getInchesFromDom(rect1);
    const s2 = getInchesFromDom(rect2);

    // Initialize ppi or constrain it so both screens fit
    const fitScale = computeFitScale(s1.w, s1.h, s2.w, s2.h);
    if (pixelsPerInch === null) {
      pixelsPerInch = fitScale;
    }
    if (s1.w * pixelsPerInch + s2.w * pixelsPerInch > viewportLimits().maxW ||
        Math.max(s1.h, s2.h) * pixelsPerInch > viewportLimits().maxH) {
      pixelsPerInch = fitScale;
    }

    const w1 = Math.max(1, s1.w * pixelsPerInch);
    const h1 = Math.max(1, s1.h * pixelsPerInch);
    const w2 = Math.max(1, s2.w * pixelsPerInch);
    const h2 = Math.max(1, s2.h * pixelsPerInch);

    rect1.style.width = `${w1}px`;
    rect1.style.height = `${h1}px`;
    rect2.style.width = `${w2}px`;
    rect2.style.height = `${h2}px`;

    areaLabel1.textContent = `Area: ${(s1.w * s1.h).toFixed(2)} in²`;
    areaLabel2.textContent = `Area: ${(s2.w * s2.h).toFixed(2)} in²`;
  }

  async function fetchScreen(diagonal, aspectRatio) {
    const res = await fetch('/api/calc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diagonal, aspect_ratio: aspectRatio })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to calculate');
    return data;
  }

  async function fetchAndRenderBoth() {
    const d1 = parseFloat(diagonal1Input.value);
    const a1 = aspect1Input.value.trim();
    const d2 = parseFloat(diagonal2Input.value);
    const a2 = aspect2Input.value.trim();
    if (!d1 || !a1 || !d2 || !a2) return;

    try {
      const [s1, s2] = await Promise.all([
        fetchScreen(d1, a1),
        fetchScreen(d2, a2)
      ]);
      rect1.setAttribute('data-width-inches', s1.width);
      rect1.setAttribute('data-height-inches', s1.height);
      rect2.setAttribute('data-width-inches', s2.width);
      rect2.setAttribute('data-height-inches', s2.height);
      syncDefaults();
      render();
    } catch (err) {
      areaLabel1.textContent = `Error: ${err.message}`;
      areaLabel2.textContent = `Error: ${err.message}`;
    }
  }

  function debounce(fn, delay = 250) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }

  const debouncedBoth = debounce(() => { syncDefaults(); fetchAndRenderBoth(); }, 250);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    syncDefaults();
    fetchAndRenderBoth();
  });

  // Keep form pristine as user types to avoid Safari close prompt
  diagonal1Input.addEventListener('input', debouncedBoth);
  aspect1Input.addEventListener('input', debouncedBoth);
  diagonal2Input.addEventListener('input', debouncedBoth);
  aspect2Input.addEventListener('input', debouncedBoth);

  window.addEventListener('resize', render);
  window.addEventListener('orientationchange', render);

  // Initial
  syncDefaults();
  render();
}); 