// app.js
import { initializeDarkMode, setupDarkModeToggle } from './components/dark-mode.js';
import { fetchCryptoPrice } from './utils/api.js';
import { displayPrices, displayFavorites, showMessage, setupRemoveCryptoHandlers } from './components/ui-updates.js';
import { addCryptoToTracking, getTrackedCryptos } from './components/local-storage.js';
import { addFavorite, isFavorite } from './components/favorites.js';

async function initializeApp() {
    initializeDarkMode();
    setupDarkModeToggle();

    displayPrices(); // Initial display (will be empty at first)
    displayFavorites();

    setupAddButton(); // Set up the add button listener
    setupRemoveCryptoHandlers();
    setInterval(displayPrices, 30000);
}

function setupAddButton() {
    const addButton = document.getElementById('add-button');
    const addInput = document.getElementById('add-input');

    addButton.addEventListener('click', async () => {
        const cryptoBasePair = addInput.value.trim().toUpperCase(); // e.g., BTC-USD

        if (!cryptoBasePair) {
            showMessage('Please enter a cryptocurrency pair (e.g., BTC-USD).');
            return;
        }

        // Check if the pair is already tracked
        if (getTrackedCryptos().includes(cryptoBasePair)) {
            showMessage('This cryptocurrency pair is already being tracked.');
            addInput.value = ''; // Clear the input
            return;
        }


        // Validate by fetching the price.  If it works, it's a valid pair.
        const price = await fetchCryptoPrice(cryptoBasePair);
        if (price !== null) {
            addCryptoToTracking(cryptoBasePair);
             if (!isFavorite(cryptoBasePair)) {
                addFavorite(cryptoBasePair);
            }
            displayPrices(); // Update the display
            displayFavorites();
            addInput.value = ''; // Clear the input
        } else {
            showMessage('Invalid cryptocurrency pair. Please enter a valid pair (e.g., BTC-USD).');
            addInput.value = ''; // Clear the input

        }
    });
}
initializeApp();
