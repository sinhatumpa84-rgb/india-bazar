import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import addressesRouter from "./addresses";
import reviewsRouter from "./reviews";
import userRouter from "./user";
import scraperRouter from "./scraper";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(addressesRouter);
router.use(reviewsRouter);
router.use(userRouter);
router.use(scraperRouter);

export default router;
