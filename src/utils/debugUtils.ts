export const snapshot = (el: Element): any => ({
    html: el.outerHTML,
    rect: el.getBoundingClientRect(),
    children: Array.from(el.children).map(child => snapshot(child))
});