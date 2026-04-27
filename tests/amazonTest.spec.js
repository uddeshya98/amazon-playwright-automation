const { test, expect } = require('@playwright/test');
const { AmazonPage } = require('../pages/amazonPage');
const { cleanPrice } = require('../utils/helpers');

test.describe('Amazon Product Search and Add to Cart', () => {

    test('Test Case 1: Search iPhone, get price and add to cart', async ({ page }) => {
        const amazonPage = new AmazonPage(page);
        
        await test.step('Navigate to Amazon.in', async () => {
            await amazonPage.navigate();
        });

        await test.step('Search for "iPhone"', async () => {
            await amazonPage.searchProduct('iPhone');
        });

        let productPage;
        await test.step('Select a relevant product', async () => {
            productPage = await amazonPage.selectProduct();
        });

        let priceText;
        await test.step('Get the product price', async () => {
            priceText = await productPage.getPrice();
            const formattedPrice = cleanPrice(priceText);
            console.log(`iPhone Price: ${formattedPrice}`);
        });

        await test.step('Add to cart', async () => {
            await productPage.addToCart();
        });
    });

    test('Test Case 2: Search Samsung Galaxy, get price and add to cart', async ({ page }) => {
        const amazonPage = new AmazonPage(page);
        
        await test.step('Navigate to Amazon.in', async () => {
            await amazonPage.navigate();
        });

        await test.step('Search for "Samsung Galaxy"', async () => {
            await amazonPage.searchProduct('Samsung Galaxy');
        });

        let productPage;
        await test.step('Select a relevant product', async () => {
            productPage = await amazonPage.selectProduct();
        });

        let priceText;
        await test.step('Get the product price', async () => {
            priceText = await productPage.getPrice();
            const formattedPrice = cleanPrice(priceText);
            console.log(`Galaxy Price: ${formattedPrice}`);
        });

        await test.step('Add to cart', async () => {
            await productPage.addToCart();
        });
    });

});
