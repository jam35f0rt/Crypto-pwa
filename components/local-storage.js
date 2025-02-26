// components/local-storage.js

export function getTrackedCryptos() {
    const stored = localStorage.getItem('trackedCryptos');
    return stored ? JSON.parse(stored) : ['BTC', 'ETH', 'LTC'];  // Default cryptos
}

export function addCryptoToTracking(code) {
    const trackedCryptos = getTrackedCryptos();
    if (!trackedCryptos.includes(code)) {
        trackedCryptos.push(code);
        localStorage.setItem('trackedCryptos', JSON.stringify(trackedCryptos));
    }
}

export function removeCryptoFromTracking(code) {
    let trackedCryptos = getTrackedCryptos();
    trackedCryptos = trackedCryptos.filter(c => c !== code);
    localStorage.setItem('trackedCryptos', JSON.stringify(trackedCryptos));
}
