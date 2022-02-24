const express = require("express");
const app = require("../app");
const router = express.Router();

//DB 정보
const { Aim_user_room, Aim_user_info, Aim_map_images } = require("../models");
const authUser = require("./middlewares/authUser");

router.get("/", async (req, res) => {
  try {
    const findAllUserRoom = await Aim_user_room.findAll({
      where: {
        status: 1,
      },
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

router.post("/delete", authUser, async (req, res) => {
  try {
    const { roomId } = req.body;
    console.log(roomId);
    const findUserRoom = await Aim_user_room.findOne({
      where: {
        id: roomId,
      },
    });
    if (findUserRoom) {
      findUserRoom.update({ status: 0 });

      return res.json({ code: 200, msg: "완료되었습니다." });
    } else {
      return res.json({
        code: 400,
        msg: "삭제에 문제가 생겼습니다. 다시 시도해주세요.",
      });
    }
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
