const express = require("express");
const error = require("../../../error");
const { Event, Secret } = require("../../../db");

const router = express.Router();

router.route("/").post((req, res, next) => {
  if (!req.body.password || req.body.password.length < 1)
    return next(new error.BadRequest("Password must be provided"));

  // password verification
  Secret.findbyName("one-click").then((secret) => {
    return secret.verifyPassword(req.body.password).then((verified) => {
      if (!verified) throw new error.UserError("Invalid password");

      if (!req.body.event) return next(new error.BadRequest());
      if (
        req.body.event.startDate &&
        req.body.event.endDate &&
        new Date(req.body.event.startDate) > new Date(req.body.event.endDate)
      )
        return next(new error.BadRequest("Start date must be before end date"));

      Event.create(Event.sanitize(req.body.event))
        .then((event) => {
          res.json({ error: null, event: event.getPublic() });
        })
        .catch(next);
    });
  });
});

module.exports = { router };
