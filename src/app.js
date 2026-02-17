import express from "express";
import searchRoutes from "./routes/searchRoutes.js";
import { searchFlights } from "./controllers/searchController.js";
const app = express();

app.use(express.json());
app.get("/health", (_, res) => res.json({ ok: true }));
app.use("/search", searchRoutes);


export default app;