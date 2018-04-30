import express from "express";

// route each API version
const router: express.Router = express.Router();
router.use("/v1", require("./v1").router);

export { router };
