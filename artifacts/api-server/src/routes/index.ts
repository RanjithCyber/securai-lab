import { Router, type IRouter } from "express";
import healthRouter from "./health";
import scansRouter from "./scans";
import metricsRouter from "./metrics";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(scansRouter);
router.use(metricsRouter);
router.use(dashboardRouter);

export default router;
