import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Recipe from '../models/Recipe.js';
import Cookbook from '../models/Cookbook.js';
import MealPlanner from '../models/MealPlanner.js';

dotenv.config();

const usersData = [
  { username: 'chef_chef', email: 'chef@example.com', password: 'password123', bio: 'Professional culinary artist. Sharing top secret gourmet recipes.', profileImage: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400' },
  { username: 'foodie_jane', email: 'jane@example.com', password: 'password123', bio: 'Home cook, foodie explorer, and recipe reviewer.', profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' },
  { username: 'gourmet_dan', email: 'dan@example.com', password: 'password123', bio: 'Tasting my way through life. Meat lover and grill master.', profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
  { username: 'baker_bob', email: 'bob@example.com', password: 'password123', bio: 'Baking is my therapy. Pastries, bread, cookies, and cakes!', profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' },
  { username: 'spicy_alice', email: 'alice@example.com', password: 'password123', bio: 'Spice enthusiast. Specializing in Indian, Thai, and Mexican cuisine.', profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400' }
];

const getRecipesData = (users) => {
  const [chef, jane, dan, bob, alice] = users;

  return [
    {
      title: 'Spaghetti Carbonara',
      description: 'A classic Roman pasta dish made with eggs, hard cheese, cured pork, and black pepper. Simple, rich, and absolutely delicious.',
      ingredients: [
        { name: 'Spaghetti', quantity: 400, unit: 'g' },
        { name: 'Guanciale or Pancetta', quantity: 150, unit: 'g' },
        { name: 'Pecorino Romano Cheese', quantity: 50, unit: 'g' },
        { name: 'Egg yolks', quantity: 4, unit: 'pcs' },
        { name: 'Black pepper', quantity: 1, unit: 'tsp' }
      ],
      instructions: [
        'Cook spaghetti in boiling salted water until al dente.',
        'Fry the guanciale in a pan until crispy, then remove from heat.',
        'Whisk egg yolks and cheese in a bowl, seasoning heavily with black pepper.',
        'Combine hot pasta with the guanciale, then quickly stir in the egg mixture off the heat to create a creamy sauce.'
      ],
      tags: ['Italian', 'Pasta', 'Quick'],
      cookTime: 20,
      difficulty: 'Easy',
      nutritionalInfo: { calories: 650, protein: 25, carbs: 70, fats: 30 },
      image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800',
      author: chef._id,
      ratings: [{ user: jane._id, value: 5 }, { user: dan._id, value: 4 }],
      comments: [
        { user: jane._id, text: 'This is the most authentic recipe I have ever tried! Turned out super creamy.', createdAt: new Date() }
      ]
    },
    {
      title: 'Classic Beef Tacos',
      description: 'Zesty ground beef stuffed in crispy taco shells, topped with shredded lettuce, cheese, tomatoes, and sour cream.',
      ingredients: [
        { name: 'Ground Beef', quantity: 500, unit: 'g' },
        { name: 'Taco Seasoning', quantity: 1, unit: 'packet' },
        { name: 'Taco Shells', quantity: 8, unit: 'pcs' },
        { name: 'Cheddar Cheese (shredded)', quantity: 100, unit: 'g' },
        { name: 'Tomato (diced)', quantity: 1, unit: 'pc' },
        { name: 'Lettuce (shredded)', quantity: 1, unit: 'cup' }
      ],
      instructions: [
        'Brown ground beef in a skillet over medium-high heat. Drain excess fat.',
        'Stir in taco seasoning and water as instructed on packet, simmer for 5 minutes.',
        'Warm taco shells in the oven at 180°C for 5 minutes.',
        'Assemble tacos by layering beef, lettuce, cheese, tomatoes, and your favorite toppings.'
      ],
      tags: ['Mexican', 'Beef', 'Quick'],
      cookTime: 15,
      difficulty: 'Easy',
      nutritionalInfo: { calories: 420, protein: 24, carbs: 32, fats: 22 },
      image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
      author: alice._id,
      ratings: [{ user: dan._id, value: 5 }],
      comments: [
        { user: dan._id, text: 'Quick and tasty! Perfect for taco Tuesdays.', createdAt: new Date() }
      ]
    },
    {
      title: 'Butter Chicken (Murgh Makhani)',
      description: 'Tender chicken pieces cooked in a rich, buttery, spiced tomato sauce. Indulgent, fragrant, and perfect with fresh naan.',
      ingredients: [
        { name: 'Chicken Breast (cubed)', quantity: 600, unit: 'g' },
        { name: 'Yogurt', quantity: 120, unit: 'g' },
        { name: 'Garam Masala', quantity: 2, unit: 'tsp' },
        { name: 'Butter', quantity: 50, unit: 'g' },
        { name: 'Tomato Puree', quantity: 400, unit: 'g' },
        { name: 'Heavy Cream', quantity: 150, unit: 'ml' }
      ],
      instructions: [
        'Marinate chicken in yogurt and spices for at least 30 minutes.',
        'Cook marinated chicken in a large pan until lightly charred, then set aside.',
        'In the same pan, melt butter and simmer tomato puree with garlic, ginger, and spices.',
        'Stir in heavy cream and cooked chicken. Simmer on low heat for 10 minutes.'
      ],
      tags: ['Indian', 'Chicken', 'Curry'],
      cookTime: 40,
      difficulty: 'Medium',
      nutritionalInfo: { calories: 580, protein: 35, carbs: 12, fats: 42 },
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800',
      author: alice._id,
      ratings: [{ user: chef._id, value: 5 }, { user: jane._id, value: 5 }],
      comments: [
        { user: chef._id, text: 'Beautiful spice blend. Tastes just like my favorite restaurant!', createdAt: new Date() }
      ]
    },
    {
      title: 'Avocado Green Salad',
      description: 'A light, healthy green salad featuring ripe avocados, crunchy cucumbers, and crisp lettuce tossed in a zesty lemon-herb vinaigrette.',
      ingredients: [
        { name: 'Avocado (sliced)', quantity: 2, unit: 'pcs' },
        { name: 'Cucumber (sliced)', quantity: 1, unit: 'pc' },
        { name: 'Mixed Greens / Lettuce', quantity: 150, unit: 'g' },
        { name: 'Olive Oil', quantity: 2, unit: 'tbsp' },
        { name: 'Lemon Juice', quantity: 1, unit: 'tbsp' }
      ],
      instructions: [
        'Wash greens and dry them thoroughly.',
        'Slice the cucumbers and avocados, and arrange them on a bed of greens in a salad bowl.',
        'Whisk olive oil, lemon juice, salt, and pepper in a small bowl to make dressing.',
        'Drizzle dressing over salad just before serving and toss gently.'
      ],
      tags: ['Vegan', 'Salad', 'Keto', 'Quick'],
      cookTime: 10,
      difficulty: 'Easy',
      nutritionalInfo: { calories: 210, protein: 3, carbs: 10, fats: 18 },
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
      author: jane._id,
      ratings: [{ user: alice._id, value: 4 }],
      comments: []
    },
    {
      title: 'Decadent Chocolate Lava Cake',
      description: 'Warm chocolate cakes with a molten liquid center. Elegant and rich, it is the ultimate dessert for chocolate lovers.',
      ingredients: [
        { name: 'Dark Chocolate', quantity: 100, unit: 'g' },
        { name: 'Butter', quantity: 50, unit: 'g' },
        { name: 'Eggs', quantity: 2, unit: 'pcs' },
        { name: 'Sugar', quantity: 50, unit: 'g' },
        { name: 'All-purpose flour', quantity: 30, unit: 'g' }
      ],
      instructions: [
        'Preheat oven to 200°C. Grease and flour 2 ramekins.',
        'Melt chocolate and butter together in a heatproof bowl.',
        'Whisk eggs and sugar until pale and fluffy, then fold in chocolate mixture and flour.',
        'Pour into ramekins and bake for 10-12 minutes until edges are set but centers are soft.'
      ],
      tags: ['Dessert', 'Baking', 'Sweet'],
      cookTime: 25,
      difficulty: 'Medium',
      nutritionalInfo: { calories: 430, protein: 6, carbs: 45, fats: 26 },
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800',
      author: bob._id,
      ratings: [{ user: chef._id, value: 5 }, { user: jane._id, value: 5 }],
      comments: [
        { user: jane._id, text: 'Stunning! The center was perfectly gooey.', createdAt: new Date() }
      ]
    },
    {
      title: 'Chicken Pad Thai',
      description: 'Classic Thai stir-fried rice noodles with chicken, eggs, tofu, bean sprouts, and peanuts in a tangy tamarind sauce.',
      ingredients: [
        { name: 'Rice Noodles', quantity: 200, unit: 'g' },
        { name: 'Chicken Breast (sliced)', quantity: 250, unit: 'g' },
        { name: 'Pad Thai Sauce', quantity: 4, unit: 'tbsp' },
        { name: 'Eggs', quantity: 2, unit: 'pcs' },
        { name: 'Bean Sprouts', quantity: 1, unit: 'cup' },
        { name: 'Peanuts (crushed)', quantity: 3, unit: 'tbsp' }
      ],
      instructions: [
        'Soak rice noodles in warm water for 30 minutes until soft, then drain.',
        'Stir-fry chicken in a hot wok with oil until cooked. Push to side.',
        'Scramble eggs in the empty side of the wok, then mix with chicken.',
        'Add noodles, Pad Thai sauce, and bean sprouts, tossing everything together. Garnish with peanuts.'
      ],
      tags: ['Asian', 'Noodles', 'Quick'],
      cookTime: 30,
      difficulty: 'Medium',
      nutritionalInfo: { calories: 540, protein: 28, carbs: 65, fats: 18 },
      image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800',
      author: chef._id,
      ratings: [{ user: alice._id, value: 5 }],
      comments: []
    },
    {
      title: 'Perfect Grilled Ribeye Steak',
      description: 'Juicy ribeye steak grilled to perfection, basted with garlic butter, rosemary, and thyme. Pure keto heaven.',
      ingredients: [
        { name: 'Ribeye Steak', quantity: 400, unit: 'g' },
        { name: 'Butter', quantity: 30, unit: 'g' },
        { name: 'Garlic Cloves', quantity: 3, unit: 'pcs' },
        { name: 'Fresh Rosemary', quantity: 2, unit: 'sprigs' }
      ],
      instructions: [
        'Bring steak to room temp, season generously with salt and pepper.',
        'Sear in a smoking hot cast-iron skillet for 2-3 minutes per side.',
        'Add butter, garlic, and rosemary. Tilt pan and spoon melted butter over steak for 2 minutes.',
        'Rest steak for 5 minutes before slicing.'
      ],
      tags: ['Keto', 'Beef', 'Grill'],
      cookTime: 20,
      difficulty: 'Medium',
      nutritionalInfo: { calories: 720, protein: 46, carbs: 0, fats: 60 },
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
      author: dan._id,
      ratings: [{ user: chef._id, value: 5 }],
      comments: [
        { user: chef._id, text: 'Superb crust. Basting with butter is key!', createdAt: new Date() }
      ]
    },
    {
      title: 'Soft Chocolate Chip Cookies',
      description: 'Buttery, soft-baked chocolate chip cookies with crispy edges and a chewy center. The absolute best recipe!',
      ingredients: [
        { name: 'Butter (melted)', quantity: 110, unit: 'g' },
        { name: 'Brown Sugar', quantity: 150, unit: 'g' },
        { name: 'Flour', quantity: 200, unit: 'g' },
        { name: 'Chocolate Chips', quantity: 150, unit: 'g' },
        { name: 'Egg', quantity: 1, unit: 'pc' }
      ],
      instructions: [
        'Whisk melted butter, brown sugar, and white sugar until smooth.',
        'Whisk in egg and vanilla extract, then fold in flour and baking soda.',
        'Stir in chocolate chips. Chill dough for 1 hour.',
        'Scoop dough onto a sheet and bake at 175°C for 10-12 minutes.'
      ],
      tags: ['Dessert', 'Baking', 'Sweet', 'Quick'],
      cookTime: 25,
      difficulty: 'Easy',
      nutritionalInfo: { calories: 180, protein: 2, carbs: 24, fats: 9 },
      image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800',
      author: bob._id,
      ratings: [{ user: jane._id, value: 5 }, { user: dan._id, value: 4 }],
      comments: []
    },
    {
      title: 'Vegan Buddha Bowl',
      description: 'A colorful, nutrient-dense bowl containing quinoa, roasted sweet potatoes, crispy chickpeas, fresh avocado, and tahini dressing.',
      ingredients: [
        { name: 'Quinoa (cooked)', quantity: 1, unit: 'cup' },
        { name: 'Sweet Potato (diced)', quantity: 1, unit: 'pc' },
        { name: 'Canned Chickpeas', quantity: 200, unit: 'g' },
        { name: 'Tahini', quantity: 2, unit: 'tbsp' }
      ],
      instructions: [
        'Toss sweet potatoes and chickpeas with oil and spices, roast at 200°C for 25 minutes.',
        'Assemble the bowl with a base of quinoa.',
        'Arrange roasted sweet potatoes, chickpeas, and sliced avocado on top.',
        'Whisk tahini with lemon juice and water, then drizzle over the bowl.'
      ],
      tags: ['Vegan', 'Healthy', 'Bowl'],
      cookTime: 35,
      difficulty: 'Easy',
      nutritionalInfo: { calories: 480, protein: 14, carbs: 62, fats: 20 },
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
      author: jane._id,
      ratings: [{ user: alice._id, value: 5 }],
      comments: [
        { user: alice._id, text: 'Very filling and the tahini dressing is awesome!', createdAt: new Date() }
      ]
    },
    {
      title: 'Classic French Onion Soup',
      description: 'Deeply caramelized onions simmered in rich beef broth, topped with a toasted baguette slice and bubbling Gruyere cheese.',
      ingredients: [
        { name: 'Yellow Onions (sliced)', quantity: 1, unit: 'kg' },
        { name: 'Beef Broth', quantity: 1, unit: 'L' },
        { name: 'Gruyere Cheese', quantity: 100, unit: 'g' },
        { name: 'Baguette slices', quantity: 4, unit: 'pcs' },
        { name: 'Butter', quantity: 30, unit: 'g' }
      ],
      instructions: [
        'Melt butter and cook onions on low heat for 45 minutes until deep golden brown and sweet.',
        'Add garlic, flour, beef broth, and thyme. Simmer for 20 minutes.',
        'Ladle soup into oven-safe bowls, place a toasted baguette slice on top, and cover with Gruyere.',
        'Broil in the oven for 3-4 minutes until cheese is melted and brown.'
      ],
      tags: ['French', 'Soup', 'Onion'],
      cookTime: 75,
      difficulty: 'Medium',
      nutritionalInfo: { calories: 380, protein: 18, carbs: 26, fats: 22 },
      image: 'https://images.unsplash.com/photo-1620418029653-8d0cfed7755a?w=800',
      author: chef._id,
      ratings: [{ user: dan._id, value: 4 }],
      comments: []
    },
    {
      title: 'Homemade California Sushi Rolls',
      description: 'Learn to make sushi at home! Classic rolls filled with imitation crab, cucumber, and creamy avocado wrapped in nori and seasoned rice.',
      ingredients: [
        { name: 'Sushi Rice (cooked)', quantity: 2, unit: 'cups' },
        { name: 'Nori Sheets', quantity: 4, unit: 'pcs' },
        { name: 'Imitation Crab', quantity: 150, unit: 'g' },
        { name: 'Avocado', quantity: 1, unit: 'pc' },
        { name: 'Cucumber', quantity: 1, unit: 'pc' }
      ],
      instructions: [
        'Cover a bamboo sushi mat with plastic wrap.',
        'Place a sheet of nori on the mat, and spread sushi rice evenly over it.',
        'Flip nori so rice is facing down. Lay strips of crab, avocado, and cucumber across.',
        'Roll tightly using the mat. Cut into 8 pieces with a wet, sharp knife.'
      ],
      tags: ['Asian', 'Sushi', 'Seafood'],
      cookTime: 45,
      difficulty: 'Hard',
      nutritionalInfo: { calories: 310, protein: 9, carbs: 54, fats: 7 },
      image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
      author: chef._id,
      ratings: [{ user: bob._id, value: 5 }],
      comments: []
    },
    {
      title: 'Creamy Beef Stroganoff',
      description: 'Tender strips of beef and sliced mushrooms sautéed and simmered in a rich sour cream sauce, served over hot egg noodles.',
      ingredients: [
        { name: 'Beef Sirloin (sliced)', quantity: 500, unit: 'g' },
        { name: 'Mushrooms (sliced)', quantity: 200, unit: 'g' },
        { name: 'Sour Cream', quantity: 150, unit: 'g' },
        { name: 'Beef Broth', quantity: 200, unit: 'ml' },
        { name: 'Egg Noodles (cooked)', quantity: 300, unit: 'g' }
      ],
      instructions: [
        'Sear sliced beef in a hot skillet with oil until browned, then remove.',
        'Sauté mushrooms and onions in the same skillet until soft.',
        'Pour in beef broth and simmer. Lower heat and stir in sour cream and beef.',
        'Serve hot sauce over a bed of egg noodles.'
      ],
      tags: ['Beef', 'Pasta', 'Creamy'],
      cookTime: 30,
      difficulty: 'Medium',
      nutritionalInfo: { calories: 620, protein: 38, carbs: 45, fats: 32 },
      image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800',
      author: dan._id,
      ratings: [{ user: jane._id, value: 4 }],
      comments: []
    },
    {
      title: 'Rustic Margherita Pizza',
      description: 'An authentic Italian pizza with a crispy crust, simple tomato sauce, fresh mozzarella, and fresh basil leaves.',
      ingredients: [
        { name: 'Pizza Dough', quantity: 1, unit: 'ball' },
        { name: 'Crushed Tomatoes', quantity: 150, unit: 'g' },
        { name: 'Fresh Mozzarella', quantity: 120, unit: 'g' },
        { name: 'Fresh Basil', quantity: 8, unit: 'leaves' }
      ],
      instructions: [
        'Preheat oven to 250°C (preferably with a pizza stone inside).',
        'Stretch pizza dough into a circular shape on baking paper.',
        'Spread tomato sauce, leave a border. Arrange mozzarella chunks.',
        'Bake for 8-10 minutes until crust is charred and cheese is bubbly. Top with basil and olive oil.'
      ],
      tags: ['Italian', 'Pizza', 'Vegetarian'],
      cookTime: 25,
      difficulty: 'Medium',
      nutritionalInfo: { calories: 510, protein: 21, carbs: 68, fats: 16 },
      image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800',
      author: chef._id,
      ratings: [{ user: bob._id, value: 5 }, { user: jane._id, value: 4 }],
      comments: [
        { user: bob._id, text: 'Simple ingredients make the best dishes. A classic!', createdAt: new Date() }
      ]
    },
    {
      title: 'Fluffy Buttermilk Pancakes',
      description: 'Golden, thick, and fluffy buttermilk pancakes. Top with butter and maple syrup for the perfect Sunday breakfast.',
      ingredients: [
        { name: 'Flour', quantity: 200, unit: 'g' },
        { name: 'Buttermilk', quantity: 300, unit: 'ml' },
        { name: 'Egg', quantity: 1, unit: 'pc' },
        { name: 'Butter (melted)', quantity: 30, unit: 'g' },
        { name: 'Baking Powder', quantity: 2, unit: 'tsp' }
      ],
      instructions: [
        'Whisk flour, sugar, baking powder, and a pinch of salt in a bowl.',
        'In another bowl, whisk egg, buttermilk, and melted butter.',
        'Pour wet ingredients into dry ingredients and fold gently (leave lumps).',
        'Cook on a hot greased griddle until bubbles form, then flip and cook until golden.'
      ],
      tags: ['Quick', 'Breakfast', 'Sweet'],
      cookTime: 15,
      difficulty: 'Easy',
      nutritionalInfo: { calories: 340, protein: 8, carbs: 48, fats: 12 },
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
      author: bob._id,
      ratings: [{ user: jane._id, value: 5 }],
      comments: []
    },
    {
      title: 'Keto Baked Salmon',
      description: 'Fresh salmon fillets baked with a garlic-herb butter crust, served alongside roasted asparagus. High fat, moderate protein, zero carb.',
      ingredients: [
        { name: 'Salmon Fillets', quantity: 2, unit: 'pcs' },
        { name: 'Asparagus Bunch', quantity: 1, unit: 'pc' },
        { name: 'Butter', quantity: 40, unit: 'g' },
        { name: 'Garlic (minced)', quantity: 2, unit: 'clo' }
      ],
      instructions: [
        'Arrange salmon and trimmed asparagus on a baking sheet.',
        'Mix melted butter, garlic, lemon juice, and dill, then brush over salmon and asparagus.',
        'Bake at 200°C for 12-15 minutes until salmon flakes easily with a fork.',
        'Squeeze fresh lemon juice on top before serving.'
      ],
      tags: ['Keto', 'Seafood', 'Healthy', 'Quick'],
      cookTime: 20,
      difficulty: 'Easy',
      nutritionalInfo: { calories: 480, protein: 34, carbs: 4, fats: 36 },
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',
      author: dan._id,
      ratings: [{ user: chef._id, value: 5 }],
      comments: []
    },
    {
      title: 'Royal Chicken Biryani',
      description: 'Fragrant long-grain basmati rice layered with spiced marinated chicken, caramelized onions, saffron, and fresh mint, steamed together.',
      ingredients: [
        { name: 'Basmati Rice', quantity: 400, unit: 'g' },
        { name: 'Chicken (bone-in)', quantity: 600, unit: 'g' },
        { name: 'Onions (sliced)', quantity: 3, unit: 'pcs' },
        { name: 'Yogurt', quantity: 150, unit: 'g' },
        { name: 'Saffron threads', quantity: 1, unit: 'pinch' }
      ],
      instructions: [
        'Marinate chicken in yogurt, ginger-garlic paste, chili powder, and biryani spices for 2 hours.',
        'Parboil basmati rice with whole spices until 70% cooked.',
        'In a heavy pot, layer cooked chicken base, then fried onions, mint, and parboiled rice.',
        'Drizzle saffron milk on top, seal pot with foil or dough, and steam on very low heat (Dum) for 30 minutes.'
      ],
      tags: ['Indian', 'Rice', 'Spicy'],
      cookTime: 75,
      difficulty: 'Hard',
      nutritionalInfo: { calories: 720, protein: 32, carbs: 88, fats: 25 },
      image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800',
      author: alice._id,
      ratings: [{ user: chef._id, value: 5 }, { user: dan._id, value: 5 }],
      comments: [
        { user: chef._id, text: 'The layers were beautifully cooked. Excellent aromatics!', createdAt: new Date() }
      ]
    },
    {
      title: 'Classic New York Cheesecake',
      description: 'A rich and creamy baked cheesecake with a buttery graham cracker crust, topped with sweet strawberry compote.',
      ingredients: [
        { name: 'Cream Cheese', quantity: 600, unit: 'g' },
        { name: 'Sugar', quantity: 150, unit: 'g' },
        { name: 'Graham Crackers', quantity: 150, unit: 'g' },
        { name: 'Eggs', quantity: 3, unit: 'pcs' },
        { name: 'Strawberries', quantity: 200, unit: 'g' }
      ],
      instructions: [
        'Crush graham crackers and mix with melted butter. Press into springform pan and bake for 8 mins.',
        'Beat cream cheese and sugar until smooth. Add eggs one at a time, then fold in sour cream.',
        'Pour filling into crust. Place pan in a water bath and bake at 160°C for 60-70 minutes.',
        'Cool slowly, then refrigerate overnight. Top with strawberry compote.'
      ],
      tags: ['Dessert', 'Baking', 'Sweet'],
      cookTime: 90,
      difficulty: 'Hard',
      nutritionalInfo: { calories: 540, protein: 8, carbs: 48, fats: 35 },
      image: 'https://images.unsplash.com/photo-1524351199679-46cddf530c04?w=800',
      author: bob._id,
      ratings: [{ user: jane._id, value: 5 }],
      comments: []
    },
    {
      title: 'Lemon Quinoa Salad',
      description: 'A refreshing salad of fluffy quinoa, cherry tomatoes, cucumbers, kalamata olives, and feta cheese dressed in a simple lemon vinaigrette.',
      ingredients: [
        { name: 'Quinoa', quantity: 150, unit: 'g' },
        { name: 'Cucumber (diced)', quantity: 1, unit: 'pc' },
        { name: 'Cherry Tomatoes', quantity: 150, unit: 'g' },
        { name: 'Feta Cheese', quantity: 100, unit: 'g' }
      ],
      instructions: [
        'Cook quinoa and let it cool completely.',
        'In a large bowl, combine quinoa, diced cucumber, halved cherry tomatoes, and crumbled feta.',
        'Whisk lemon juice, olive oil, dried oregano, salt, and pepper.',
        'Pour dressing over salad, toss to combine, and chill before serving.'
      ],
      tags: ['Vegan', 'Healthy', 'Salad', 'Quick'],
      cookTime: 15,
      difficulty: 'Easy',
      nutritionalInfo: { calories: 310, protein: 10, carbs: 38, fats: 14 },
      image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800',
      author: jane._id,
      ratings: [{ user: alice._id, value: 4 }],
      comments: []
    },
    {
      title: 'Tonkotsu Pork Ramen',
      description: 'A labor of love! Rich and creamy 12-hour pork bone broth, springy ramen noodles, tender chashu pork belly, and a soft-boiled marinated egg.',
      ingredients: [
        { name: 'Pork Bones', quantity: 1.5, unit: 'kg' },
        { name: 'Pork Belly (Chashu)', quantity: 500, unit: 'g' },
        { name: 'Ramen Noodles', quantity: 4, unit: 'serv' },
        { name: 'Ramen Eggs (marinated)', quantity: 4, unit: 'pcs' }
      ],
      instructions: [
        'Boil and wash pork bones. Simmer on rolling boil for 12 hours to extract collagen and create white broth.',
        'Braise pork belly in soy sauce, mirin, sake, sugar, and aromatics.',
        'Prepare dashi and tare seasoning bases.',
        'Assemble bowls: add tare, hot broth, cooked ramen noodles, and top with sliced chashu, halved egg, and scallions.'
      ],
      tags: ['Asian', 'Ramen', 'Pork'],
      cookTime: 180,
      difficulty: 'Hard',
      nutritionalInfo: { calories: 850, protein: 42, carbs: 75, fats: 40 },
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
      author: chef._id,
      ratings: [{ user: dan._id, value: 5 }, { user: alice._id, value: 5 }],
      comments: [
        { user: dan._id, text: 'Spectacular broth. Takes forever but absolutely worth it!', createdAt: new Date() }
      ]
    },
    {
      title: 'Zesty Guacamole & Tortilla Chips',
      description: 'The absolute best guacamole, made with ripe Hass avocados, lime juice, fresh cilantro, diced jalapeño, and red onion. Served with salty corn chips.',
      ingredients: [
        { name: 'Avocados', quantity: 3, unit: 'pcs' },
        { name: 'Lime (juiced)', quantity: 1, unit: 'pc' },
        { name: 'Red Onion (finely diced)', quantity: 0.25, unit: 'cup' },
        { name: 'Cilantro (chopped)', quantity: 3, unit: 'tbsp' },
        { name: 'Tortilla Chips', quantity: 1, unit: 'bag' }
      ],
      instructions: [
        'Cut avocados, remove pits, and scoop flesh into a mixing bowl.',
        'Mash avocados with a fork, leaving some chunks for texture.',
        'Stir in lime juice, salt, diced onion, jalapeño, and cilantro.',
        'Serve immediately with crunchy tortilla chips.'
      ],
      tags: ['Mexican', 'Appetizer', 'Vegan', 'Quick'],
      cookTime: 10,
      difficulty: 'Easy',
      nutritionalInfo: { calories: 290, protein: 4, carbs: 28, fats: 19 },
      image: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=800',
      author: jane._id,
      ratings: [{ user: dan._id, value: 5 }],
      comments: []
    },
    {
      title: 'Gourmet Beef Burger',
      description: 'A thick, juicy beef patty grilled to medium, topped with melted cheddar, crispy bacon, caramelized onions, and signature burger sauce.',
      ingredients: [
        { name: 'Ground Beef (80/20)', quantity: 400, unit: 'g' },
        { name: 'Burger Buns (Brioche)', quantity: 2, unit: 'pcs' },
        { name: 'Cheddar Cheese slices', quantity: 2, unit: 'pcs' },
        { name: 'Bacon strips', quantity: 4, unit: 'pcs' }
      ],
      instructions: [
        'Form ground beef into two thick patties, season with salt and pepper.',
        'Grill patties or pan-sear in a hot skillet for 4 minutes per side. Place cheese on top during last minute to melt.',
        'Cook bacon until crispy, and toast brioche buns in bacon fat.',
        'Assemble: bun bottom, sauce, patty, bacon, caramelized onions, lettuce, and bun top.'
      ],
      tags: ['Beef', 'Burger', 'Grill', 'Quick'],
      cookTime: 20,
      difficulty: 'Easy',
      nutritionalInfo: { calories: 680, protein: 40, carbs: 36, fats: 42 },
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
      author: dan._id,
      ratings: [{ user: bob._id, value: 5 }],
      comments: []
    },
    {
      title: 'Chicken Tikka Masala',
      description: 'Grilled marinated chicken pieces (tikka) cooked in a silky, spiced creamy tomato curry sauce. An iconic, flavorful dish.',
      ingredients: [
        { name: 'Chicken Thighs (cubed)', quantity: 600, unit: 'g' },
        { name: 'Yogurt', quantity: 150, unit: 'g' },
        { name: 'Tomato Sauce', quantity: 400, unit: 'g' },
        { name: 'Garam Masala', quantity: 2, unit: 'tsp' },
        { name: 'Heavy Cream', quantity: 100, unit: 'ml' }
      ],
      instructions: [
        'Marinate chicken in yogurt and tikka spices, then skewer and broil/grill until charred.',
        'Sauté onions, ginger, and garlic in a pot, adding spices and tomato sauce.',
        'Simmer sauce for 15 minutes, then blend until smooth.',
        'Stir in heavy cream and grilled chicken. Simmer for another 5 minutes and serve.'
      ],
      tags: ['Indian', 'Chicken', 'Curry'],
      cookTime: 45,
      difficulty: 'Medium',
      nutritionalInfo: { calories: 510, protein: 32, carbs: 14, fats: 36 },
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800',
      author: alice._id,
      ratings: [{ user: jane._id, value: 5 }],
      comments: []
    },
    {
      title: 'Classic Caesar Salad',
      description: 'Crisp romaine lettuce, buttery garlic croutons, and shredded Parmesan tossed in a creamy, savory homemade anchovy dressing.',
      ingredients: [
        { name: 'Romaine Lettuce Head', quantity: 1, unit: 'pc' },
        { name: 'Croutons', quantity: 1, unit: 'cup' },
        { name: 'Parmesan Cheese (grated)', quantity: 50, unit: 'g' },
        { name: 'Caesar Dressing', quantity: 4, unit: 'tbsp' }
      ],
      instructions: [
        'Wash, dry, and tear romaine lettuce into bite-sized pieces.',
        'In a large salad bowl, combine lettuce, half of the parmesan, and croutons.',
        'Drizzle Caesar dressing over the ingredients.',
        'Toss well. Top with remaining Parmesan and cracked black pepper.'
      ],
      tags: ['Italian', 'Salad', 'Quick'],
      cookTime: 15,
      difficulty: 'Easy',
      nutritionalInfo: { calories: 280, protein: 6, carbs: 12, fats: 24 },
      image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800',
      author: jane._id,
      ratings: [{ user: chef._id, value: 4 }],
      comments: []
    },
    {
      title: 'Fudge Chocolate Brownies',
      description: 'Fudgy, dense chocolate brownies with a crackly top paper layer and rich, chocolate-burst center. Serve warm with vanilla ice cream.',
      ingredients: [
        { name: 'Butter', quantity: 115, unit: 'g' },
        { name: 'Sugar', quantity: 200, unit: 'g' },
        { name: 'Cocoa Powder', quantity: 60, unit: 'g' },
        { name: 'Eggs', quantity: 2, unit: 'pcs' },
        { name: 'Flour', quantity: 60, unit: 'g' }
      ],
      instructions: [
        'Melt butter in a saucepan, stir in sugar and cocoa powder until combined.',
        'Whisk in eggs one at a time, followed by vanilla extract.',
        'Gently fold in flour until just combined (do not overmix).',
        'Pour into an 8x8 inch baking pan and bake at 160°C for 20-22 minutes.'
      ],
      tags: ['Dessert', 'Sweet', 'Baking'],
      cookTime: 30,
      difficulty: 'Easy',
      nutritionalInfo: { calories: 240, protein: 3, carbs: 32, fats: 12 },
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800',
      author: bob._id,
      ratings: [{ user: chef._id, value: 5 }, { user: jane._id, value: 5 }],
      comments: [
        { user: chef._id, text: 'Excellent texture, super fudgy center.', createdAt: new Date() }
      ]
    },
    {
      title: 'Creamy Mushroom Risotto',
      description: 'A classic Italian rice dish slowly cooked with arborio rice, assorted sautéed mushrooms, white wine, warm broth, and finished with butter and Parmesan.',
      ingredients: [
        { name: 'Arborio Rice', quantity: 300, unit: 'g' },
        { name: 'Mixed Mushrooms (sliced)', quantity: 250, unit: 'g' },
        { name: 'Vegetable Broth', quantity: 1, unit: 'L' },
        { name: 'White Wine (dry)', quantity: 120, unit: 'ml' },
        { name: 'Parmesan Cheese', quantity: 50, unit: 'g' }
      ],
      instructions: [
        'Sauté mushrooms in olive oil with garlic until golden, then set half aside for garnish.',
        'Toast arborio rice in a pan with butter and onions. Deglaze with white wine.',
        'Add warm broth one ladle at a time, stirring constantly, letting the rice absorb the liquid before adding more.',
        'After 20 minutes (rice should be creamy but al dente), stir in mushrooms, butter, and cheese.'
      ],
      tags: ['Italian', 'Rice', 'Vegetarian'],
      cookTime: 40,
      difficulty: 'Medium',
      nutritionalInfo: { calories: 460, protein: 12, carbs: 64, fats: 14 },
      image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800',
      author: chef._id,
      ratings: [{ user: alice._id, value: 5 }, { user: jane._id, value: 4 }],
      comments: [
        { user: alice._id, text: 'Perfect cooking consistency. Risotto is hard but this guide made it clear.', createdAt: new Date() }
      ]
    }
  ];
};

const seedDB = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/recipebox');
    console.log('Connected!');

    // Clear existing data
    console.log('Clearing old collections...');
    await User.deleteMany({});
    await Recipe.deleteMany({});
    await Cookbook.deleteMany({});
    await MealPlanner.deleteMany({});
    console.log('Collections cleared.');

    // Encrypt and create users
    console.log('Hashing passwords and creating users...');
    const users = [];
    for (const u of usersData) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(u.password, salt);
      const newUser = new User({
        ...u,
        password: hashedPassword
      });
      await newUser.save();
      users.push(newUser);
    }
    console.log(`Created ${users.length} users.`);

    // Set up followers / following connections
    // chef_chef = users[0], foodie_jane = users[1], gourmet_dan = users[2], baker_bob = users[3], spicy_alice = users[4]
    console.log('Linking social relationships...');
    
    // Jane follows Chef & Alice
    users[1].following.push(users[0]._id, users[4]._id);
    users[0].followers.push(users[1]._id);
    users[4].followers.push(users[1]._id);

    // Dan follows Chef & Bob
    users[2].following.push(users[0]._id, users[3]._id);
    users[0].followers.push(users[2]._id);
    users[3].followers.push(users[2]._id);

    // Bob follows Dan & Jane
    users[3].following.push(users[2]._id, users[1]._id);
    users[2].followers.push(users[3]._id);
    users[1].followers.push(users[3]._id);

    // Alice follows Chef
    users[4].following.push(users[0]._id);
    users[0].followers.push(users[4]._id);

    // Save relationship updates
    for (const u of users) {
      await u.save();
    }
    console.log('Social linkages completed.');

    // Insert recipes
    console.log('Creating recipes...');
    const recipesData = getRecipesData(users);
    const recipes = [];
    for (const r of recipesData) {
      const recipe = new Recipe(r);
      recipe.updateAverageRating(); // calculate average
      await recipe.save();
      recipes.push(recipe);
    }
    console.log(`Inserted ${recipes.length} recipes.`);

    // Seed some cookbooks
    console.log('Creating default cookbooks...');
    const janeCookbook = new Cookbook({
      name: 'Sunday Brunch Ideas',
      user: users[1]._id,
      recipes: [recipes[13]._id, recipes[7]._id] // pancakes, chocolate cookies
    });
    await janeCookbook.save();

    const danCookbook = new Cookbook({
      name: 'Keto Healthy Meals',
      user: users[2]._id,
      recipes: [recipes[6]._id, recipes[14]._id] // ribeye, salmon
    });
    await danCookbook.save();

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
