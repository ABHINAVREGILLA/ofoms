// ============================================================
// OFOMS — Demo Seed File
// ALL DATA IS FICTIONAL — For demonstration/college project only.
// No real restaurants, persons, addresses or payments are used.
// ============================================================

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 [DEMO] Starting OFOMS fictional data seeding...");

  // ── Clean slate ──────────────────────────────────────────
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.deliveryAssignment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.address.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();
  await prisma.restaurant.deleteMany();

  const pw = await bcrypt.hash("demo123", 10);

  // ── 1. DEMO USERS (100% fictional) ───────────────────────
  console.log("👤 [DEMO] Creating fictional demo users...");

  const customer = await prisma.user.create({
    data: {
      email: "customer@ofoms.demo",
      password: pw,
      name: "Alex Demo",
      phone: "+91 90000 10001",
      role: "CUSTOMER",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AlexDemo",
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: "restaurant@ofoms.demo",
      password: pw,
      name: "Sam Kitchen (Demo Manager)",
      phone: "+91 90000 10002",
      role: "RESTAURANT_MANAGER",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SamKitchen",
    },
  });

  await prisma.user.create({
    data: {
      email: "staff@ofoms.demo",
      password: pw,
      name: "Jamie Prep (Demo Staff)",
      phone: "+91 90000 10003",
      role: "RESTAURANT_STAFF",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=JamiePrep",
    },
  });

  const deliveryUser = await prisma.user.create({
    data: {
      email: "delivery@ofoms.demo",
      password: pw,
      name: "Zara Rider (Demo Partner)",
      phone: "+91 90000 10004",
      role: "DELIVERY_PERSONNEL",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ZaraRider",
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@ofoms.demo",
      password: pw,
      name: "Admin OFOMS (Demo)",
      phone: "+91 90000 10005",
      role: "SYSTEM_ADMIN",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AdminOFOMS",
    },
  });

  // Fictional extra customers for order history variety
  const extraCustomerNames = [
    { name: "Jordan Blake",    email: "jordan.b@ofoms.demo",  phone: "+91 90000 20001" },
    { name: "Taylor Waves",    email: "taylor.w@ofoms.demo",  phone: "+91 90000 20002" },
    { name: "Morgan Spice",    email: "morgan.s@ofoms.demo",  phone: "+91 90000 20003" },
    { name: "Casey Curry",     email: "casey.c@ofoms.demo",   phone: "+91 90000 20004" },
    { name: "Riley Tandoor",   email: "riley.t@ofoms.demo",   phone: "+91 90000 20005" },
    { name: "Quinn Biryani",   email: "quinn.b@ofoms.demo",   phone: "+91 90000 20006" },
    { name: "Avery Dosa",      email: "avery.d@ofoms.demo",   phone: "+91 90000 20007" },
    { name: "Skyler Naan",     email: "skyler.n@ofoms.demo",  phone: "+91 90000 20008" },
    { name: "Drew Masala",     email: "drew.m@ofoms.demo",    phone: "+91 90000 20009" },
  ];

  const extraCustomerIds: string[] = [];
  for (const c of extraCustomerNames) {
    const u = await prisma.user.create({
      data: {
        email: c.email,
        password: pw,
        name: c.name,
        phone: c.phone,
        role: "CUSTOMER",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(c.name)}`,
      },
    });
    extraCustomerIds.push(u.id);
  }

  // ── 2. FICTIONAL ADDRESSES ────────────────────────────────
  console.log("📍 [DEMO] Creating fictional addresses...");
  const homeAddr = await prisma.address.create({
    data: {
      userId: customer.id,
      label: "Home",
      recipient: "Alex Demo",
      phone: "+91 90000 10001",
      street: "Block C, Apt 7, Greenview Residency",
      area: "Demo Nagar, Near Central Park",
      city: "Demoville",
      state: "Prototype State",
      postalCode: "000001",
      lat: 17.4504,
      lng: 78.3808,
      isDefault: true,
    },
  });

  await prisma.address.create({
    data: {
      userId: customer.id,
      label: "Work",
      recipient: "Alex Demo (Office)",
      phone: "+91 90000 10001",
      street: "Floor 3, Innovation Tower, Tech Zone",
      area: "Prototype IT Park",
      city: "Demoville",
      state: "Prototype State",
      postalCode: "000002",
      lat: 17.4416,
      lng: 78.3807,
      isDefault: false,
    },
  });

  // ── 3. FICTIONAL RESTAURANTS ──────────────────────────────
  console.log("🍽️ [DEMO] Creating 8 fictional restaurants...");

  const restaurantsData = [
    // ── 1. SpiceRoute Kitchen ──────────────────────────────
    {
      name: "SpiceRoute Kitchen",
      slug: "spiceroute-kitchen",
      description: "[DEMO] A fictional journey through bold aromatic spices. Every dish is a story — crafted purely for this demonstration.",
      cuisineType: "North Indian, Curry, Tandoor",
      address: "12 Flavour Lane, Demo District, Demoville",
      phone: "+91 90001 00001",
      rating: 4.7,
      totalReviews: 312,
      deliveryTimeMin: 25,
      deliveryTimeMax: 40,
      deliveryFee: 30,
      minOrderValue: 150,
      priceRange: "₹₹",
      isVegOnly: false,
      isOpen: true,
      coverImage: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&auto=format&fit=crop&q=80",
      logoImage: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=200&auto=format&fit=crop&q=80",
      lat: 17.4399,
      lng: 78.3820,
      categories: [
        {
          name: "Chef Specials",
          items: [
            {
              name: "Butter Masala Fantasy",
              description: "[Demo Item] Slow-cooked fictional tomato-cashew gravy with soft cottage cheese cubes. Completely made-up recipe for this prototype.",
              price: 299,
              originalPrice: 349,
              isVeg: true,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80",
              customizations: [
                { name: "Spice Level", options: [{ name: "Mild", extraPrice: 0 }, { name: "Medium", extraPrice: 0 }, { name: "Fiery Hot", extraPrice: 0 }] },
                { name: "Add-ons", options: [{ name: "Extra Gravy", extraPrice: 40 }, { name: "Naan (2 pcs)", extraPrice: 60 }] },
              ],
            },
            {
              name: "Tandoor Mystery Chicken",
              description: "[Demo Item] Fictional marinated chicken roasted in a clay oven. Uses a made-up 7-spice blend created for demo purposes only.",
              price: 349,
              originalPrice: 399,
              isVeg: false,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&auto=format&fit=crop&q=80",
              customizations: [
                { name: "Portion", options: [{ name: "Half (4 pcs)", extraPrice: 0 }, { name: "Full (8 pcs)", extraPrice: 299 }] },
                { name: "Spice Level", options: [{ name: "Classic", extraPrice: 0 }, { name: "Extra Spicy", extraPrice: 0 }] },
              ],
            },
            {
              name: "Spinach Lentil Dream",
              description: "[Demo Item] A purely fictional dal-palak combo made for this prototype. Flavours are entirely invented for demo purposes.",
              price: 199,
              isVeg: true,
              isPopular: false,
              image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
            },
          ],
        },
        {
          name: "Breads & Sides",
          items: [
            {
              name: "Garlic Butter Naan",
              description: "[Demo Item] Fictional fluffy bread brushed with garlic-herb butter. Invented for this college project prototype.",
              price: 60,
              isVeg: true,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80",
            },
            {
              name: "Jeera Rice",
              description: "[Demo Item] Basmati rice with cumin — a fictional side dish used only in this demo system.",
              price: 120,
              isVeg: true,
              isPopular: false,
              image: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=600&auto=format&fit=crop&q=80",
            },
          ],
        },
        {
          name: "Drinks",
          items: [
            {
              name: "Mango Lassi",
              description: "[Demo Item] Fictional sweet mango yoghurt drink. No real dairy or fruit used — purely simulated for this prototype.",
              price: 80,
              isVeg: true,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=600&auto=format&fit=crop&q=80",
            },
          ],
        },
      ],
    },

    // ── 2. Urban Biryani Co. ───────────────────────────────
    {
      name: "Urban Biryani Co.",
      slug: "urban-biryani-co",
      description: "[DEMO] Fictional biryani brand created for the OFOMS college prototype. No real restaurant or recipe is referenced.",
      cuisineType: "Biryani, Mughlai, Rice Bowls",
      address: "88 Prototype Plaza, Demo Sector 4, Demoville",
      phone: "+91 90001 00002",
      rating: 4.9,
      totalReviews: 528,
      deliveryTimeMin: 30,
      deliveryTimeMax: 45,
      deliveryFee: 35,
      minOrderValue: 200,
      priceRange: "₹₹",
      isVegOnly: false,
      isOpen: true,
      coverImage: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&auto=format&fit=crop&q=80",
      logoImage: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&auto=format&fit=crop&q=80",
      lat: 17.4085,
      lng: 78.4983,
      categories: [
        {
          name: "Signature Biryanis",
          items: [
            {
              name: "Urban Dum Chicken Biryani",
              description: "[Demo Item] Fictional slow-cooked biryani with invented spice layers. Created entirely for college project demonstration.",
              price: 320,
              originalPrice: 370,
              isVeg: false,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80",
              customizations: [
                { name: "Portion Size", options: [{ name: "Regular (1 serving)", extraPrice: 0 }, { name: "Large (2 servings)", extraPrice: 250 }] },
                { name: "Spice Level", options: [{ name: "Mild", extraPrice: 0 }, { name: "Medium", extraPrice: 0 }, { name: "Spicy", extraPrice: 0 }] },
                { name: "Add-ons", options: [{ name: "Raita Cup", extraPrice: 30 }, { name: "Boiled Egg (2 pcs)", extraPrice: 40 }] },
              ],
            },
            {
              name: "Veggie Biryani Bowl",
              description: "[Demo Item] Fictional mixed-vegetable biryani with invented masala blend. 100% simulated for OFOMS demo.",
              price: 249,
              originalPrice: 289,
              isVeg: true,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&auto=format&fit=crop&q=80",
              customizations: [
                { name: "Extras", options: [{ name: "Extra Salan", extraPrice: 25 }, { name: "Onion Raita", extraPrice: 30 }] },
              ],
            },
            {
              name: "Hyderabad Bowl Prawn",
              description: "[Demo Item] Fictional prawn biryani invented for demonstration. No seafood sourcing or real restaurant recipe involved.",
              price: 399,
              originalPrice: 450,
              isVeg: false,
              isPopular: false,
              image: "https://images.unsplash.com/photo-1625398407796-82e6b20a85d0?w=600&auto=format&fit=crop&q=80",
            },
          ],
        },
        {
          name: "Starters",
          items: [
            {
              name: "Demo Seekh Kebab",
              description: "[Demo Item] Fictional minced kebab invented for this OFOMS prototype. Name and recipe are completely made up.",
              price: 280,
              originalPrice: 320,
              isVeg: false,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
            },
            {
              name: "Crispy Veg Sampler",
              description: "[Demo Item] Assorted fictional fried snacks invented solely for the OFOMS college prototype.",
              price: 199,
              isVeg: true,
              isPopular: false,
              image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
            },
          ],
        },
        {
          name: "Sweet Endings",
          items: [
            {
              name: "Prototype Kheer",
              description: "[Demo Item] Fictional rice pudding dessert. Used only for OFOMS demo system testing.",
              price: 99,
              isVeg: true,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1574484284002-952d92a03a52?w=600&auto=format&fit=crop&q=80",
            },
          ],
        },
      ],
    },

    // ── 3. Crave Corner ────────────────────────────────────
    {
      name: "Crave Corner",
      slug: "crave-corner",
      description: "[DEMO] Fictional all-day café invented for the OFOMS college project. Snacks, sandwiches and coffees are all simulated.",
      cuisineType: "Café, Sandwiches, Burgers, Beverages",
      address: "Plot 9, Fictional Street, Demo Zone, Demoville",
      phone: "+91 90001 00003",
      rating: 4.5,
      totalReviews: 204,
      deliveryTimeMin: 20,
      deliveryTimeMax: 35,
      deliveryFee: 25,
      minOrderValue: 100,
      priceRange: "₹",
      isVegOnly: false,
      isOpen: true,
      coverImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&auto=format&fit=crop&q=80",
      logoImage: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200&auto=format&fit=crop&q=80",
      lat: 17.4504,
      lng: 78.3808,
      categories: [
        {
          name: "Burgers & Wraps",
          items: [
            {
              name: "Crave Classic Burger",
              description: "[Demo Item] Fictional juicy patty burger invented for prototype testing. No real restaurant or recipe referenced.",
              price: 199,
              originalPrice: 249,
              isVeg: false,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
              customizations: [
                { name: "Patty Type", options: [{ name: "Chicken", extraPrice: 0 }, { name: "Mutton", extraPrice: 40 }, { name: "Veg Aloo", extraPrice: -20 }] },
                { name: "Add-ons", options: [{ name: "Extra Cheese Slice", extraPrice: 30 }, { name: "Bacon Strip", extraPrice: 40 }, { name: "Avocado", extraPrice: 35 }] },
                { name: "Sauce", options: [{ name: "Classic Mayo", extraPrice: 0 }, { name: "Sriracha Aioli", extraPrice: 0 }, { name: "BBQ Chipotle", extraPrice: 0 }] },
              ],
            },
            {
              name: "Veggie Pesto Wrap",
              description: "[Demo Item] Fictional grilled veggie wrap for demo purposes. Invented for OFOMS college prototype only.",
              price: 159,
              isVeg: true,
              isPopular: false,
              image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&auto=format&fit=crop&q=80",
            },
            {
              name: "Spicy Chicken Sub",
              description: "[Demo Item] Fictional foot-long sub with invented hot sauce recipe. Simulated for this project.",
              price: 229,
              originalPrice: 269,
              isVeg: false,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80",
            },
          ],
        },
        {
          name: "Beverages",
          items: [
            {
              name: "Demo Cold Coffee",
              description: "[Demo Item] Fictional cold brew invented for demo. No real coffee brand referenced.",
              price: 99,
              isVeg: true,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&auto=format&fit=crop&q=80",
              customizations: [
                { name: "Size", options: [{ name: "Regular (300ml)", extraPrice: 0 }, { name: "Large (500ml)", extraPrice: 30 }] },
                { name: "Milk", options: [{ name: "Full Cream (Demo)", extraPrice: 0 }, { name: "Oat Milk (Demo)", extraPrice: 20 }] },
              ],
            },
            {
              name: "Tropical Smoothie",
              description: "[Demo Item] Fictional mango-pineapple smoothie for prototype use only.",
              price: 120,
              isVeg: true,
              isPopular: false,
              image: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=600&auto=format&fit=crop&q=80",
            },
          ],
        },
        {
          name: "Fries & Bites",
          items: [
            {
              name: "Loaded Prototype Fries",
              description: "[Demo Item] Fictional loaded fries with made-up seasoning for demo purposes.",
              price: 129,
              originalPrice: 149,
              isVeg: true,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=600&auto=format&fit=crop&q=80",
              customizations: [
                { name: "Topping", options: [{ name: "Cheese Sauce", extraPrice: 0 }, { name: "Jalapeño & Cheese", extraPrice: 20 }] },
              ],
            },
          ],
        },
      ],
    },

    // ── 4. Tandoor Tales ───────────────────────────────────
    {
      name: "Tandoor Tales",
      slug: "tandoor-tales",
      description: "[DEMO] Fictional tandoor grill experience invented for OFOMS. All recipes, staff, and pricing are completely made up.",
      cuisineType: "Tandoori, Kebabs, Grills",
      address: "22 Story Street, Prototype Bazaar, Demoville",
      phone: "+91 90001 00004",
      rating: 4.6,
      totalReviews: 187,
      deliveryTimeMin: 35,
      deliveryTimeMax: 50,
      deliveryFee: 40,
      minOrderValue: 250,
      priceRange: "₹₹",
      isVegOnly: false,
      isOpen: true,
      coverImage: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=1200&auto=format&fit=crop&q=80",
      logoImage: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=200&auto=format&fit=crop&q=80",
      lat: 17.4416,
      lng: 78.3807,
      categories: [
        {
          name: "Tales Tandoor",
          items: [
            {
              name: "Murgh Malai Tikka (Demo)",
              description: "[Demo Item] Fictional creamy chicken tikka invented for OFOMS prototype. Marinade recipe is entirely made up.",
              price: 320,
              originalPrice: 369,
              isVeg: false,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
              customizations: [
                { name: "Portion", options: [{ name: "6 pieces", extraPrice: 0 }, { name: "12 pieces", extraPrice: 300 }] },
                { name: "Accompaniment", options: [{ name: "Mint Chutney (Demo)", extraPrice: 0 }, { name: "Garlic Naan", extraPrice: 60 }] },
              ],
            },
            {
              name: "Paneer Angara (Demo)",
              description: "[Demo Item] Fictional smoky paneer from an invented tandoor technique for this demo system.",
              price: 270,
              originalPrice: 319,
              isVeg: true,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80",
            },
            {
              name: "Demo Lamb Chop Grill",
              description: "[Demo Item] Fictional marinated lamb chops invented only for this OFOMS college prototype showcase.",
              price: 480,
              originalPrice: 530,
              isVeg: false,
              isPopular: false,
              image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&auto=format&fit=crop&q=80",
            },
          ],
        },
        {
          name: "Breads",
          items: [
            {
              name: "Roomali Roti (Demo)",
              description: "[Demo Item] Fictional thin bread from made-up recipe for demo use.",
              price: 40,
              isVeg: true,
              isPopular: false,
              image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80",
            },
            {
              name: "Stuffed Kulcha (Demo)",
              description: "[Demo Item] Fictional spiced stuffed bread invented for the OFOMS prototype.",
              price: 70,
              isVeg: true,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80",
            },
          ],
        },
      ],
    },

    // ── 5. The Curry House ─────────────────────────────────
    {
      name: "The Curry House",
      slug: "the-curry-house",
      description: "[DEMO] Fictional curry specialists invented for the OFOMS demo. Recipes, pricing and branding are 100% made up.",
      cuisineType: "Indian Curry, Thali, Comfort Food",
      address: "5 Sauce Avenue, Prototype Colony, Demoville",
      phone: "+91 90001 00005",
      rating: 4.4,
      totalReviews: 143,
      deliveryTimeMin: 30,
      deliveryTimeMax: 50,
      deliveryFee: 30,
      minOrderValue: 150,
      priceRange: "₹",
      isVegOnly: false,
      isOpen: true,
      coverImage: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=1200&auto=format&fit=crop&q=80",
      logoImage: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&auto=format&fit=crop&q=80",
      lat: 17.4350,
      lng: 78.3900,
      categories: [
        {
          name: "Thali Combos",
          items: [
            {
              name: "Grand Demo Thali",
              description: "[Demo Item] Fictional all-in-one thali plate invented for prototype. Includes made-up curries, dal, and bread.",
              price: 199,
              originalPrice: 249,
              isVeg: true,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
              customizations: [
                { name: "Add Protein", options: [{ name: "No Extra", extraPrice: 0 }, { name: "Demo Chicken Curry", extraPrice: 80 }, { name: "Demo Egg Curry", extraPrice: 50 }] },
              ],
            },
            {
              name: "Non-Veg Combo Thali (Demo)",
              description: "[Demo Item] Fictional meat thali invented for demo purposes only. No real meal is referenced.",
              price: 269,
              originalPrice: 319,
              isVeg: false,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80",
            },
          ],
        },
        {
          name: "Curries",
          items: [
            {
              name: "Demo Kadhai Paneer",
              description: "[Demo Item] Fictional stir-fried paneer with invented capsicum-tomato masala. OFOMS demo only.",
              price: 249,
              isVeg: true,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80",
            },
            {
              name: "Demo Chicken Rogan Josh",
              description: "[Demo Item] Fictional aromatic chicken curry invented for this college project prototype.",
              price: 299,
              originalPrice: 339,
              isVeg: false,
              isPopular: false,
              image: "https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=600&auto=format&fit=crop&q=80",
            },
            {
              name: "Dal Tadka (Demo)",
              description: "[Demo Item] Fictional tempered lentils from a made-up recipe for demo purposes.",
              price: 149,
              isVeg: true,
              isPopular: false,
              image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
            },
          ],
        },
      ],
    },

    // ── 6. Hyderabad Bowl ─────────────────────────────────
    {
      name: "Hyderabad Bowl",
      slug: "hyderabad-bowl",
      description: "[DEMO] Fictional rice-bowl concept invented for the OFOMS college prototype. All items are entirely made up.",
      cuisineType: "Rice Bowls, Biryani, South Indian",
      address: "Bowl Street 7, Demo Crossing, Demoville",
      phone: "+91 90001 00006",
      rating: 4.8,
      totalReviews: 291,
      deliveryTimeMin: 25,
      deliveryTimeMax: 40,
      deliveryFee: 35,
      minOrderValue: 200,
      priceRange: "₹₹",
      isVegOnly: false,
      isOpen: true,
      coverImage: "https://images.unsplash.com/photo-1625398407796-82e6b20a85d0?w=1200&auto=format&fit=crop&q=80",
      logoImage: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&auto=format&fit=crop&q=80",
      lat: 17.4300,
      lng: 78.4100,
      categories: [
        {
          name: "Bowl Creations",
          items: [
            {
              name: "Classic Biryani Bowl",
              description: "[Demo Item] Fictional biryani in a bowl format invented for OFOMS. Not a real restaurant item.",
              price: 279,
              originalPrice: 319,
              isVeg: false,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
              customizations: [
                { name: "Protein", options: [{ name: "Chicken (Demo)", extraPrice: 0 }, { name: "Mutton (Demo)", extraPrice: 70 }, { name: "Veg (Demo)", extraPrice: -30 }] },
                { name: "Spice", options: [{ name: "Mild", extraPrice: 0 }, { name: "Medium", extraPrice: 0 }, { name: "Hot", extraPrice: 0 }] },
              ],
            },
            {
              name: "South Spice Bowl",
              description: "[Demo Item] Fictional South Indian inspired rice bowl invented for prototype testing purposes.",
              price: 229,
              isVeg: true,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80",
            },
            {
              name: "Demo Prawn Rice Bowl",
              description: "[Demo Item] Fictional prawn rice bowl invented for OFOMS demo. No real seafood data used.",
              price: 349,
              originalPrice: 389,
              isVeg: false,
              isPopular: false,
              image: "https://images.unsplash.com/photo-1625398407796-82e6b20a85d0?w=600&auto=format&fit=crop&q=80",
            },
          ],
        },
        {
          name: "Dosa Corner",
          items: [
            {
              name: "Masala Dosa (Demo)",
              description: "[Demo Item] Fictional crispy dosa with invented spiced potato filling. OFOMS prototype only.",
              price: 119,
              isVeg: true,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
            },
            {
              name: "Cheese Dosa Special (Demo)",
              description: "[Demo Item] Fictional cheesy dosa invented for this college demonstration system.",
              price: 149,
              originalPrice: 169,
              isVeg: true,
              isPopular: false,
              image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80",
            },
          ],
        },
      ],
    },

    // ── 7. Street Wok ─────────────────────────────────────
    {
      name: "Street Wok",
      slug: "street-wok",
      description: "[DEMO] Fictional Asian street food concept invented for the OFOMS prototype. All dishes, staff, and branding are made up.",
      cuisineType: "Chinese, Asian, Noodles, Street Food",
      address: "Wok Road 14, Noodle Junction, Demoville",
      phone: "+91 90001 00007",
      rating: 4.3,
      totalReviews: 156,
      deliveryTimeMin: 20,
      deliveryTimeMax: 35,
      deliveryFee: 25,
      minOrderValue: 120,
      priceRange: "₹",
      isVegOnly: false,
      isOpen: true,
      coverImage: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=1200&auto=format&fit=crop&q=80",
      logoImage: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=200&auto=format&fit=crop&q=80",
      lat: 17.4460,
      lng: 78.3750,
      categories: [
        {
          name: "Noodles & Rice",
          items: [
            {
              name: "Wok-Tossed Hakka Noodles (Demo)",
              description: "[Demo Item] Fictional stir-fried noodles from an invented wok technique. Used only in OFOMS demo.",
              price: 159,
              originalPrice: 189,
              isVeg: false,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80",
              customizations: [
                { name: "Protein", options: [{ name: "Veg (Demo)", extraPrice: 0 }, { name: "Egg (Demo)", extraPrice: 20 }, { name: "Chicken (Demo)", extraPrice: 40 }, { name: "Prawn (Demo)", extraPrice: 60 }] },
                { name: "Spice", options: [{ name: "Regular", extraPrice: 0 }, { name: "Schezwan Hot", extraPrice: 0 }] },
              ],
            },
            {
              name: "Fried Rice Combo (Demo)",
              description: "[Demo Item] Fictional fried rice with invented soy-garlic sauce for demo testing.",
              price: 149,
              isVeg: false,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=600&auto=format&fit=crop&q=80",
            },
            {
              name: "Singapore Noodles (Demo)",
              description: "[Demo Item] Fictional curry-spiced thin noodles — a made-up recipe for OFOMS prototype.",
              price: 179,
              isVeg: false,
              isPopular: false,
              image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80",
            },
          ],
        },
        {
          name: "Momos & Dumplings",
          items: [
            {
              name: "Demo Steamed Momos (8 pcs)",
              description: "[Demo Item] Fictional dumplings with invented filling for this college project demo system.",
              price: 129,
              isVeg: false,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80",
              customizations: [
                { name: "Filling", options: [{ name: "Veg Corn (Demo)", extraPrice: 0 }, { name: "Chicken (Demo)", extraPrice: 20 }] },
                { name: "Style", options: [{ name: "Steamed (Demo)", extraPrice: 0 }, { name: "Fried (Demo)", extraPrice: 15 }] },
              ],
            },
            {
              name: "Veg Dimsums (Demo)",
              description: "[Demo Item] Fictional delicate dumplings invented for OFOMS. No real dim sum establishment referenced.",
              price: 149,
              isVeg: true,
              isPopular: false,
              image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80",
            },
          ],
        },
        {
          name: "Sides",
          items: [
            {
              name: "Manchurian Gravy (Demo)",
              description: "[Demo Item] Fictional Indo-Chinese manchurian balls invented for this prototype.",
              price: 149,
              originalPrice: 179,
              isVeg: true,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80",
            },
          ],
        },
      ],
    },

    // ── 8. Dosa District ──────────────────────────────────
    {
      name: "Dosa District",
      slug: "dosa-district",
      description: "[DEMO] Fictional South Indian dosa brand invented for OFOMS college prototype. All recipes and branding are made up.",
      cuisineType: "South Indian, Dosas, Idli, Breakfast",
      address: "Grid 11, Fictional South Colony, Demoville",
      phone: "+91 90001 00008",
      rating: 4.6,
      totalReviews: 238,
      deliveryTimeMin: 20,
      deliveryTimeMax: 35,
      deliveryFee: 20,
      minOrderValue: 100,
      priceRange: "₹",
      isVegOnly: true,
      isOpen: true,
      coverImage: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=1200&auto=format&fit=crop&q=80",
      logoImage: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=200&auto=format&fit=crop&q=80",
      lat: 17.4550,
      lng: 78.3650,
      categories: [
        {
          name: "Dosa Menu",
          items: [
            {
              name: "Crispy Ghee Dosa (Demo)",
              description: "[Demo Item] Fictional golden crispy dosa made with invented batter recipe. OFOMS prototype use only.",
              price: 89,
              originalPrice: 109,
              isVeg: true,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
              customizations: [
                { name: "Stuffing", options: [{ name: "Plain (Demo)", extraPrice: 0 }, { name: "Masala (Demo)", extraPrice: 20 }, { name: "Cheese (Demo)", extraPrice: 30 }] },
                { name: "Side", options: [{ name: "Sambar + 2 Chutneys (Demo)", extraPrice: 0 }] },
              ],
            },
            {
              name: "Onion Rava Dosa (Demo)",
              description: "[Demo Item] Fictional lacy semolina dosa with invented onion-pepper topping for demo.",
              price: 99,
              isVeg: true,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
            },
            {
              name: "Mysore Masala Dosa (Demo)",
              description: "[Demo Item] Fictional spicy Mysore chutney-spread dosa with made-up potato filling for OFOMS demo.",
              price: 109,
              originalPrice: 129,
              isVeg: true,
              isPopular: false,
              image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
            },
          ],
        },
        {
          name: "Idli & Vada",
          items: [
            {
              name: "Idli Sambar Set (Demo, 4 pcs)",
              description: "[Demo Item] Fictional soft idli with invented sambar recipe. Vegan-friendly, OFOMS demo item.",
              price: 69,
              isVeg: true,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80",
            },
            {
              name: "Medu Vada (Demo, 3 pcs)",
              description: "[Demo Item] Fictional crispy lentil doughnut invented for OFOMS prototype demonstration.",
              price: 59,
              isVeg: true,
              isPopular: false,
              image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80",
            },
          ],
        },
        {
          name: "Filter Coffee & Drinks",
          items: [
            {
              name: "Demo Filter Kaapi",
              description: "[Demo Item] Fictional South Indian filter coffee from an invented decoction recipe. For OFOMS demo only.",
              price: 49,
              isVeg: true,
              isPopular: true,
              image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&auto=format&fit=crop&q=80",
            },
            {
              name: "Badam Milk (Demo)",
              description: "[Demo Item] Fictional warm almond milk from an invented spice blend. OFOMS demo item only.",
              price: 79,
              isVeg: true,
              isPopular: false,
              image: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=600&auto=format&fit=crop&q=80",
            },
          ],
        },
      ],
    },
  ];

  // ── 4. INSERT RESTAURANTS + MENUS ────────────────────────
  const createdRestaurants: any[] = [];

  for (const rData of restaurantsData) {
    const { categories, ...rFields } = rData;
    const email = (rFields as any).email || `${rFields.slug}@ofoms.demo`;
    const restaurant = await prisma.restaurant.create({
      data: {
        ...rFields,
        email,
        status: "APPROVED",
      },
    });

    // Assign manager's managed restaurant on first restaurant
    if (createdRestaurants.length === 0) {
      await prisma.user.update({
        where: { id: manager.id },
        data: { managedRestaurantId: restaurant.id },
      });
    }

    let catOrder = 1;
    for (const cat of categories) {
      const menuCat = await prisma.menuCategory.create({
        data: {
          restaurantId: restaurant.id,
          name: cat.name,
          sortOrder: catOrder++,
        },
      });

      let itemOrder = 1;
      for (const item of cat.items) {
        const { customizations, ...itemFields } = item as any;
        await prisma.menuItem.create({
          data: {
            restaurantId: restaurant.id,
            categoryId: menuCat.id,
            ...itemFields,
            customizationsJson: customizations
              ? JSON.stringify(customizations)
              : null,
            isAvailable: true,
          },
        });
      }
    }

    createdRestaurants.push(restaurant);
  }

  // ── 5. FICTIONAL COUPONS ──────────────────────────────────
  console.log("🎟️ [DEMO] Creating fictional promotional coupons...");
  await prisma.coupon.createMany({
    data: [
      {
        code: "DEMO50",
        description: "[DEMO COUPON] 50% off your first fictional order — not a real discount!",
        discountPercent: 50,
        maxDiscount: 100,
        minOrderValue: 150,
        validFrom: new Date("2026-01-01"),
        validUntil: new Date("2027-12-31"),
        isActive: true,
        usageLimit: 999,
        usedCount: 0,
      },
      {
        code: "PROTOTYPE20",
        description: "[DEMO COUPON] 20% off any fictional restaurant order in this prototype.",
        discountPercent: 20,
        maxDiscount: 150,
        minOrderValue: 200,
        validFrom: new Date("2026-01-01"),
        validUntil: new Date("2027-12-31"),
        isActive: true,
        usageLimit: 999,
        usedCount: 12,
      },
      {
        code: "OFOMS100",
        description: "[DEMO COUPON] Flat ₹100 off — fictional coupon for OFOMS college project demo.",
        discountPercent: 25,
        maxDiscount: 100,
        minOrderValue: 400,
        validFrom: new Date("2026-01-01"),
        validUntil: new Date("2027-12-31"),
        isActive: true,
        usageLimit: 999,
        usedCount: 5,
      },
      {
        code: "FREESHIP",
        description: "[DEMO COUPON] Fictional free delivery coupon — zero delivery fee on demo orders.",
        discountPercent: 100,
        maxDiscount: 50,
        minOrderValue: 100,
        validFrom: new Date("2026-01-01"),
        validUntil: new Date("2027-12-31"),
        isActive: true,
        usageLimit: 999,
        usedCount: 3,
      },
      {
        code: "WOKOFF15",
        description: "[DEMO COUPON] Fictional 15% off Street Wok orders. Created for demo only.",
        discountPercent: 15,
        maxDiscount: 75,
        minOrderValue: 120,
        validFrom: new Date("2026-01-01"),
        validUntil: new Date("2027-12-31"),
        isActive: false,
        usageLimit: 100,
        usedCount: 0,
      },
    ],
  });

  // ── 6. FICTIONAL ORDERS ───────────────────────────────────
  console.log("📦 [DEMO] Creating fictional past and active orders...");

  const rest0 = createdRestaurants[0]; // SpiceRoute Kitchen
  const rest1 = createdRestaurants[1]; // Urban Biryani Co.
  const rest2 = createdRestaurants[2]; // Crave Corner
  const rest6 = createdRestaurants[6]; // Street Wok

  const rest0Items = await prisma.menuItem.findMany({ where: { restaurantId: rest0.id }, take: 3 });
  const rest1Items = await prisma.menuItem.findMany({ where: { restaurantId: rest1.id }, take: 3 });
  const rest2Items = await prisma.menuItem.findMany({ where: { restaurantId: rest2.id }, take: 2 });
  const rest6Items = await prisma.menuItem.findMany({ where: { restaurantId: rest6.id }, take: 2 });

  const demoAddrJson = JSON.stringify({
    recipient: "Alex Demo",
    phone: "+91 90000 10001",
    street: "Block C, Apt 7, Greenview Residency",
    area: "Demo Nagar, Near Central Park",
    city: "Demoville",
    state: "Prototype State",
    postalCode: "000001",
  });

  // Helper to make demo order numbers
  let orderCounter = 1001;
  const nextOrderNumber = () => `OF-DEMO-${orderCounter++}`;

  // ── DELIVERED orders (historical) ──
  const deliveredOrdersData = [
    {
      restaurantId: rest1.id,
      items: [
        { menuItem: rest1Items[0], quantity: 2, price: rest1Items[0].price },
        { menuItem: rest1Items[1], quantity: 1, price: rest1Items[1].price },
      ],
      subtotal: rest1Items[0].price * 2 + (rest1Items[1]?.price ?? 0),
      discount: 50,
      deliveryFee: 35,
      taxAmount: 18,
      createdAt: new Date(Date.now() - 7 * 86400000),
      paymentMethod: "UPI",
      specialInstructions: "[DEMO] No special instructions.",
      note: "Urban Biryani Co. — fictional past order",
    },
    {
      restaurantId: rest0.id,
      items: [
        { menuItem: rest0Items[0], quantity: 1, price: rest0Items[0].price },
      ],
      subtotal: rest0Items[0].price,
      discount: 0,
      deliveryFee: 30,
      taxAmount: 14,
      createdAt: new Date(Date.now() - 14 * 86400000),
      paymentMethod: "COD",
      specialInstructions: "[DEMO] Please ring the fictional doorbell.",
      note: "SpiceRoute Kitchen — fictional past order",
    },
    {
      restaurantId: rest2.id,
      items: [
        { menuItem: rest2Items[0], quantity: 2, price: rest2Items[0].price },
        { menuItem: rest2Items[1], quantity: 1, price: (rest2Items[1]?.price ?? 99) },
      ],
      subtotal: rest2Items[0].price * 2 + (rest2Items[1]?.price ?? 99),
      discount: 30,
      deliveryFee: 25,
      taxAmount: 11,
      createdAt: new Date(Date.now() - 3 * 86400000),
      paymentMethod: "CARD",
      specialInstructions: "[DEMO] Extra demo napkins please.",
      note: "Crave Corner — fictional past order",
    },
  ];

  const deliveredOrders = [];
  for (const od of deliveredOrdersData) {
    const total = od.subtotal + od.deliveryFee + od.taxAmount - od.discount;
    const order = await prisma.order.create({
      data: {
        orderNumber: nextOrderNumber(),
        userId: customer.id,
        restaurantId: od.restaurantId,
        status: "DELIVERED",
        paymentMethod: od.paymentMethod,
        paymentStatus: "COMPLETED",
        subtotal: od.subtotal,
        deliveryFee: od.deliveryFee,
        tax: od.taxAmount,
        discount: od.discount,
        total,
        deliveryAddressJson: demoAddrJson,
        specialInstructions: od.specialInstructions,
        estimatedDeliveryMinutes: 35,
        createdAt: od.createdAt,
        items: {
          create: od.items
            .filter((i: any) => i.menuItem)
            .map((i: any) => ({
              menuItemId: i.menuItem.id,
              name: i.menuItem.name + " [Demo]",
              quantity: i.quantity,
              price: i.price,
            })),
        },
        statusHistory: {
          create: [
            { status: "PLACED", note: "Order placed by customer", createdAt: new Date(od.createdAt.getTime()) },
            { status: "ACCEPTED", note: "Restaurant accepted order", createdAt: new Date(od.createdAt.getTime() + 5 * 60000) },
            { status: "PREPARING", note: "Kitchen preparing food", createdAt: new Date(od.createdAt.getTime() + 10 * 60000) },
            { status: "READY_FOR_PICKUP", note: "Food packaged and ready", createdAt: new Date(od.createdAt.getTime() + 25 * 60000) },
            { status: "OUT_FOR_DELIVERY", note: "Rider picked up order", createdAt: new Date(od.createdAt.getTime() + 30 * 60000) },
            { status: "DELIVERED", note: "Order delivered to address", createdAt: new Date(od.createdAt.getTime() + 45 * 60000) },
          ],
        },
      },
    });

    // Create a payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        method: od.paymentMethod,
        status: "COMPLETED",
        transactionId: `DEMO-TXN-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      },
    });

    // Create a delivery assignment
    await prisma.deliveryAssignment.create({
      data: {
        orderId: order.id,
        deliveryPersonnelId: deliveryUser.id,
        status: "DELIVERED",
        pickupTime: new Date(od.createdAt.getTime() + 20 * 60000),
        deliveredTime: new Date(od.createdAt.getTime() + 45 * 60000),
      },
    });

    deliveredOrders.push(order);
  }

  // ── ACTIVE / IN-PROGRESS order ──
  const activeOrder = await prisma.order.create({
    data: {
      orderNumber: nextOrderNumber(),
      userId: customer.id,
      restaurantId: rest6.id,
      status: "PREPARING",
      paymentMethod: "UPI",
      paymentStatus: "COMPLETED",
      subtotal: (rest6Items[0]?.price ?? 159) + (rest6Items[1]?.price ?? 149),
      deliveryFee: 25,
      tax: 12,
      discount: 0,
      total: (rest6Items[0]?.price ?? 159) + (rest6Items[1]?.price ?? 149) + 25 + 12,
      deliveryAddressJson: demoAddrJson,
      specialInstructions: "[DEMO] This is a simulated active order for testing.",
      estimatedDeliveryMinutes: 30,
      items: {
        create: rest6Items
          .filter((i) => i)
          .slice(0, 2)
          .map((i) => ({
            menuItemId: i.id,
            name: i.name + " [Demo]",
            quantity: 1,
            price: i.price,
          })),
      },
      statusHistory: {
        create: [
          { status: "PLACED", note: "Order placed by customer" },
          { status: "ACCEPTED", note: "Restaurant accepted order" },
          { status: "PREPARING", note: "Kitchen preparing dish" },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: activeOrder.id,
      amount: activeOrder.total,
      method: "UPI",
      status: "COMPLETED",
      transactionId: `DEMO-TXN-ACTIVE-${Date.now()}`,
    },
  });

  await prisma.deliveryAssignment.create({
    data: {
      orderId: activeOrder.id,
      deliveryPersonnelId: deliveryUser.id,
      status: "ACCEPTED",
    },
  });

  // ── Orders from other fictional customers ──
  const otherOrderData = [
    { custId: extraCustomerIds[0], restId: rest0.id, items: rest0Items, payMethod: "UPI", daysAgo: 1 },
    { custId: extraCustomerIds[1], restId: rest1.id, items: rest1Items, payMethod: "CARD", daysAgo: 2 },
    { custId: extraCustomerIds[2], restId: rest2.id, items: rest2Items, payMethod: "COD", daysAgo: 3 },
    { custId: extraCustomerIds[3], restId: rest6.id, items: rest6Items, payMethod: "UPI", daysAgo: 4 },
    { custId: extraCustomerIds[4], restId: rest0.id, items: rest0Items.slice(1), payMethod: "WALLET", daysAgo: 5 },
    { custId: extraCustomerIds[5], restId: rest1.id, items: rest1Items.slice(1), payMethod: "UPI", daysAgo: 6 },
  ];

  for (const od of otherOrderData) {
    if (!od.items || od.items.length === 0) continue;
    const sub = od.items.reduce((s: number, i: any) => s + i.price, 0);
    const total = sub + 30 + Math.round(sub * 0.05);
    const createdAt = new Date(Date.now() - od.daysAgo * 86400000);
    const order = await prisma.order.create({
      data: {
        orderNumber: nextOrderNumber(),
        userId: od.custId,
        restaurantId: od.restId,
        status: "DELIVERED",
        paymentMethod: od.payMethod,
        paymentStatus: "COMPLETED",
        subtotal: sub,
        deliveryFee: 30,
        tax: Math.round(sub * 0.05),
        discount: 0,
        total,
        deliveryAddressJson: JSON.stringify({
          recipient: "Demo Customer",
          phone: "+91 90000 20000",
          street: "Fictional Address Block",
          area: "Demo Area",
          city: "Demoville",
          state: "Prototype State",
          postalCode: "000010",
        }),
        specialInstructions: "[DEMO] Fictional order for prototype data.",
        estimatedDeliveryMinutes: 30,
        createdAt,
        items: {
          create: od.items.map((i: any) => ({
            menuItemId: i.id,
            name: i.name + " [Demo]",
            quantity: 1,
            price: i.price,
          })),
        },
        statusHistory: {
          create: [
            { status: "PLACED", createdAt },
            { status: "DELIVERED", createdAt: new Date(createdAt.getTime() + 40 * 60000) },
          ],
        },
      },
    });
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        method: od.payMethod,
        status: "COMPLETED",
        transactionId: `DEMO-TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      },
    });
  }

  // ── 7. FICTIONAL REVIEWS ──────────────────────────────────
  console.log("⭐ [DEMO] Creating fictional reviews...");
  const fakeReviews = [
    { rating: 5, comment: "[DEMO REVIEW] Totally fictional review — food was absolutely amazing in this prototype!", orderId: deliveredOrders[0].id, restaurantId: rest1.id },
    { rating: 4, comment: "[DEMO REVIEW] Great simulated experience. Purely fictional feedback for OFOMS demo.", orderId: deliveredOrders[1].id, restaurantId: rest0.id },
    { rating: 5, comment: "[DEMO REVIEW] Demo data only — loved the fictional burger in this prototype system.", orderId: deliveredOrders[2].id, restaurantId: rest2.id },
  ];

  for (const r of fakeReviews) {
    await prisma.review.create({
      data: {
        userId: customer.id,
        restaurantId: r.restaurantId,
        orderId: r.orderId,
        rating: r.rating,
        comment: r.comment,
        restaurantReply: "[DEMO REPLY] Thank you for this fictional feedback! — The Demo Restaurant Team",
      },
    });
  }

  // ── 8. NOTIFICATIONS ──────────────────────────────────────
  console.log("🔔 [DEMO] Creating fictional notifications...");
  await prisma.notification.createMany({
    data: [
      {
        userId: customer.id,
        title: "[DEMO] Order Delivered",
        message: "Your fictional order OF-DEMO-1001 has been delivered! This is a simulated notification.",
        type: "ORDER_STATUS",
        orderId: deliveredOrders[0].id,
        isRead: false,
      },
      {
        userId: customer.id,
        title: "[DEMO] Order Being Prepared",
        message: "Street Wok (fictional) is now preparing your demo order. Estimated: 30 minutes.",
        type: "ORDER_STATUS",
        orderId: activeOrder.id,
        isRead: false,
      },
      {
        userId: customer.id,
        title: "[DEMO] Coupon Available",
        message: "Use DEMO50 to get 50% off your next fictional order! For demo purposes only.",
        type: "PROMOTION",
        isRead: true,
      },
    ],
  });

  // ── 9. SEED INITIAL CART ──────────────────────────────────
  console.log("🛒 [DEMO] Seeding sample cart for demo customer...");
  const cartRestaurant = createdRestaurants[0];
  const cartItems = await prisma.menuItem.findMany({
    where: { restaurantId: cartRestaurant.id },
    take: 2,
  });

  if (cartItems.length > 0) {
    const cart = await prisma.cart.create({
      data: {
        userId: customer.id,
        restaurantId: cartRestaurant.id,
      },
    });

    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        menuItemId: cartItems[0].id,
        quantity: 2,
        price: cartItems[0].price,
        selectedCustomizations: JSON.stringify({ "Spice Level": { name: "Medium", extraPrice: 0 } }),
      },
    });

    if (cartItems[1]) {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          menuItemId: cartItems[1].id,
          quantity: 1,
          price: cartItems[1].price,
          selectedCustomizations: null,
        },
      });
    }
  }

  console.log("✅ [DEMO] OFOMS fictional data seeding completed successfully!");
  console.log("");
  console.log("📋 DEMO ACCOUNTS (all fictional, password: demo123)");
  console.log("   Customer        → customer@ofoms.demo");
  console.log("   Restaurant Mgr  → restaurant@ofoms.demo");
  console.log("   Delivery        → delivery@ofoms.demo");
  console.log("   System Admin    → admin@ofoms.demo");
  console.log("");
  console.log("🍽️  FICTIONAL RESTAURANTS CREATED:");
  createdRestaurants.forEach((r, i) => console.log(`   ${i + 1}. ${r.name} [DEMO]`));
  console.log("");
  console.log("⚠️  ALL DATA IS FICTIONAL — FOR COLLEGE DEMO ONLY");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
