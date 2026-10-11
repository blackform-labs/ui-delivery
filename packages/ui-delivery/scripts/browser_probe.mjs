/** Observations only. Caller provides a Playwright page and owns assertions/artifacts. */
export async function inspectLayout(page) {
  return page.evaluate(() => ({
    url: location.href,
    viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio, visualScale: visualViewport?.scale },
    document: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
    headings: [...document.querySelectorAll('h1,h2,h3')].map(el => ({level: el.tagName, text: el.textContent.trim()})),
    controls: [...document.querySelectorAll('a[href],button,input,select,textarea,summary')].map(el => {
      const rect = el.getBoundingClientRect();
      return {tag: el.tagName, id: el.id, text: (el.textContent || '').trim(), width: rect.width, height: rect.height, disabled: !!el.disabled};
    })
  }));
}

export async function inspectFocus(page) {
  return page.evaluate(() => {
    const el = document.activeElement, style = getComputedStyle(el), rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(innerWidth - 1, rect.x + rect.width / 2));
    const y = Math.max(0, Math.min(innerHeight - 1, rect.y + rect.height / 2));
    const hit = document.elementFromPoint(x, y);
    return {tag: el.tagName, id: el.id, text: (el.textContent || '').trim(),
      focusVisible: el.matches(':focus-visible'), outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth, outlineColor: style.outlineColor,
      inViewport: rect.top >= 0 && rect.left >= 0 && rect.bottom <= innerHeight + 1 && rect.right <= innerWidth + 1,
      centerUnobscured: hit === el || el.contains(hit)};
  });
}
