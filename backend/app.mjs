import express from 'express';
import cors from 'cors';
import { connectToDatabase, closeConnection } from './config/database.mjs';
import authRoutes from './routes/auth.mjs';
import locationRoutes from './routes/locations.mjs';

const app = express();
const PORT = process.env.PORT || 53840; // Support Google Cloud App Engine

// CORS configuration
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB on startup
async function startServer() {
  try {
    // Connect to database
    await connectToDatabase();

    // Routes
    app.get("/", (_req, res) => {
      res.send("Final Project API Server\nAvailable endpoints:\n- POST /auth\n- POST /register\n- GET /locations\n- POST /locations");
    });

    // Use route modules
    app.use(authRoutes);
    app.use(locationRoutes);

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await closeConnection();
  process.exit(0);
});

// Start the server
startServer();
