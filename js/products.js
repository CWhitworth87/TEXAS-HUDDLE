/*
 * Texas Huddle Co. — product catalog.
 *
 * This is the only file you need to edit to change what's for sale.
 * Every product needs:
 *   id          unique, lowercase, no spaces (used in the cart)
 *   name        shown on the card
 *   category    one of the CATEGORIES below
 *   price       in US dollars
 *   description one or two short, punchy sentences
 *   details     bullet points shown in the product window
 *   sizes       list of sizes, or [] for one-size items
 *   colors      list of { name, hex } choices
 *   style       drawing used when there's no photo: tee, longsleeve, hoodie, hat, beanie, tank
 * Optional:
 *   image       path to a real product photo, e.g. "assets/products/lone-star-tee.jpg"
 *   badge       short tag like "NEW" or "BEST SELLER"
 *   salePrice   a lower price to show as a sale
 */

const CATEGORIES = ["Tees", "Hoodies & Long Sleeves", "Hats", "Game Day"];

const NAVY = { name: "Navy", hex: "#031F3A" };
const CREAM = { name: "Cream", hex: "#F7F0E1" };
const RED = { name: "Red", hex: "#D40F27" };
const HEATHER = { name: "Heather Gray", hex: "#9AA0A6" };
const BLACK = { name: "Black", hex: "#1B1B1B" };
const WHITE = { name: "White", hex: "#FFFFFF" };

const ADULT_SIZES = ["S", "M", "L", "XL", "2XL", "3XL"];

const PRODUCTS = [
  {
    id: "lone-star-tee",
    name: "Lone Star Logo Tee",
    category: "Tees",
    price: 28,
    badge: "BEST SELLER",
    style: "tee",
    description: "The full Texas Huddle Co. crest, front and center. Built for game day and every day after.",
    details: [
      "100% ringspun cotton, soft hand feel",
      "Full-color crest screen printed on chest",
      "Classic unisex fit",
    ],
    sizes: ADULT_SIZES,
    colors: [NAVY, CREAM, HEATHER],
  },
  {
    id: "friday-night-tee",
    name: "Friday Night Lights Tee",
    category: "Tees",
    price: 26,
    badge: "NEW",
    style: "tee",
    description: "For the ones who never miss kickoff. Slab lettering across the chest, lone star on the sleeve.",
    details: [
      "Cotton/poly blend, holds its shape wash after wash",
      "Star sleeve print",
      "Unisex fit",
    ],
    sizes: ADULT_SIZES,
    colors: [NAVY, BLACK, HEATHER],
  },
  {
    id: "huddle-up-tee",
    name: "Huddle Up Youth Tee",
    category: "Tees",
    price: 20,
    style: "tee",
    description: "Suit up the next generation. Same bold crest, sized for the little ones in the stands.",
    details: ["100% cotton", "Tagless neck label", "Youth sizing"],
    sizes: ["YXS", "YS", "YM", "YL", "YXL"],
    colors: [NAVY, RED, WHITE],
  },
  {
    id: "tailgate-tank",
    name: "Tailgate Tank",
    category: "Tees",
    price: 24,
    style: "tank",
    description: "Texas heat doesn't take a timeout. Stay cool from the parking lot to the fourth quarter.",
    details: ["Lightweight tri-blend", "Relaxed armholes", "Crest print on chest"],
    sizes: ADULT_SIZES,
    colors: [CREAM, HEATHER, NAVY],
  },
  {
    id: "fourth-quarter-hoodie",
    name: "Fourth Quarter Hoodie",
    category: "Hoodies & Long Sleeves",
    price: 55,
    badge: "BEST SELLER",
    style: "hoodie",
    description: "When the night gets cold and the game gets close. Heavyweight fleece with the full crest.",
    details: [
      "Heavyweight cotton/poly fleece",
      "Lined hood with drawcords",
      "Kangaroo pocket",
    ],
    sizes: ADULT_SIZES,
    colors: [NAVY, HEATHER, BLACK],
  },
  {
    id: "kickoff-quarter-zip",
    name: "Kickoff Quarter Zip",
    category: "Hoodies & Long Sleeves",
    price: 60,
    style: "longsleeve",
    description: "Sideline sharp. A clean quarter zip with the lone star mark on the chest.",
    details: ["Moisture-wicking performance knit", "Embroidered star on chest", "Thumbholes"],
    sizes: ADULT_SIZES,
    colors: [NAVY, HEATHER],
  },
  {
    id: "game-day-long-sleeve",
    name: "Game Day Long Sleeve",
    category: "Hoodies & Long Sleeves",
    price: 34,
    style: "longsleeve",
    description: "Crest up front, TEXAS down the sleeve. For fall nights and early kickoffs.",
    details: ["100% cotton", "Sleeve print", "Ribbed cuffs"],
    sizes: ADULT_SIZES,
    colors: [CREAM, NAVY],
  },
  {
    id: "lone-star-snapback",
    name: "Lone Star Snapback",
    category: "Hats",
    price: 30,
    style: "hat",
    description: "The star, stitched loud and proud. Flat brim, structured crown, snap back.",
    details: ["Structured 6-panel crown", "Raised embroidered star", "Adjustable snap closure"],
    sizes: [],
    colors: [NAVY, RED, BLACK],
  },
  {
    id: "huddle-dad-hat",
    name: "Huddle Dad Hat",
    category: "Hats",
    price: 26,
    style: "hat",
    description: "Low-key, broken in, and ready for the tailgate. Curved brim with the Huddle wordmark.",
    details: ["Unstructured washed cotton", "Embroidered wordmark", "Brass buckle strap"],
    sizes: [],
    colors: [CREAM, NAVY],
  },
  {
    id: "sideline-beanie",
    name: "Sideline Beanie",
    category: "Hats",
    price: 22,
    style: "beanie",
    description: "For the rare Texas cold snap. Cuffed knit beanie with a woven star patch.",
    details: ["Acrylic rib knit", "Woven patch on cuff", "One size fits most"],
    sizes: [],
    colors: [NAVY, RED],
  },
  {
    id: "team-bundle",
    name: "Team Huddle Bundle",
    category: "Game Day",
    price: 80,
    salePrice: 72,
    badge: "SAVE $8",
    style: "hoodie",
    description: "The Fourth Quarter Hoodie plus a Lone Star Logo Tee. Everything you need for the season.",
    details: [
      "1 Fourth Quarter Hoodie + 1 Lone Star Logo Tee",
      "Both in the size and color you pick",
      "Add a note at checkout for mixed sizes",
    ],
    sizes: ADULT_SIZES,
    colors: [NAVY, HEATHER],
  },
  {
    id: "custom-team-order",
    name: "Custom Team Order",
    category: "Game Day",
    price: 0,
    style: "tee",
    quote: true,
    description: "Outfitting a team, booster club or watch party? We'll put your crew in matching gear.",
    details: [
      "Minimum 12 pieces",
      "Your names and numbers on the back",
      "Add this to your order and we'll reach out with a quote",
    ],
    sizes: [],
    colors: [NAVY, CREAM, RED, HEATHER],
  },
];
