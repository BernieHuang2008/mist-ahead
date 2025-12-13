import { storage, load_localstorage } from '../utils/localstorage.js';

document.addEventListener('DOMContentLoaded', async () => {
    load_localstorage();
    renderPlayerProfile();
});

function renderPlayerProfile() {
    const username = storage.username || "UNKNOWN";
    const pk = storage.pk || "NOT GENERATED";
    const sk = storage.sk || "NOT GENERATED";

    document.getElementById('player-name').textContent = username;
    document.getElementById('player-pk').textContent = pk;
    
    // For private key, we might want to show it but maybe warn or truncate if it's too long for the UI?
    // RSA private keys are long. Let's just dump it for now as requested.
    document.getElementById('player-sk').textContent = sk;
    
    // Update date
    document.getElementById('doc-date').textContent = "DATE: " + new Date().toLocaleDateString().toUpperCase();
    
    // Status
    const statusElem = document.getElementById('player-status');
    if (storage.pk && storage.sk) {
        statusElem.textContent = "VERIFIED";
        statusElem.className = "stat-value status-complete";
    } else {
        statusElem.textContent = "UNVERIFIED";
        statusElem.className = "stat-value status-inprogress";
    }

    // Footer ID (Generate a pseudo-random ID based on username or just random)
    document.getElementById('footer-id').textContent = "USR-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}
