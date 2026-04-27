const { expect } = require('@playwright/test');

class AmazonPage {
    constructor(page) {
        this.page = page;
        this.searchBox = page.locator('#twotabsearchtextbox');
        this.searchButton = page.locator('#nav-search-submit-button');
        // A generic selector for the first actual product in the list (ignoring sponsored if possible, but taking the first result is usually fine)
        this.productResults = page.locator('[data-component-type="s-search-result"]');
        this.addToCartButton = page.locator('#add-to-cart-button');
        this.priceElement = page.locator('.a-price-whole').first();
    }

    async navigate() {
        await this.page.goto('/', { waitUntil: 'domcontentloaded' });
        // Handle CAPTCHA or location popup if it exists
        // Amazon sometimes shows a location pin popup
        try {
            const locPopup = this.page.locator('#nav-global-location-popover-link');
            if (await locPopup.isVisible({ timeout: 2000 })) {
                // Ignore or handle it
            }
        } catch (e) {
            // Ignore
        }
    }

    async searchProduct(productName) {
        await this.searchBox.fill(productName);
        await this.searchButton.click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async selectProduct() {
        // Find the first product that has a link and click it
        const firstProduct = this.productResults.first();
        const productLink = firstProduct.locator('h2 a').first();
        
        // Amazon opens products in a new tab, so we need to handle the new tab
        const [newPage] = await Promise.all([
            this.page.context().waitForEvent('page'),
            productLink.click()
        ]);
        
        await newPage.waitForLoadState('domcontentloaded');
        return new AmazonPage(newPage);
    }

    async getPrice() {
        // Extract the price text
        await this.priceElement.waitFor({ state: 'visible', timeout: 10000 });
        const price = await this.priceElement.innerText();
        return price.replace(/\n/g, '').trim(); // Remove newlines or spaces
    }

    async addToCart() {
        await this.addToCartButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.addToCartButton.click();
        
        // Wait for confirmation that it was added to cart. 
        // Could be the "Added to Cart" side panel or a redirect.
        try {
            await this.page.waitForSelector('#NATC_SMART_WAGON_CONF_MSG_SUCCESS, #sw-atc-details-single-container, h1:has-text("Added to Cart")', { timeout: 10000 });
        } catch (e) {
            // Might be a different layout, continue
            console.log("Could not confirm cart addition visually, proceeding.");
        }
    }
}

module.exports = { AmazonPage };
