var storage = {
    "inventory": [],
    "username": "Unknown Explorer",
    "sk": null,
    "pk": null
}

function save_localstorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('mist_ahead_storage', JSON.stringify(storage));
    }
}

function load_localstorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
        var stored = window.localStorage.getItem('mist_ahead_storage');
        if (stored) {
            storage = JSON.parse(stored);
        }
    }
}

load_localstorage();

export { storage, save_localstorage, load_localstorage };
