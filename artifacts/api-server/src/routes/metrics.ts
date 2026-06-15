import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, metricsTable } from "@workspace/db";
import {
  CreateMetricBody,
  DeleteMetricParams,
  ListMetricsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/metrics", async (_req, res): Promise<void> => {
  const metrics = await db
    .select()
    .from(metricsTable)
    .orderBy(metricsTable.date);

  res.json(ListMetricsResponse.parse(metrics));
});

router.post("/metrics", async (req, res): Promise<void> => {
  const parsed = CreateMetricBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [metric] = await db
    .insert(metricsTable)
    .values({
      date: parsed.data.date,
      category: parsed.data.category,
      challengesSolved: parsed.data.challengesSolved,
      difficulty: parsed.data.difficulty,
      notes: parsed.data.notes ?? "",
    })
    .returning();

  res.status(201).json(metric);
});

router.delete("/metrics/:id", async (req, res): Promise<void> => {
  const params = DeleteMetricParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [metric] = await db
    .delete(metricsTable)
    .where(eq(metricsTable.id, params.data.id))
    .returning();

  if (!metric) {
    res.status(404).json({ error: "Metric not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
