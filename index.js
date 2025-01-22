import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import carsRoutes from "./routes/cars.js";
import userRoutes from "./routes/user.js";
import reservationsRoutes from "./routes/reservations.js";
// import { connectToDb, PORT } from "./db.js";
import { fileURLToPath } from 'url';
import path from "path";
import mongoose from "mongoose";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Creating an instance of the express app
const app = express();
app.use(express.static(path.join(__dirname, "../", "public")));
app.use(cors());
// app.use(
//   cors({
//     origin: "https://car-rent-app-iota.vercel.app",
//   })
// );

// Middleware for parsing JSON requests
app.use(express.json());

// app.use((req, res, next) => {
//   console.log(req.path, req.method);
//   next();
// });

// Middleware for handling CORS headers
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", ["*"]);
//   res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type, authorization");
//   res.header("Access-Control-Allow-Credentials", "true");
//   if ("OPTIONS" === req.method) {
//     res.sendStatus(200);
//   } else {
//     next();
//   }
// });

// Setting up routes for different parts of the application
app.use("/api/cars", carsRoutes);
app.use("/api/user", userRoutes);
app.use("/api/reservations", reservationsRoutes);


mongoose.connect(process.env.URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('listening on port', process.env.PORT)
        })
    })
    .catch((err) => console.log(err));
// connectToDb()
//   .then(() => {
//     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//   })
//   .catch((err) => {
//     console.error("Failed to connect to the database", err);
//   });
