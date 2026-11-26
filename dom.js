// Builds DOM from the extension's own static markup (icon SVGs, small
// templates) without innerHTML: the string is parsed by DOMParser into a
// separate, inert document and the resulting nodes are moved in. Shared by
// the content scripts (loaded first) and the popup.
(function (global) {
  'use strict';

  function parseMarkup(markup) {
    const doc = new DOMParser().parseFromString(`<!doctype html><body>${markup}</body>`, 'text/html');
    const fragment = document.createDocumentFragment();
    fragment.append(...doc.body.childNodes);
    return fragment;
  }

  function setMarkup(element, markup) {
    element.replaceChildren(parseMarkup(markup));
  }

  global.BetterAisDom = { parseMarkup, setMarkup };
})(typeof self !== 'undefined' ? self : window);
