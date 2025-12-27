export function decodeHtmlEntities(input = '') {
  let str = String(input ?? '');

  // Handle potential JSON stringified content ("<p>...</p>")
  if (str.startsWith('"') && str.endsWith('"')) {
    try {
      str = JSON.parse(str);
    } catch {
      str = str.slice(1, -1);
    }
  }

  // Decode repeatedly to handle double-escaped content (e.g. &amp;lt;)
  for (let i = 0; i < 3; i += 1) {
    const prev = str;

    // Decode ampersand FIRST so &amp;lt; becomes &lt; and then can be decoded further.
    str = str.replace(/&amp;/g, '&');

    // Named entities we care about for content HTML
    str = str
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');

    // Numeric entities
    str = str
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(parseInt(num, 10)));

    if (str === prev) break;
  }

  return str;
}


