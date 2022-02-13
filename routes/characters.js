const express = require("express");
const router = express.Router();

//DB 정보
const { Aim_character_images } = require("../models");
const { findAndCountAll } = require("../models/aim_user_info");
const authUser = require("./middlewares/authUser");

router.get("/", authUser, async (req, res) => {
  try {
    const findAllCharacter = await Aim_character_images.findAll();
    res.json(findAllCharacter);
  } catch (e) {
    console.log(e);
    next(e);
  }
});

module.exports = router;
