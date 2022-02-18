const express = require("express");
const router = express.Router();

//DB 정보
const { Aim_map_images, Aim_user_room, Aim_user_info } = require("../models");
const authUser = require("./middlewares/authUser");

router.get("/", async (req, res) => {
  try {
    const findAllRoom = await Aim_map_images.findAll({
      // order: ["createdAt", "ASC"]
    });
    res.json(findAllRoom);
  } catch (e) {
    console.log(e);
  }
});

router.post("/create", authUser, async (req, res) => {
  try {
    const { image, title, desc } = req.body;
    
    const { id } = req.user;
    const result = Aim_user_room.create({
      hostId: id,
      mapId: image,
      title,
      desc,
    });
    res.json(result);
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
