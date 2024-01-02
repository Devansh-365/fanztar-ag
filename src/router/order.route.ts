import { createOrder } from "../controllers/orders.controller";
import express from "express";

export default (router: express.Router) => {
  router.post("/orders", createOrder);
};
