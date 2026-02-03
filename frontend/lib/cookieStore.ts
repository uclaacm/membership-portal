class CookieStore {
  static set(key: string, value: string) {
    document.cookie = `${key}=${value}`;
  }

  static get(key: string | number) {
    if (!document.cookie || document.cookie.length === 0) return undefined;
    const cookies: Record<string, string> = {};
    document.cookie.split(";").forEach(cookie => {
      cookies[cookie.split("=")[0].trim()] = cookie.split("=")[1].trim();
    });
    return cookies[key];
  }

  static remove(key: any) {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  }
}

export default CookieStore;
