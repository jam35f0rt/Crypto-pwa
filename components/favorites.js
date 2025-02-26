// components/favorites.js
import { displayFavorites } from './ui-updates.js';

export function getFavorites() {
    const stored = localStorage.getItem('favoriteCryptos');
    return stored ? JSON.parse(stored) : [];
}

export function isFavorite(code) {
    return getFavorites().includes(code);
}

export function addFavorite(code) {
    const favorites = getFavorites();
    if (!favorites.includes(code)) {
        favorites.push(code);
        localStorage.setItem('favoriteCryptos', JSON.stringify(favorites));
    }
}

export function removeFavorite(code) {
    let favorites = getFavorites();
    favorites = favorites.filter(c => c !== code);
    localStorage.setItem('favoriteCryptos', JSON.stringify(favorites));
}
export function toggleFavorite(code) {

    if (isFavorite(code)) {
        removeFavorite(code);
    } else {
        addFavorite(code);
    }
}
