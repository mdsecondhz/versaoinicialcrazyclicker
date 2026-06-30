import { Router, type IRouter } from "express";
import healthRouter from "./health";
import gameRouter from "./game";
import chatRouter from "./chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(gameRouter);
router.use(chatRouter);

export default router;
