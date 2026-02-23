import { Router } from "express";
import authRoutes from "./auth.route.js";
import commonRoutes from "./common.route.js";
import visitorRoutes from "./visitor.route.js";

const routers = Router();

routers.use("/auth", authRoutes);
routers.use("/shared", commonRoutes);
routers.use("/visitor", visitorRoutes);

export default routers;
