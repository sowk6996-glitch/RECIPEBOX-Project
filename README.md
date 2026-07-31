# RecipeBox – A Collaborative Recipe Sharing Platform

Welcome to **RecipeBox**, a modern community-driven recipe sharing platform built like "Instagram for Foodies". Users can explore mouth-watering recipes, follow creative chefs, compile digital cookbooks, and schedule meals using our drag-and-drop weekly planner.

---

## Tech Stack

### Frontend
- **React (Vite)** – High-performance SPA scaffolding.
- **Tailwind CSS** – Styling with custom culinary palettes and dark mode switchers.
- **React Router Dom** – Dynamic browser routing and route guarding.
- **React Dropzone** – Smooth file drag & drop upload interface.
- **React Icons** – Modern iconography.
- **Axios** – Promise-based API requests with automatic JWT interceptors.

### Backend
- **Node.js & Express.js** – Structured API routing and controllers.
- **JWT (JsonWebToken)** – State-free session authentication.
- **bcryptjs** – Secure hashing for user passwords.
- **Multer** – Form data parsing for profile and recipe uploads.
- **Cloudinary** – Automated image optimization and storage (falls back to local filesystem if credentials aren't provided).

### Database
- **MongoDB** (Mongoose ODM) – Scalable Schemas for users, recipes, collections, and schedules.

---

## Folder Structure

```text
RecipeBox/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── config/      # DB & Cloudinary clients
│   │   ├── controllers/ # Route handlers
│   │   ├── middleware/  # JWT protect & upload hooks
│   │   ├── models/      # Mongoose Schemas
│   │   ├── routes/      # Endpoint routers
│   │   ├── scripts/     # Seeding scripts
│   │   └── server.js    # Entry file
│   └── package.json
└── frontend/         # Vite + React Client
    ├── src/
    │   ├── components/  # Navbars, cards, comments, skeletons
    │   ├── context/     # Auth & Toast global states
    │   ├── pages/       # Login, Register, Home, Explorer, Feed, Planner...
    │   ├── services/    # Axios instance
    │   ├── index.css    # Global Tailwind styles
    │   └── main.jsx
    └── package.json
```

---

## Environment Variables Setup

### Backend Environment Configuration
Create a `.env` file in the `backend/` directory using `backend/.env.example` as a template:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/recipebox
JWT_SECRET=your_jwt_secret_here

# Cloudinary Config (Optional: If empty, uploads fall back to local disk storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend Environment Configuration
By default, the frontend connects to `http://localhost:5000/api`. If your backend runs on a different port or host, create a `.env` in the `frontend/` directory:

```env
VITE_API_URL=https://your-backend-api.com/api
```

---

## Setup & Running Locally

### Prerequisites
- Node.js installed (v16+)
- Local MongoDB instance running, or a MongoDB Atlas URI.

### 1. Bootstrapping the Backend
Open a terminal in the `backend/` folder:
```bash
# Install dependencies
npm install

# Seed the database (Creates 5 users, follow relations, 25 recipes, and reviews)
npm run seed

# Run the backend in development hot-reload mode
npm run dev
```

### 2. Bootstrapping the Frontend
Open a new terminal in the `frontend/` folder:
```bash
# Install dependencies
npm install --legacy-peer-deps

# Run the React development server
npm run dev
```

Visit the application in your browser at `http://localhost:5173`.

---

## API Endpoints Documentation

### 1. Authentication
- `POST /api/auth/register` – Registers a new user. Expects `multipart/form-data` with `username`, `email`, `password`, `bio`, and optional `profileImage` file.
- `POST /api/auth/login` – Log in. Returns a JWT token and user profile stats.
- `GET /api/auth/profile` – Fetches current logged-in user profile details (protected).
- `PUT /api/auth/profile` – Updates user bio and avatar (protected).

### 2. Recipes
- `GET /api/recipes` – Fetches all recipes (paginated).
- `GET /api/recipes/:id` – Fetches details of a single recipe (populates author, ratings, comments).
- `POST /api/recipes` – Creates a new recipe (protected). Expects `multipart/form-data` with `title`, `description`, `cookTime`, `difficulty`, stringified arrays of `ingredients`, `instructions`, `tags`, and optional `image` file.
- `PUT /api/recipes/:id` – Updates recipe details (protected, owner check).
- `DELETE /api/recipes/:id` – Removes recipe (protected, owner check).

### 3. Recipes Search (Aggregation Pipeline)
- `GET /api/recipes/search` – Advanced filters.
  - Query params: `title`, `ingredient` (comma separated), `exclude` (comma-separated exclusions), `tags` (comma separated), `difficulty`, `time` (max mins), `rating` (min average).
  - *Example query:* `/api/recipes/search?ingredient=chicken,rice&exclude=onion&time=30&difficulty=Easy`

### 4. Comments & Ratings
- `POST /api/recipes/:id/comment` – Submits a text comment (protected).
- `DELETE /api/recipes/:id/comment/:commentId` – Removes comment (protected, comment owner or recipe author check).
- `POST /api/recipes/:id/rating` – Rate recipe 1-5 stars (protected, updates existing rating, updates `averageRating`).

### 5. Social & Feed
- `POST /api/users/follow/:id` – Follows another user. Updates both profiles (protected).
- `POST /api/users/unfollow/:id` – Unfollows another user (protected).
- `GET /api/feed` – Custom feed of recipes from followed users, sorted by latest first (protected).
- `GET /api/users/:id/profile` – Public profile lookup returning bio, follow counts, and authored recipes.

### 6. Cookbooks
- `POST /api/cookbooks` – Creates an empty cookbook collection (protected).
- `GET /api/cookbooks` – Fetches all cookbooks belonging to the logged-in user (protected).
- `POST /api/cookbooks/:id/add-recipe` – Adds a recipe to a cookbook (protected, ownership check).
- `POST /api/cookbooks/:id/remove-recipe` – Removes a recipe from a cookbook (protected, ownership check).
- `DELETE /api/cookbooks/:id` – Deletes a cookbook folder (protected).

### 7. Meal Planner
- `POST /api/planner` – Plans a recipe for a date (protected).
- `GET /api/planner` – Fetches planned meals (supports query range: `startDate` and `endDate`) (protected).
- `DELETE /api/planner/:id` – Removes a planned meal slot (protected).

---

## Testing Credentials
After running the seed script, you can log in as any of the following pre-seeded users using the password `password123`:

- **Chef Cook**: `chef@example.com`
- **Jane Foodie**: `jane@example.com`
- **Dan Gourmet**: `dan@example.com`
- **Bob Baker**: `bob@example.com`
- **Alice Spicy**: `alice@example.com`
