// app.js
import { initializeDarkMode, setupDarkModeToggle } from './components/dark-mode.js';
import {  fetchAllCurrencies } from './utils/api.js'; //No need to import fetch all crypto
import { displayPrices, displayFavorites, showMessage, setupRemoveCryptoHandlers } from './components/ui-updates.js';
import { setupCryptoSearch, setupCurrencySearch, initializeCurrencyInput } from './components/search.js'; // Import initializeCurrencyInput
import { getFavorites, toggleFavorite, isFavorite } from './components/favorites.js';

async function initializeApp() {
    initializeDarkMode();
    setupDarkModeToggle();

    try {
        // Await both fetches!  This is the KEY FIX.
        // await fetchAllCryptos(); // No need to fetch all crypto.
        await fetchAllCurrencies();

        setupCryptoSearch();
        setupCurrencySearch();
        initializeCurrencyInput(); // Initialize the currency input value.

        displayPrices();
        displayFavorites();

        setInterval(displayPrices, 30000);
        setupRemoveCryptoHandlers();

    } catch (error) {
        // Handle errors during initialization (e.g., API failures)
        showMessage("Failed to initialize app. Check your internet connection.");
        console.error("Initialization error:", error); // Log the error for debugging.
    }
}

initializeApp();
