import { z } from "zod";
import { runSearch } from "../services/searchService.js";
import { runFlightSearch } from "../services/searchService.js";

const hotelschema = z.object({
  cityCode: z.string().length(3),
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.coerce.number().int().min(1).max(20).default(2)
});
const flightSchema = z.object({
  originLocationCode: z.string().length(3),       // ex: GRU
  destinationLocationCode: z.string().length(3),  // ex: GIG
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  adults: z.coerce.number().int().min(1).max(9).default(1),
});
export async function searchHotels(req, res) {
  try {
    const query = hotelschema.parse(req.query);
    const results = await runSearch(query);
    return res.json({ query, count: results.length, results });
  } catch (err) {
    // 👇 isso aqui vai te dizer exatamente qual campo falhou
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid query params",
        issues: err.issues
      });
    }

    console.error(err); // ajuda muito no debug no terminal
    return res.status(400).json({
      error: "Request failed",
      message: String(err?.message ?? err)
    });
  }
}
export async function searchFlights(req, res) {
  try {
    const query = flightSchema.parse(req.query);
    console.log("Flight search query:", query); // log do query para debug
    const results = await runFlightSearch(query);
    return res.json({query, count: results.length, results});

  } catch(err) {
    if (err instanceof z.ZodError){
      return res.status(400).json({
        error: "Invalid query params",
        issues: err.issues
      });
    }
    console.error(err);
    return res.status(400).json({
      error: "Request failed",
      message: String(err?.message ?? err)
    })
  }
 }

