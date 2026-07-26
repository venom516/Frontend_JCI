function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16) || 0,
    g: parseInt(h.substring(2, 4), 16) || 0,
    b: parseInt(h.substring(4, 6), 16) || 0,
  };
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function parseColor(color) {
  if (!color) return null;
  if (color.startsWith('#')) return hexToRgb(color);
  if (color.startsWith('rgb')) {
    const m = color.match(/(\d+)/g);
    if (m) return { r: +m[0] || 0, g: +m[1] || 0, b: +m[2] || 0 };
  }
  const map = {
    black: '#000000', white: '#ffffff', red: '#ff0000', blue: '#0000ff',
    green: '#008000', yellow: '#ffff00', orange: '#ffa500', purple: '#800080',
    gray: '#808080', navy: '#000080', maroon: '#800000', teal: '#008080',
  };
  if (map[color.toLowerCase()]) return hexToRgb(map[color.toLowerCase()]);
  return null;
}

export function getContrastColor(bgColor) {
  const rgb = parseColor(bgColor);
  if (!rgb) return 'inherit';
  return getLuminance(rgb.r, rgb.g, rgb.b) > 0.5 ? '#000000' : '#ffffff';
}

export function useSmartColor(bgColor) {
  return getContrastColor(bgColor);
}
