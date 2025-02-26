// app.js
import { initializeDarkMode, setupDarkModeToggle } from './components/dark-mode.js';
import { fetchAllCryptos, fetchAllCurrencies, fetchCryptoPrice } from './utils/api.js';
import { displayPrices, displayFavorites, showMessage, setupRemoveCryptoHandlers } from './components/ui-updates.js';
import { setupCryptoSearch, setupCurrencySearch } from './components/search.js';
import { getFavorites, toggleFavorite, isFavorite } from './components/favorites.js'; // Import favorites functions

async function initializeApp() {
    initializeDarkMode();
    setupDarkModeToggle();

    await fetchAllCryptos();
    await fetchAllCurrencies();

    setupCryptoSearch();
    setupCurrencySearch(); // Set up currency search

    displayPrices();
    displayFavorites();

    setInterval(displayPrices, 30000);
    setupRemoveCryptoHandlers(); // Important to call after initial display
}

initializeApp();
