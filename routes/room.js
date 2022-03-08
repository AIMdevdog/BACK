const express = require("express");
const router = express.Router();

//DB 정보
const { Aim_user_room } = require("../models");
const authUser = require("./middlewares/authUser");

router.get("/", authUser, async (req, res) => {
  try {
    const findAllRoom = await Aim_user_room.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(findAllRoom);
  } catch (e) {
    console.log(e);
  }
});

router.post("/create", authUser, async (req, res) => {
  try {
    const { mapId, title, description } = req.body;

    const { id } = req.user;
    const result = Aim_user_room.create({
      hostId: id,
      mapId,
      title,
      description,
      status: 1,
    });
    res.json(result);
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
