class CookieStore {
  static set(key: string, value: string) {
    document.cookie = `${key}=${value}`;
  }

  static get(key: string | number) {
    if (!document.cookie || document.cookie.length === 0) return undefined;
    const cookies: Record<string, string> = {};
    document.cookie.split(";").forEach(cookie => {
      const idx = cookie.indexOf("=");
      if (idx === -1) return;
      cookies[cookie.slice(0, idx).trim()] = cookie.slice(idx + 1).trim();
    });
    return cookies[key];
  }

  static remove(key: any) {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  }
}

export default CookieStore;
