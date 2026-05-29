/**
 * UI/UX Suite — Screenshot annotation overlay builders
 *
 * Pure, zero-dependency STRING builders. None of these functions touch the DOM
 * at module-load time; they return JS source strings meant to be handed to a
 * Playwright `page.evaluate(string)` call so the work happens inside the browser.
 *
 * The overlay draws labeled red outline <div>s on top of the page so a
 * screenshot can highlight exactly which elements a finding refers to. Every
 * injected node carries an id prefixed with ANNOT_PREFIX so removeOverlayScript()
 * can find and delete them again — annotations must never be left behind (the
 * audit-then-suggest rule: we never mutate the user's real page state, we add a
 * transient overlay, screenshot, then remove it).
 */

'use strict';

const ANNOT_PREFIX = 'uiux-annot';
const MAX_VIEWPORT_WIDTH = 1920;
const MAX_VIEWPORT_HEIGHT = 1080;

/**
 * Clamp a requested viewport to the hard ceiling enforced project-wide
 * (1920x1080). Screenshots above this trip the Claude many-image size limit, so
 * the cap is non-negotiable. Falsy / non-finite / non-positive dimensions fall
 * back to the maximum so callers always get a usable viewport.
 *
 * @param {{width?:number, height?:number}} viewport
 * @returns {{width:number, height:number}}
 */
function clampViewport(viewport) {
  const v = viewport || {};
  let width = Number(v.width);
  let height = Number(v.height);
  if (!Number.isFinite(width) || width <= 0) width = MAX_VIEWPORT_WIDTH;
  if (!Number.isFinite(height) || height <= 0) height = MAX_VIEWPORT_HEIGHT;
  width = Math.min(Math.round(width), MAX_VIEWPORT_WIDTH);
  height = Math.min(Math.round(height), MAX_VIEWPORT_HEIGHT);
  return { width, height };
}

/**
 * Coerce one raw box into a safe numeric box. Returns null for unusable boxes
 * (missing/non-finite geometry) so the overlay never positions a NaN div.
 */
function normalizeBox(box) {
  if (!box || typeof box !== 'object') return null;
  const x = Number(box.x);
  const y = Number(box.y);
  const width = Number(box.width);
  const height = Number(box.height);
  if (![x, y, width, height].every(Number.isFinite)) return null;
  if (width <= 0 || height <= 0) return null;
  return {
    x,
    y,
    width,
    height,
    label: box.label != null ? String(box.label) : '',
  };
}

/**
 * Build a string of JS that, when run via page.evaluate, absolutely-positions a
 * labeled red-outline <div> over each {x, y, width, height, label} box.
 *
 * The boxes are serialized into the source (JSON), so the returned string is
 * fully self-contained — no arguments need to be passed to evaluate(). Every
 * created node is id-prefixed (ANNOT_PREFIX) and the container can be removed by
 * removeOverlayScript().
 *
 * @param {Array<{x:number,y:number,width:number,height:number,label?:string}>} boxes
 * @returns {string} JS source for page.evaluate
 */
function overlayScript(boxes) {
  const list = Array.isArray(boxes) ? boxes : [];
  const clean = list.map(normalizeBox).filter(Boolean);
  // JSON.stringify is safe to embed: it escapes quotes/backslashes/control chars.
  const data = JSON.stringify(clean);
  const prefix = JSON.stringify(ANNOT_PREFIX);

  return `(() => {
  var PREFIX = ${prefix};
  var boxes = ${data};
  var doc = document;
  // Remove any stale overlay first so re-annotating a page is idempotent.
  var stale = doc.getElementById(PREFIX + '-root');
  if (stale && stale.parentNode) stale.parentNode.removeChild(stale);

  var root = doc.createElement('div');
  root.id = PREFIX + '-root';
  root.setAttribute('data-uiux-annotation', 'true');
  root.style.cssText = 'position:absolute;top:0;left:0;width:0;height:0;margin:0;padding:0;border:0;z-index:2147483647;pointer-events:none;';

  for (var i = 0; i < boxes.length; i++) {
    var b = boxes[i];
    var outline = doc.createElement('div');
    outline.id = PREFIX + '-box-' + i;
    outline.setAttribute('data-uiux-annotation', 'true');
    outline.style.cssText = [
      'position:absolute',
      'left:' + b.x + 'px',
      'top:' + b.y + 'px',
      'width:' + b.width + 'px',
      'height:' + b.height + 'px',
      'box-sizing:border-box',
      'border:2px solid #e11d48',
      'background:rgba(225,29,72,0.08)',
      'border-radius:2px',
      'pointer-events:none'
    ].join(';') + ';';

    if (b.label) {
      var tag = doc.createElement('div');
      tag.id = PREFIX + '-label-' + i;
      tag.setAttribute('data-uiux-annotation', 'true');
      tag.textContent = b.label;
      tag.style.cssText = [
        'position:absolute',
        'left:0',
        'top:-18px',
        'min-height:16px',
        'padding:1px 5px',
        'font:600 11px/14px -apple-system,Segoe UI,Roboto,sans-serif',
        'color:#ffffff',
        'background:#e11d48',
        'border-radius:2px',
        'white-space:nowrap',
        'pointer-events:none'
      ].join(';') + ';';
      outline.appendChild(tag);
    }
    root.appendChild(outline);
  }

  (doc.body || doc.documentElement).appendChild(root);
  return boxes.length;
})()`;
}

/**
 * Build a string of JS that removes every node the overlay injected. Safe to run
 * even if no overlay is present (no-op). Removes the id'd root plus any orphaned
 * nodes tagged data-uiux-annotation as a belt-and-suspenders cleanup.
 *
 * @returns {string} JS source for page.evaluate
 */
function removeOverlayScript() {
  const prefix = JSON.stringify(ANNOT_PREFIX);
  return `(() => {
  var PREFIX = ${prefix};
  var removed = 0;
  var root = document.getElementById(PREFIX + '-root');
  if (root && root.parentNode) { root.parentNode.removeChild(root); removed++; }
  var orphans = document.querySelectorAll('[data-uiux-annotation="true"]');
  for (var i = 0; i < orphans.length; i++) {
    if (orphans[i].parentNode) { orphans[i].parentNode.removeChild(orphans[i]); removed++; }
  }
  return removed;
})()`;
}

module.exports = {
  overlayScript,
  removeOverlayScript,
  clampViewport,
  ANNOT_PREFIX,
  MAX_VIEWPORT_WIDTH,
  MAX_VIEWPORT_HEIGHT,
};
