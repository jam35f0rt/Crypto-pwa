// components/local-storage.js
const trackedCryptosKey = 'trackedCryptos';

export function getTrackedCryptos() {
    try {
        const tracked = JSON.parse(localStorage.getItem(trackedCryptosKey)) || [];
        return tracked;
    } catch (error) {
        console.error("Error parsing trackedCryptos from localStorage:", error);
        return [];  // Return empty array on error.
    }
}

export function addCryptoToTracking(cryptoCode) {
    const trackedCryptos = getTrackedCryptos();
    if (!trackedCryptos.includes(cryptoCode)) {
        trackedCryptos.push(cryptoCode);
        localStorage.setItem(trackedCryptosKey, JSON.stringify(trackedCryptos));
    }
}

export function removeCryptoFromTracking(cryptoCode) {
    let trackedCryptos = getTrackedCryptos();
    trackedCryptos = trackedCryptos.filter(code => code !== cryptoCode);
    localStorage.setItem(trackedCryptosKey, JSON.stringify(trackedCryptos));
}
