import { Router } from "express";

import {searchHotels} from "../controllers/searchController.js";
import {searchFlights} from "../controllers/searchController.js";


const router = Router();

router.get("/hotels", searchHotels);
router.get("/flights", searchFlights);

export default router;

