const parseCookies = (cookieHeader = '') => {
  const cookies = {};
  String(cookieHeader)
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const eq = part.indexOf('=');
      if (eq === -1) return;
      const key = part.slice(0, eq).trim();
      const value = part.slice(eq + 1).trim();
      cookies[key] = decodeURIComponent(value);
    });
  return cookies;
};

module.exports = parseCookies;
