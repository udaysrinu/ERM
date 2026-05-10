import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "../_lib/cors.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!/^[^@\s]+@gmail\.com$/i.test(email)) {
    return res.status(401).json({ error: "Use a Gmail address to enter this demo." });
  }
  if (!password.trim()) {
    return res.status(401).json({ error: "Enter any password to continue." });
  }

  return res.json({ success: true, email });
}
