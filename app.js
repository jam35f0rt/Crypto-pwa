// app.js
import { initializeDarkMode, setupDarkModeToggle } from './components/dark-mode.js';
import { fetchAllCryptos, fetchAllCurrencies, setSelectedCurrency } from './utils/api.js';
import { displayPrices, displayFavorites, showMessage, setupRemoveCryptoHandlers } from './components/ui-updates.js';
import { setupCryptoSearch, setupCurrencySearch, initializeCurrencyInput } from './components/search.js';
import { getFavorites, toggleFavorite, isFavorite } from './components/favorites.js';

async function initializeApp() {
    initializeDarkMode();
    setupDarkModeToggle();

    try {
        await fetchAllCryptos(); // FETCH ALL CRYPTOCURRENCIES
        await setSelectedCurrency("USD")

        setupCryptoSearch();
        setupCurrencySearch();
        initializeCurrencyInput();

        displayPrices();
        displayFavorites();

        setInterval(displayPrices, 30000);
        setupRemoveCryptoHandlers();

    } catch (error) {
        showMessage("Failed to initialize app. Check your internet connection.");
        console.error("Initialization error:", error);
    }
}

initializeApp();
