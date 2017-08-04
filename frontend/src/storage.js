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
    set(key, value) {
        document.cookie = `${key}=${value}`;
    }
    get(key) {
        const cookies = {};
        document.cookie.split(";").forEach(cookie => {
            cookies[cookie.split("=")[0].trim()] = cookie.split("=")[1].trim();
        });
        return cookies[key];
    }
    remove(key) {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`
    }
}

class LocalStore {
    set(key, value) {
        window.localStorage.setItem(key, value);
    }
    get(key, value) {
        window.localStorage.getItem(key);
    }
    remove(key) {
        window.localStorage.removeItem(key);
    }
}

export default (storageAvailable('localStorage') ? new LocalStore() : new CookieStore());