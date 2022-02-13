const express = require("express");
const app = require("../app");
const router = express.Router();

//DB 정보
const { Aim_user_room, Aim_user_info, Aim_map_images } = require("../models");
const authUser = require("./middlewares/authUser");

router.get("/", authUser, async (req, res) => {
  try {
    const findAllUserRoom = await Aim_user_room.findAll({
      include: [Aim_user_info, Aim_map_images],
    });
    res.status(200).json(findAllUserRoom);
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
