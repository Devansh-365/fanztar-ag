import express from "express";

import orders from "./order.route";

const router = express.Router();

export default (): express.Router => {
  orders(router);

  return router;
};
