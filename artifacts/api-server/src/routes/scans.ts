import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, scansTable } from "@workspace/db";
import {
  CreateScanBody,
  GetScanParams,
  DeleteScanParams,
  ListScansResponse,
  GetScanResponse,
} from "@workspace/api-zod";
import { analyzeCode } from "../lib/scanner";

const router: IRouter = Router();

router.get("/scans", async (req, res): Promise<void> => {
  const scans = await db
    .select()
    .from(scansTable)
    .orderBy(scansTable.createdAt);

  const mapped = scans.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    vulnerabilitiesFound: JSON.parse(s.vulnerabilitiesFound),
  }));

  res.json(ListScansResponse.parse(mapped));
});

router.post("/scans", async (req, res): Promise<void> => {
  const parsed = CreateScanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { codeInput, language } = parsed.data;
  const result = analyzeCode(codeInput, language);

  const [scan] = await db
    .insert(scansTable)
    .values({
      codeInput,
      language,
      severity: result.severity,
      vulnerabilitiesFound: JSON.stringify(result.vulnerabilitiesFound),
      remediation: result.remediation,
    })
    .returning();

  res.status(201).json(
    GetScanResponse.parse({
      ...scan,
      createdAt: scan.createdAt.toISOString(),
      vulnerabilitiesFound: result.vulnerabilitiesFound,
    }),
  );
});

router.get("/scans/:id", async (req, res): Promise<void> => {
  const params = GetScanParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [scan] = await db
    .select()
    .from(scansTable)
    .where(eq(scansTable.id, params.data.id));

  if (!scan) {
    res.status(404).json({ error: "Scan not found" });
    return;
  }

  res.json(
    GetScanResponse.parse({
      ...scan,
      createdAt: scan.createdAt.toISOString(),
      vulnerabilitiesFound: JSON.parse(scan.vulnerabilitiesFound),
    }),
  );
});

router.delete("/scans/:id", async (req, res): Promise<void> => {
  const params = DeleteScanParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [scan] = await db
    .delete(scansTable)
    .where(eq(scansTable.id, params.data.id))
    .returning();

  if (!scan) {
    res.status(404).json({ error: "Scan not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
