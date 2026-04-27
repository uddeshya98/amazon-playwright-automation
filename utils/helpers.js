// helper functions

function cleanPrice(priceString) {
    if (!priceString) return "N/A";
    return `₹${priceString.replace(/[^\d.]/g, '')}`;
}

module.exports = { cleanPrice };
