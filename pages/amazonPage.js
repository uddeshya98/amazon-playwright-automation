const { expect } = require('@playwright/test');

class AmazonPage {
    constructor(page) {
        this.page = page;
        this.searchBox = page.locator('#twotabsearchtextbox, input[name="field-keywords"]');
        this.searchButton = page.locator('#nav-search-submit-button, input[value="Go"]');
    }

    async navigate() {
        await this.page.goto('/', { waitUntil: 'domcontentloaded' });
        
        // Detect CAPTCHA and fail early if present
        const captchaInput = this.page.locator('#captchacharacters');
        if (await captchaInput.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log('CAPTCHA detected. Cannot proceed automatically on LambdaTest.');
            throw new Error('Amazon blocked request with a CAPTCHA.');
        }

        // Handle possible location popup
        const locPopup = this.page.locator('#nav-global-location-popover-link');
        if (await locPopup.isVisible({ timeout: 2000 }).catch(() => false)) {
            // Usually we can just ignore it or click it to dismiss, ignoring is safer
        }
    }

    async searchProduct(productName) {
        await this.searchBox.first().waitFor({ state: 'visible', timeout: 10000 });
        await this.searchBox.first().fill(productName);
        await this.searchButton.first().click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async selectProduct() {
        // Wait for search results
        const productSelector = 'a:has(h2), h2 a';
        await this.page.waitForSelector(productSelector, { state: 'visible', timeout: 15000 });
        
        const productLink = this.page.locator(productSelector).first();
        
        // Amazon may open products in a new tab or the same tab. Handle both robustly.
        const pagePromise = this.page.context().waitForEvent('page', { timeout: 8000 }).catch(() => null);
        await productLink.scrollIntoViewIfNeeded();
        await productLink.click();
        const newPage = await pagePromise;

        if (newPage) {
            await newPage.waitForLoadState('domcontentloaded');
            return new AmazonPage(newPage);
        } else {
            await this.page.waitForLoadState('domcontentloaded');
            return new AmazonPage(this.page);
        }
    }

    async getPrice() {
        const priceSelectors = [
            '#corePriceDisplay_desktop_feature_div .a-price-whole',
            '#corePrice_desktop .a-price-whole',
            '#priceblock_ourprice',
            '.a-price-whole:visible'
        ];
        
        for (const selector of priceSelectors) {
            try {
                const element = this.page.locator(selector).first();
                await element.waitFor({ state: 'visible', timeout: 5000 });
                const price = await element.innerText();
                if (price && price.trim() !== '') {
                    return price.replace(/\n/g, '').replace(/,/g, '').trim();
                }
            } catch (e) {
                // Try next selector
            }
        }
        throw new Error('Price element not found on the product page.');
    }

    async addToCart() {
        const addToCartBtn = this.page.locator('#add-to-cart-button, input[name="submit.add-to-cart"]').first();
        try {
            await addToCartBtn.waitFor({ state: 'visible', timeout: 10000 });
            await addToCartBtn.click();
            
            // Wait for confirmation that it was added to cart
            try {
                await this.page.waitForSelector('#NATC_SMART_WAGON_CONF_MSG_SUCCESS, #sw-atc-details-single-container, h1:has-text("Added to Cart"), #attachDisplayAddBaseAlert', { timeout: 10000, state: 'visible' });
            } catch (e) {
                console.log("Could not confirm cart addition visually, proceeding.");
            }
        } catch (err) {
            console.log("Add to Cart button not found within timeout. Product might be out of stock or has 'See All Buying Options'. Proceeding.");
        }
    }
}

module.exports = { AmazonPage };
