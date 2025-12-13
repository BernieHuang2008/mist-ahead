import { storage, save_localstorage } from '../utils/localstorage.js';
import { generateKeyPair } from '../utils/crypto.js';

document.addEventListener('DOMContentLoaded', () => {
    const settingsTab = document.getElementById('settings-tab');
    if (!settingsTab) return;

    // Clear existing content
    settingsTab.innerHTML = '';

    // Create Settings UI
    const container = document.createElement('div');
    container.className = 'settings-container';

    // Username Section
    const userSection = document.createElement('div');
    userSection.className = 'settings-section';
    
    const userLabel = document.createElement('label');
    userLabel.textContent = 'USERNAME / CALLSIGN';
    userLabel.className = 'settings-label';

    const userInput = document.createElement('input');
    userInput.type = 'text';
    userInput.value = storage.username || '';
    userInput.className = 'settings-input';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'UPDATE IDENTITY';
    saveBtn.className = 'full-width-btn';
    saveBtn.onclick = () => {
        storage.username = userInput.value;
        save_localstorage();
        renderIDCard(); // Refresh card
        alert('Identity updated.');
    };

    userSection.appendChild(userLabel);
    userSection.appendChild(userInput);
    userSection.appendChild(saveBtn);

    // Key Management Section
    const keySection = document.createElement('div');
    keySection.className = 'settings-section';

    const keyLabel = document.createElement('div');
    keyLabel.textContent = 'CRYPTOGRAPHIC KEYS';
    keyLabel.className = 'settings-label';

    const genKeyBtn = document.createElement('button');
    genKeyBtn.textContent = 'GENERATE NEW KEYPAIR';
    genKeyBtn.className = 'full-width-btn btn-dark';
    genKeyBtn.onclick = async () => {
        if (confirm("Generating a new keypair will invalidate previous signatures. Continue?")) {
            const keys = await generateKeyPair();
            storage.sk = keys.privateKey;
            storage.pk = keys.publicKey;
            save_localstorage();
            renderIDCard(); // Refresh card
            alert('New RSA-2048 keypair generated.');
        }
    };

    keySection.appendChild(keyLabel);
    keySection.appendChild(genKeyBtn);

    // ID Card Section
    const cardSection = document.createElement('div');
    cardSection.id = 'id-card-container';
    
    container.appendChild(userSection);
    container.appendChild(keySection);
    container.appendChild(cardSection);
    settingsTab.appendChild(container);

    renderIDCard();
});

function renderIDCard() {
    const container = document.getElementById('id-card-container');
    if (!container) return;

    container.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'id-card';

    // Background decoration
    const deco = document.createElement('div');
    deco.className = 'id-card-deco';
    card.appendChild(deco);

    // Header
    const header = document.createElement('div');
    header.className = 'id-card-header';
    header.innerHTML = `
        <div class="id-card-title">MIST AHEAD - ID CARD</div>
        <div class="id-card-dot"></div>
    `;
    card.appendChild(header);

    // Content
    const content = document.createElement('div');
    content.className = 'id-card-content';

    // Avatar
    const avatar = document.createElement('div');
    avatar.className = 'id-card-avatar';
    avatar.innerHTML = '<span class="id-card-avatar-icon">👤</span>';
    content.appendChild(avatar);

    // Info
    const info = document.createElement('div');
    info.className = 'id-card-info';
    
    const name = storage.username || 'UNKNOWN';
    const pkShort = storage.pk ? storage.pk.substring(0, 16) + '...' : 'NO KEY';

    info.innerHTML = `
        <div class="id-card-name">${name}</div>
        <div class="id-card-pk-label">PUBLIC KEY (RSA-2048)</div>
        <div class="id-card-pk-value">${pkShort}</div>
        <button class="full-width-btn player-profile-btn" onclick="window.location.href='playerprofile.html'">VIEW PROFILE</button>
    `;
    content.appendChild(info);
    card.appendChild(content);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'id-card-footer';
    footer.innerHTML = `
        <div>ACCESS LEVEL: 1</div>
        <div>${storage.pk ? 'VERIFIED' : 'UNVERIFIED'}</div>
    `;
    card.appendChild(footer);

    container.appendChild(card);
}
