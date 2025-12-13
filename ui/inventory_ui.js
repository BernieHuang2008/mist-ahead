import { storage } from '../utils/localstorage.js';
import { genimg } from '../utils/ai_img.js';

const CELL_SIZE = 80; // px
const GRID_GAP = 10; // px
const INVENTORY_CAPACITY = 50; // Total slots

class InventoryUI {
    constructor() {
        this.container = document.getElementById('inventory-container');
        this.menu = document.getElementById('floating-menu');
        this.init();
    }

    init() {
        this.renderGrid();
        this.setupGlobalEvents();
    }

    renderGrid() {
        this.container.innerHTML = '';
        this.container.style.setProperty('--cell-size', `${CELL_SIZE}px`);

        // Ensure we have enough slots
        const totalSlots = Math.max(storage.inventory.length, INVENTORY_CAPACITY);

        for (let i = 0; i < totalSlots; i++) {
            const cell = document.createElement('div');
            cell.className = 'inventory-cell';
            cell.dataset.index = i;

            if (i < storage.inventory.length) {
                const item = storage.inventory[i];
                cell.innerHTML = `<img class="inventory-item-image" src="${genimg(item.appearance)}" alt="${item.fully_discovered ? item.name : '???'}" />`;
                // cell.title = JSON.stringify(item, null, 2);
            } else {
                cell.classList.add('empty');
            }

            cell.addEventListener('click', (e) => this.handleCellClick(e, i));
            this.container.appendChild(cell);
        }
    }

    handleCellClick(e, index) {
        e.stopPropagation(); // Prevent closing immediately

        const cell = e.currentTarget;
        const rect = cell.getBoundingClientRect();

        // Content for the menu
        this.menu.innerHTML = this.renderMenuContent(index);
        this.menu.style.display = 'block';

        // Calculate position
        const menuRect = this.menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let top = rect.top;
        let left = rect.right + 10; // Default: to the right

        // Check right space
        if (left + menuRect.width > viewportWidth) {
            // Try left
            left = rect.left - menuRect.width - 10;
        }

        // Check bottom space (adjust top if needed)
        if (top + menuRect.height > viewportHeight) {
            top = viewportHeight - menuRect.height - 10;
        }

        this.menu.style.top = `${top}px`;
        this.menu.style.left = `${left}px`;

        this.menu.querySelector("#explore-btn").onclick = () => {
            open(`explore.html?index=${index}`, '_blank');
            this.menu.style.display = 'none';
        }
        this.menu.querySelector("#profile-btn").onclick = () => {
            alert("查看档案功能尚未实现。");
            this.menu.style.display = 'none';
        }
    }

    renderMenuContent(index) {
        if (index >= storage.inventory.length) {
            return 'Empty Slot';
        }
        const item = storage.inventory[index];
        return `
            <strong>${item.fully_discovered ? item.name : '???'}</strong><br/>
            <hr>
            <strong>【外观】</strong> ${item.appearance}<br><br>
            <strong>【获得日期】</strong> ${item.claim_date}<br><br>
            ${item.fully_discovered ? "" : "<button id='explore-btn' class='full-width-btn'>格物致知</button>"}
            ${item.fully_discovered ? "<button id='profile-btn' class='full-width-btn'>查看档案</button>" : ""}
        `;
    }

    setupGlobalEvents() {
        document.addEventListener('click', (e) => {
            if (this.menu.style.display === 'block') {
                // If click is outside the menu
                if (!this.menu.contains(e.target)) {
                    this.menu.style.display = 'none';
                }
            }
        });

        // Tab switching logic
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                tab.classList.add('active');

                // Hide all tab contents
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                // Show target content
                const targetId = tab.dataset.target;
                document.getElementById(targetId).classList.add('active');
            });
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new InventoryUI();
});
