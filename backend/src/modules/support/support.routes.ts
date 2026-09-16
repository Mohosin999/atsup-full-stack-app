import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth";
import { createTicket, getMyTicketsController } from "./support.controller";

const router = Router();

router.use(authenticate);

router.post("/", createTicket);
router.get("/mine", getMyTicketsController);

export default router;