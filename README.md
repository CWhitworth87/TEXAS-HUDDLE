# Texas Huddle Co. — Online Store

The Texas Huddle Co. website: a product catalog with descriptions, a shopping cart, and an order form. It's plain HTML, CSS and JavaScript with no build step, so it runs on any static host (GitHub Pages, Netlify, Cloudflare Pages).

Colors, fonts, voice and logo follow the Texas Huddle Co. Brand Kit (navy `#031F3A`, cream `#F7F0E1`, red `#D40F27`; Alfa Slab One, Oswald, Inter).

## What customers can do

- Browse products by category (Tees, Hoodies & Long Sleeves, Hats, Game Day)
- Open a product to read its description and details, then pick a size, color and quantity
- Keep a cart that's saved in their browser between visits
- Check out with name, email, phone, and shipping or local pickup, plus order notes
- Get an order number (like `TH-260928-7M1N`) when they send the order

No payment is taken on the site. You get the order, then contact the customer to confirm and collect payment (Venmo, Square invoice, cash at pickup, and so on).

## How orders reach you

Open `js/config.js`:

- **Default (no setup):** when a customer sends an order, their email app opens with a message to `texashuddle@gmail.com` that has the full order filled in. They hit send.
- **Automatic (recommended once you're live):** sign up at [formspree.io](https://formspree.io) (free plan), create a form that delivers to `texashuddle@gmail.com`, and paste its endpoint into `formEndpoint`. Orders then land in your inbox automatically, with nothing extra for the customer to do.

## Editing products

Everything for sale is in **`js/products.js`**. Each product has a name, price, description, detail bullets, sizes and colors. Copy an existing product to add a new one, or delete one to remove it.

The products there now are **placeholders** to show the layout. Replace them with your real lineup and prices.

### Adding real product photos

Until you add photos, each product shows a drawing of the garment in the selected color. To use a photo:

1. Put the image in `assets/products/` (square images look best, for example 1200×1200).
2. Add `image: "assets/products/your-photo.jpg"` to that product in `js/products.js`.

## Shipping settings

Also in `js/config.js`: `freeShippingThreshold` (default $75) and `shippingFlatRate` (default $7). Local pickup is always free.

## Previewing locally

Open `index.html` in a browser, or run a small server from this folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Putting it online with GitHub Pages

1. In this repository on GitHub, go to **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**, pick your branch and the `/ (root)` folder, and save.
3. Your site will be live at `https://<your-username>.github.io/TEXAS-HUDDLE/` within a minute or two.
4. To use `texashuddleapparel.com`, enter it under **Custom domain** on the same page and follow GitHub's DNS instructions for your domain registrar.

## Files

```
index.html          the page
css/styles.css      all styling (brand colors and fonts at the top)
js/config.js        contact info, shipping, and order delivery settings
js/products.js      the product catalog
js/app.js           catalog, cart and checkout logic
assets/             web logo, favicons; originals/ holds the full-size logo files
```
