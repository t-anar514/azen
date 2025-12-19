# Azen Backend Guide: Source of Truth

This document serves as the architectural blueprint for building the Azen backend API. All technical decisions here are derived from the existing Next.js frontend requirements and state management patterns.

---

## 1. Tech Stack Recommendation: "The Startup Pro Stack"

We recommend **Node.js (Express)** with **Mongoose** (ODM) and **MongoDB Atlas** (Cloud Database).

### Connection String (MongoDB Atlas)
> `mongodb+srv://admin:LtU59IHBHyjy90nN@azen.pgfakha.mongodb.net/`

### Why Express + MongoDB?
*   **JSON Native**: MongoDB stores data in BSON (binary JSON), which perfectly matches the JSON structures already defined in the Azen frontend (`guides.json`, `hacks.json`, etc.).
*   **Flexible Schema**: As a travel platform, itinerary structures can evolve quickly. MongoDB allows for nested "ItineraryItems" within a single "Itinerary" document, reducing complex joins.
*   **High Performance**: MongoDB handles high read/write volume efficiently, ideal for real-time map syncing and collaborative planning.

---

## 2. Database Schema (NoSQL Collections)

Since we are using MongoDB, we will organize data into **Collections**.

### Collections Overview

#### `users`
*   `_id`: ObjectId
*   `email`: String (Unique)
*   `passwordHash`: String
*   `name`: String
*   `avatarUrl`: String
*   `createdAt`: Date

#### `cities`
*   `_id`: String (e.g., "tokyo")
*   `name`: String
*   `heroImage`: String
*   `teaser`: String
*   `introduction`: String
*   `gettingAround`: String
*   `vibe`: String
*   `districts`: Array<{ name: String, description: String }>
*   `history`: { text: String, imageUrl: String }
*   `culture`: { text: String, imageUrl: String }
*   `expenses`: { text: String, imageUrl: String }
*   `climate`: { text: String, imageUrl: String }

#### `experiences`
*   `_id`: String (e.g., "shibuya-bars")
*   `title`: String
*   `category`: String
*   `location`: String
*   `basePrice`: Number
*   `heroImage`: String
*   `gallery`: Array<String>
*   `duration`: String
*   `maxGroupSize`: Number
*   `languages`: Array<String>
*   `meetingPoint`: { lat: Number, lng: Number, name: String, description: String }
*   `guideId`: ObjectId (Reference to `guides` collection)
*   `description`: Array<String>
*   `includes`: Array<String>
*   `toBring`: Array<String>

#### `guides`
*   `_id`: ObjectId
*   `name`: String
*   `bio`: String
*   `image`: String
*   `videoUrl`: String
*   `isVerified`: Boolean
*   `price`: Number
*   `location`: String
*   `tags`: Array<String>

#### `itineraries`
*   `_id`: ObjectId
*   `userId`: ObjectId (Reference to `users`)
*   `title`: String
*   `totalCost`: Number
*   `items`: Array<{
        title: String,
        time: String,
        type: String, // flight, hotel, spot, transport, etc.
        location: String,
        cost: Number,
        orderIndex: Number
    }>
*   `createdAt`: Date

#### `hacks`
*   `_id`: String (e.g., "luggage-forwarding")
*   `title`: String
*   `category`: String
*   `summary`: String
*   `coverImage`: String
*   `steps`: Array<{ step: Number, title: String, text: String, img: String }>
*   `proTip`: String
*   `relatedIds`: Array<String>
*   `trapAlternative`: String (Optional)

---

## 3. API Documentation (RESTful)

### Auth & User
*   `POST /api/auth/signup`: Create account.
*   `POST /api/auth/login`: Authenticate and return JWT.

### Cities (Essentials)
*   `GET /api/cities`: Fetch all city cards.
*   `GET /api/cities/:id`: Fetch specific city details for the City Page.

### Itineraries (Planner)
*   `GET /api/itineraries`: Fetch user's trip plans.
*   `POST /api/itinerary`: Save a new trip (including the nested `items` array).
*   `PATCH /api/itinerary/:id`: Update title or individual item properties.
*   `PUT /api/itinerary/:id/items`: Replace the entire items array (used for reordering/Drag & Drop sync).

---

## 4. Business Logic Requirements

### 4.1 Real-time Cost Calculation
The server must validate the `totalCost` by summing up the `items` array before saving to the database.
*   **Mongoose Hook**: Use a `pre('save')` middleware in the Itinerary schema to auto-calculate `totalCost` based on the `items` array contents.

### 4.2 Geo-Spatial Data
*   **Storage**: Use MongoDB's `GeoJSON` format for meeting points if geo-spatial queries (e.g., "Find experiences near me") are required in the future.
*   **Current implementation**: Simple `{ lat, lng }` object is sufficient for the current frontend requirements.

---

## 5. Security & Auth

*   **JWT**: Standard JWT strategy for protecting private itineraries.
*   **Mongoose Validation**: Use strict schema validation to ensure activity types match the frontend's `ItemType` definitions.

---

## 6. Scalability: Image Management

*   **Cloudinary Integration**: Use the Cloudinary Node.js SDK to handle image uploads for user profile pictures or new experience submissions.
*   **Storage**: Only store the resulting Cloudinary URLs in the MongoDB documents.
