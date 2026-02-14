import { Router } from "express";

import {searchHotels} from "../controllers/searchController.js";

const router = Router();

router.get("/", searchHotels);

export default router;

