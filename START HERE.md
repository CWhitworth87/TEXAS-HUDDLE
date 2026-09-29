# Texas Huddle Co. Website: Start Here

## 1. Open it in VS Code

1. Unzip this folder somewhere easy to find, like your Documents folder.
2. Open VS Code, then choose **File → Open Folder...** and pick the `texas-huddle-website` folder.
3. If VS Code asks whether you trust the authors, click **Yes, I trust the authors**.

## 2. See the site in your browser

1. VS Code will pop up a message recommending the **Live Server** extension. Click **Install**.
   (If you miss it: click the Extensions icon on the left, search for "Live Server" by Ritwick Dey, and install it.)
2. Click **Go Live** in the blue bar at the bottom right of VS Code.
3. Your browser opens the site at http://127.0.0.1:5500. Leave it open. Every time you save a file, the page refreshes by itself.

You can also just double-click `index.html` to open it, but Live Server works more like the real website.

## 3. Files you'll actually edit

| What you want to change | File |
|---|---|
| Products, prices, descriptions, sizes, colors | `js/products.js` |
| Email, phone, shipping prices, order form setup | `js/config.js` |
| Homepage words (hero, "How to order", footer) | `index.html` |
| Design Your Own page words | `design.html` |
| Colors and fonts | top of `css/styles.css` |
| Product photos | put images in `assets/products/`, then add `image: "assets/products/your-photo.jpg"` to that product in `js/products.js` |

The rest of the files (`js/app.js`, `js/designer.js`, `js/garments.js`, `css/design.css`) run the cart and the shirt designer. You shouldn't need to touch them.

**Heads up:** the 12 products in `js/products.js` are examples. Replace them with your real items and prices before you go live.

## 4. Put it online

The simplest free option is GitHub Pages. See **"Putting it online with GitHub Pages"** in `README.md`.
If you'd rather drag and drop: go to https://app.netlify.com/drop and drag this whole folder onto the page. You get a live link in seconds, and you can connect texashuddleapparel.com in Netlify's settings.
