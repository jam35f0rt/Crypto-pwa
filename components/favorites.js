// components/favorites.js
import { getTrackedCryptos } from "./local-storage.js";

const favoritesKey = 'favoriteCryptos';

export function getFavorites() {
    try {
        const favorites = JSON.parse(localStorage.getItem(favoritesKey)) || [];
        return favorites;
    } catch (error) {
        console.error("Error parsing favorites from localStorage:", error);
        return []; // Return an empty array on error
    }
}

export function addFavorite(cryptoCode) {
  if(!isFavorite(cryptoCode)) {
    const favorites = getFavorites();
    favorites.push(cryptoCode);
    localStorage.setItem(favoritesKey, JSON.stringify(favorites));
  }
}

export function removeFavorite(cryptoCode) {
    let favorites = getFavorites();
    favorites = favorites.filter(fav => fav !== cryptoCode);
    localStorage.setItem(favoritesKey, JSON.stringify(favorites));
}

export function isFavorite(cryptoCode) {
    const favorites = getFavorites();
    return favorites.includes(cryptoCode);
}


export function toggleFavorite(cryptoCode) {
    if (isFavorite(cryptoCode)) {
        removeFavorite(cryptoCode);
    } else {
        addFavorite(cryptoCode);
    }
}
