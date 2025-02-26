// app.js
import { initializeDarkMode, setupDarkModeToggle } from './components/dark-mode.js';
import { fetchAllCryptos, fetchAllCurrencies, setSelectedCurrency } from './utils/api.js';
import { displayPrices, displayFavorites, showMessage, setupRemoveCryptoHandlers } from './components/ui-updates.js';
import { addCryptoToTracking, getTrackedCryptos } from './components/local-storage.js';
import { addFavorite, isFavorite } from './components/favorites.js';

const cryptoSelect = document.getElementById('crypto-select'); // Get the <select> element

async function initializeApp() {
    initializeDarkMode();
    setupDarkModeToggle();

    try {
        await fetchAllCryptos();
        await setSelectedCurrency("USD")

        // Populate the select element *after* fetching cryptos
        populateCryptoSelect();

        setupSelectHandler(); // Set up the event listener for the select
        displayPrices();
        displayFavorites();

        setInterval(displayPrices, 30000);
        setupRemoveCryptoHandlers();

    } catch (error) {
        showMessage("Failed to initialize app. Check your internet connection.");
        console.error("Initialization error:", error);
    }
}
function populateCryptoSelect() {
    const cryptoSelect = document.getElementById('crypto-select');
    allCryptos.forEach(crypto => {
        const option = document.createElement('option');
        option.value = `${crypto.symbol}-${selectedCurrency}`; // e.g., "BTC-USD"
        option.textContent = `${crypto.name} (${crypto.symbol}-${selectedCurrency})`;
        cryptoSelect.appendChild(option);
    });
}
function setupSelectHandler() {
    cryptoSelect.addEventListener('change', async () => {
        const selectedPair = cryptoSelect.value; // Get the selected pair
        if (selectedPair) { // Check if a pair is actually selected
            if (getTrackedCryptos().includes(selectedPair)) {
                showMessage('This cryptocurrency pair is already being tracked.');
                return
            }
            const price = await fetchCryptoPrice(selectedPair)
            if(price !== null){
                addCryptoToTracking(selectedPair);
                 if(!isFavorite(selectedPair)) {
                    addFavorite(selectedPair)
                 }
                displayPrices();
                displayFavorites();
            } else {
                showMessage(`Could not find or add cryptocurrency: ${selectedPair}`); // Show error message
            }

        }
    });
}

initializeApp();
