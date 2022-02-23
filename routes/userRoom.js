const express = require("express");
const app = require("../app");
const router = express.Router();

//DB 정보
const { Aim_user_room, Aim_user_info, Aim_map_images } = require("../models");
const authUser = require("./middlewares/authUser");

router.get("/", async (req, res) => {
  try {
    const findAllUserRoom = await Aim_user_room.findAll({
      order: [["createdAt", "DESC"]],
      include: [Aim_user_info, Aim_map_images],
    });

    const needRoomInfo = findAllUserRoom.map((info) => {
      const {
        id,
        title,
        description,
        createdAt,
        updatedAt,
        Aim_user_info,
        Aim_map_image,
      } = info;
      const { id: hostId } = Aim_user_info;
      const { image } = Aim_map_image;
      return {
        id,
        hostId,
        title,
        description,
        image,
        createdAt,
        updatedAt,
      };
    });

    res.json(needRoomInfo);
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
