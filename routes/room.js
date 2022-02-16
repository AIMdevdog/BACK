const express = require("express");
const router = express.Router();

//DB 정보
const { Aim_map_images } = require("../models");

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

router.post("/create", async (req, res) => {
  try {
    const { hostId, image, title, desc } = req.body;
    const result = Aim_map_images.create({
      hostId,
      image,
      title,
      desc,
    });
    res.json(result);
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
