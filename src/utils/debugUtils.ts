export const snapshot = (el: Element): any => ({
    html: el.outerHTML, // /skip for debug use only
    rect: el.getBoundingClientRect(),
    children: Array.from(el.children).map(child => snapshot(child))
});