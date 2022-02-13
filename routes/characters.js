const express = require("express");
const router = express.Router();

//DB 정보
const { Aim_character_images } = require("../models");
const authUser = require("./middlewares/authUser");

router.get("/", authUser, async (req, res) => {
  try {
    const findAllCharacter = await Aim_character_images.findAll();
    res.status(200).json(findAllCharacter);
  } catch (e) {
    console.log(e);
    next(e);
  }
});

module.exports = router;
