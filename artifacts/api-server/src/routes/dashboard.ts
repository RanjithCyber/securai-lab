import { Router, type IRouter } from "express";
import { db, scansTable, metricsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const scans = await db.select().from(scansTable);
  const metrics = await db.select().from(metricsTable);

  const totalScans = scans.length;
  const totalChallengesSolved = metrics.reduce(
    (sum, m) => sum + m.challengesSolved,
    0,
  );

  const criticalVulns = scans.filter((s) => s.severity === "critical").length;
  const highVulns = scans.filter((s) => s.severity === "high").length;
  const mediumVulns = scans.filter((s) => s.severity === "medium").length;
  const lowVulns = scans.filter((s) => s.severity === "low").length;
  const cleanScans = scans.filter((s) => s.severity === "none").length;

  let securityRating = 100;
  securityRating -= criticalVulns * 20;
  securityRating -= highVulns * 10;
  securityRating -= mediumVulns * 5;
  securityRating -= lowVulns * 2;
  if (totalScans > 0) {
    const cleanRatio = cleanScans / totalScans;
    securityRating = Math.max(0, Math.min(100, securityRating + cleanRatio * 10));
  }
  securityRating = Math.max(0, Math.round(securityRating));

  res.json({
    totalScans,
    totalChallengesSolved,
    securityRating,
    criticalVulns,
    highVulns,
    mediumVulns,
    lowVulns,
  });
});

router.get("/dashboard/chart-data", async (_req, res): Promise<void> => {
  const metrics = await db
    .select()
    .from(metricsTable)
    .orderBy(metricsTable.date);

  const progressMap = new Map<string, number>();
  for (const m of metrics) {
    const existing = progressMap.get(m.date) ?? 0;
    progressMap.set(m.date, existing + m.challengesSolved);
  }

  const progressOverTime = Array.from(progressMap.entries()).map(
    ([date, challengesSolved]) => ({ date, challengesSolved }),
  );

  const categoryMap = new Map<string, number>();
  for (const m of metrics) {
    const existing = categoryMap.get(m.category) ?? 0;
    categoryMap.set(m.category, existing + m.challengesSolved);
  }

  const categoryBreakdown = Array.from(categoryMap.entries()).map(
    ([category, count]) => ({ category, count }),
  );

  res.json({ progressOverTime, categoryBreakdown });
});

router.get("/dashboard/recent-activity", async (_req, res): Promise<void> => {
  const scans = await db
    .select()
    .from(scansTable)
    .orderBy(desc(scansTable.createdAt))
    .limit(3);

  const metrics = await db
    .select()
    .from(metricsTable)
    .orderBy(desc(metricsTable.date))
    .limit(3);

  const scanItems = scans.map((s) => ({
    id: `scan-${s.id}`,
    type: "scan" as const,
    title: `${s.language.toUpperCase()} Code Scan`,
    description: `${s.severity === "none" ? "No vulnerabilities found" : `${JSON.parse(s.vulnerabilitiesFound).length} vulnerabilities detected`}`,
    timestamp: s.createdAt.toISOString(),
    severity: s.severity,
  }));

  const metricItems = metrics.map((m) => ({
    id: `metric-${m.id}`,
    type: "metric" as const,
    title: `${m.category} — ${m.challengesSolved} challenge${m.challengesSolved !== 1 ? "s" : ""}`,
    description: `Difficulty: ${m.difficulty}${m.notes ? ` — ${m.notes.slice(0, 60)}` : ""}`,
    timestamp: new Date(m.date).toISOString(),
    severity: null,
  }));

  const allItems = [...scanItems, ...metricItems].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  res.json(allItems.slice(0, 5));
});

export default router;
