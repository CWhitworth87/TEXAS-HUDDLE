/*
 * Store settings. Edit these to match how you run the business.
 */
const STORE = {
  name: "Texas Huddle Co.",
  email: "texashuddle@gmail.com",
  phone: "(469) 258-2697",
  phoneLink: "tel:+14692582697",
  website: "texashuddleapparel.com",

  // Shipping: orders at or above the threshold ship free.
  freeShippingThreshold: 75,
  shippingFlatRate: 7,

  // How orders reach you.
  // Leave formEndpoint empty and the order opens in the customer's email app,
  // addressed to STORE.email with the full order filled in.
  // To receive orders automatically instead, create a free form at
  // https://formspree.io and paste its endpoint here, e.g.
  // "https://formspree.io/f/abcdwxyz".
  formEndpoint: "",
};
