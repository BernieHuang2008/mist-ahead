import { storage, load_localstorage } from '../utils/localstorage.js';
import { genimg } from '../utils/ai_img.js';
import { signData } from '../utils/crypto.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Ensure storage is loaded
    load_localstorage();
    
    // Get item index from URL
    const urlParams = new URLSearchParams(window.location.search);
    const index = urlParams.get('index');

    if (index === null || !storage.inventory[index]) {
        document.body.innerHTML = "<div class='error-container'><h1>Error: Item not found</h1><p>Please provide a valid item index in the URL (e.g., ?index=0)</p></div>";
        return;
    }

    const item = storage.inventory[index];
    renderProfile(item);
    await renderSignature(item);
});

async function renderSignature(item) {
    const signatureBlock = document.getElementById('signature-block');
    if (!storage.sk || !storage.username) {
        signatureBlock.innerHTML = "<div>DIGITAL SIGNATURE: NOT AVAILABLE (MISSING KEYS OR USERNAME)</div>";
        return;
    }

    const dataToSign = JSON.stringify(item) + "SIGNED_BY:" + storage.username;
    try {
        const signature = await signData(dataToSign, storage.sk);
        
        // Format signature for display (split into chunks)
        const formattedSig = signature.match(/.{1,64}/g).join('<br>');
        
        signatureBlock.innerHTML = `
            <div>
                <div class="signature-verified"><center>----- DIGITAL SIGNATURE VERIFIED -----</center></div>
                <div class="signature-signer">SIGNED BY: ${storage.username}</div>
                <div class="signature-data">
                    ${formattedSig}
                </div>
                <div class="signature-algo">ALGORITHM: RSASSA-PKCS1-v1_5-SHA256</div>
            </div>
        `;
    } catch (e) {
        console.error("Signing failed", e);
        signatureBlock.innerHTML = "<div>DIGITAL SIGNATURE: GENERATION FAILED</div>";
    }
}

function renderProfile(item) {
    // Basic Info
    document.getElementById('date-to-be-fillin').textContent = new Date().toLocaleDateString().toUpperCase();
    document.getElementById('item-id').textContent = item.id;
    document.getElementById('footer-id').textContent = item.id;
    document.getElementById('item-name').textContent = item.name;
    document.getElementById('item-type').textContent = item.type.toUpperCase();
    document.getElementById('item-durability').textContent = item.durability;
    document.getElementById('item-date').textContent = item.claim_date;
    document.getElementById('doc-date').textContent = "DATE: " + new Date().toLocaleDateString().toUpperCase();

    // Status
    const statusElem = document.getElementById('item-status');
    if (item.fully_discovered) {
        statusElem.textContent = "COMPLETE";
        statusElem.className = "stat-value status-complete";
    } else {
        statusElem.textContent = "IN PROGRESS";
        statusElem.className = "stat-value status-inprogress";
    }

    // Appearance
    document.getElementById('item-appearance').textContent = item.appearance;

    // Image
    const imgUrl = genimg(item.appearance);
    document.getElementById('item-img').src = imgUrl;
    document.getElementById('item-img').onerror = function() {
        this.style.display = 'none';
        this.parentElement.innerHTML = '<div class="image-error">IMAGE GENERATION FAILED OR PENDING</div>';
    };

    // Abilities
    const abilitiesList = document.getElementById('item-abilities');
    abilitiesList.innerHTML = '';

    if (item.ability && item.ability.length > 0) {
        item.ability.forEach((ab, idx) => {
            const div = document.createElement('div');
            
            if (ab.discovered) {
                div.className = 'ability-card';
                div.innerHTML = `
                    <div class="ability-header">
                        <span class="ability-index">ABILITY_0${idx + 1}</span>
                        <span class="ability-condition">${ab.condition}</span>
                    </div>
                    <div class="ability-text">${ab.ability}</div>
                `;
            } else {
                div.className = 'ability-card undiscovered';
                div.innerHTML = `
                    <div class="ability-header">
                        <span class="ability-index">ABILITY_0${idx + 1}</span>
                        <span class="ability-condition">UNKNOWN</span>
                    </div>
                    <div class="ability-text">Analysis required. Data encrypted.</div>
                `;
            }
            abilitiesList.appendChild(div);
        });
    } else {
        const div = document.createElement('div');
        div.className = 'ability-card no-abilities';
        div.innerHTML = `<div class="ability-text">No special abilities detected on this item.</div>`;
        abilitiesList.appendChild(div);
    }
}
