import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getHotels, getHotelByID } from "@/controllers";

const hotelsRouter = Router();

hotelsRouter
  .all("/*", authenticateToken)
  .get("/", getHotels)
  .get("/:hotelId", getHotelByID);

export { hotelsRouter };
