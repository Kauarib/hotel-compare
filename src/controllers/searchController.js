import { z } from "zod";
import { runSearch } from "../services/searchService.js";

const schema = z.object({
  cityCode: z.string().length(3),
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.coerce.number().int().min(1).max(20).default(2)
});

export async function searchHotels(req, res) {
  try {
    const query = schema.parse(req.query);
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

