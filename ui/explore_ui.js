import { storage } from '../utils/localstorage.js';
import { genimg } from '../utils/ai_img.js';
import { exploreItem } from '../game/explore_item.js';

const urlParams = new URLSearchParams(window.location.search);
const itemIndex = urlParams.get('index');
const item = storage.inventory[itemIndex];

if (!item) {
    alert("物品不存在！");
    window.close();
}

// Initialize UI
const itemImage = document.getElementById('item-image');
const itemName = document.getElementById('item-name');
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

if (itemImage) itemImage.src = genimg(item.appearance);
if (itemName) itemName.textContent = item.fully_discovered ? item.name : "???";

// Image Fullscreen Logic
const overlay = document.createElement('div');
overlay.className = 'fullscreen-overlay';
const overlayImg = document.createElement('img');
overlay.appendChild(overlayImg);
document.body.appendChild(overlay);

if (itemImage) {
    itemImage.style.cursor = 'zoom-in';
    itemImage.addEventListener('click', () => {
        overlayImg.src = itemImage.src;
        overlay.classList.add('active');
    });
}

overlay.addEventListener('click', () => {
    overlay.classList.remove('active');
});

let history = [];

// Chat Logic
async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    userInput.value = '';
    
    // Show loading
    const loadingId = addMessage("分析中", 'system loading');

    try {
        const resjson = await exploreItem(itemIndex, text, history);
        
        // Remove loading
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();
        
        addMessage(resjson.result, 'system');

        if (resjson.discovered_ability !== -1 && resjson.discovered_ability !== null) {
            addMessage(`【系统提示】你发现了新的能力：${item.ability[resjson.discovered_ability].ability}`, 'system');
            if (item.fully_discovered) {
                itemName.textContent = item.name;
                addMessage(`【系统提示】你已经完全了解了这个物品！`, 'system');
            }
        }
        
    } catch (e) {
        console.error(e);
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.textContent = "连接中断...";
    }
}

function addMessage(text, type) {
    const id = `msg-${Date.now()}-${Math.random()}`;
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.id = id;
    div.innerHTML = `<div class="message-content">${text}</div>`;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return id;
}

if (sendBtn) sendBtn.addEventListener('click', handleSend);
if (userInput) userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});
