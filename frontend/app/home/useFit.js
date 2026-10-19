'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Fit-to-window measurement for the dashboard.
 *
 * The dashboard has no scrollers and no pagination: each list renders only whole items that
 * fit its container. These hooks implement the rules from the design handoff, each of which
 * fixed a real defect:
 *
 *   - Measure the *container*, not the viewport. A list's height depends on the hero above it
 *     and the page padding, neither of which the viewport knows about.
 *   - Measure the *rendered* item box; never hardcode it. A hardcoded 76 against a row that
 *     actually rendered 78px sliced glyphs off the last row.
 *   - Read the computed row-gap / column-gap rather than assuming the authored value.
 *   - Floor, never round. Flooring is what guarantees no partial item.
 *   - Recompute on container resize and re-slice the fetched list rather than refetching.
 */

/** Reads a computed pixel length, treating `normal` and other keywords as 0. */
const pxOf = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Counts how many whole items fit along one axis of `ref`.
 *
 * @param {object}   ref       container whose first element child is a rendered item
 * @param {object}   options
 * @param {'row'|'column'} options.axis      'row' measures height, 'column' measures width
 * @param {number}   options.fallbackSize    item size to assume before anything has rendered
 * @param {number}   options.min             floor for the result
 * @param {number}   options.max             ceiling for the result (Infinity for none)
 * @param {boolean}  options.enabled         when false the hook reports `disabledValue`
 * @param {number}   options.disabledValue   count to report while disabled (mobile uses fixed counts)
 * @param {*}        options.recomputeKey    changing this forces a re-measure — pass the item
 *   count so the first real row replaces the placeholder that was measured before data arrived
 * @returns {number} how many whole items fit
 */
export function useFitCount(ref, {
  axis = 'row',
  fallbackSize,
  initial,
  min = 0,
  max = Infinity,
  enabled = true,
  disabledValue = 0,
  recomputeKey = null,
} = {}) {
  // Starts at a sensible count, not at `min`. Before the first successful measurement the
  // dashboard still has to look right, and seeding from `min` is what made every list render
  // a single item until something happened to resize.
  const [count, setCount] = useState(initial ?? min);

  // Depends on the option primitives directly rather than stashing them in a ref: a ref write
  // during render is not allowed, and re-creating the observer when an option actually changes
  // is the correct behaviour anyway.
  const measure = useCallback(() => {
    const node = ref.current;
    if (!node) return;

    if (!enabled) {
      setCount(disabledValue);
      return;
    }

    const isRow = axis === 'row';

    // clientHeight/clientWidth already exclude the border, and these containers carry no
    // padding, so this is the space items actually occupy.
    const available = isRow ? node.clientHeight : node.clientWidth;

    // An unmeasurable container means "not laid out yet", not "nothing fits". Keep whatever
    // count we already have rather than collapsing the list to its minimum.
    if (!available) return;

    const style = window.getComputedStyle(node);
    const gap = pxOf(isRow ? style.rowGap : style.columnGap);

    // Rows measure the rendered child, because a row's real height depends on its fonts and
    // borders and a hardcoded guess slices the last one.
    //
    // Columns must NOT. Cards stretch to fill their grid track, so a rendered card is already
    // as wide as the space available — measuring it always concludes that exactly one fits.
    // The width question is "how many minimum-width cards go in this container", which only
    // the authored minimum can answer.
    let itemSize = fallbackSize;
    if (isRow) {
      const firstItem = node.firstElementChild;
      const measured = firstItem ? firstItem.getBoundingClientRect().height : 0;
      if (measured > 0) itemSize = measured;
    }
    if (!itemSize) return;

    // n items occupy n*item + (n-1)*gap, so adding one gap makes the division exact.
    const fits = Math.floor((available + gap) / (itemSize + gap));
    if (!Number.isFinite(fits)) return;

    setCount(Math.max(min, Math.min(max, fits)));
  }, [ref, axis, fallbackSize, min, max, enabled, disabledValue]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    // ResizeObserver delivers an initial callback when observation starts, so that is the
    // first measurement — no synchronous measure() in the effect body is needed.
    if (typeof ResizeObserver === 'undefined') {
      const frame = requestAnimationFrame(() => measure());
      return () => cancelAnimationFrame(frame);
    }

    const observer = new ResizeObserver(() => measure());
    observer.observe(node);
    // The first child is observed too: its height settles once fonts load, and a stale
    // measurement taken against a fallback font is how a row gets clipped.
    if (node.firstElementChild) observer.observe(node.firstElementChild);

    return () => observer.disconnect();
  }, [ref, measure]);

  // A ResizeObserver only fires when the container's own box changes. These lists are flex
  // children with a fixed share of the column, so their box does not move when their contents
  // arrive — the first measurement was taken against the empty-state placeholder and nothing
  // ever triggered a second one. Re-measure when the item count changes.
  useEffect(() => {
    if (recomputeKey === null) return undefined;
    const frame = requestAnimationFrame(() => measure());
    return () => cancelAnimationFrame(frame);
  }, [recomputeKey, measure]);

  return count;
}

/**
 * Tracks a media query. Returns false during SSR and the first client render so the markup
 * matches, then settles on mount.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, [query]);

  return matches;
}
