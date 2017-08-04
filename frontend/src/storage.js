const storageAvailable = type => {
	try {
		var storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	} catch(e) {
		return false;
	}
};

class CookieStore {
    static set(key, value) {
        console.log("SET COOKIE", key, value);
        document.cookie = `${key}=${value}`;
        console.log(document.cookie);
    }
    static get(key) {
        console.log("GET COOKIE", key);
        const cookies = {};
        document.cookie.split(";").forEach(cookie => {
            cookies[cookie.split("=")[0].trim()] = cookie.split("=")[1].trim();
        });
        console.log(document.cookies);
        console.log(cookies);
        return cookies[key];
    }
    static remove(key) {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`
    }
}

class LocalStore {
    static set(key, value) {
        console.log("SET LOCAL", key, value);
        window.localStorage.setItem(key, value);
    }
    static get(key, value) {
        console.log("GET LOCAL", key, value);
        window.localStorage.getItem(key);
    }
    static remove(key) {
        window.localStorage.removeItem(key);
    }
}

export default (storageAvailable('localStorage') ? LocalStore : CookieStore);