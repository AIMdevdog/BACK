const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const { Aim_user_info, Aim_board, Aim_user_room } = require("../models");
const authUser = require("./middlewares/authUser");

const router = express.Router();

/* GET users listing. */
// router.get("/", function (req, res, next) {
//   console.log("here");
//   res.send("respond with a resource");
// });

// router.post("/test", ())

router.get("/:roomId", authUser, async (req, res) => {
  const { roomId } = req.params;
  try {
    const boards = await Aim_board.findAll({
      where: {
        roomId: parseInt(roomId),
        status: 1,
      },
      include: [Aim_user_info, Aim_user_room],
      order: [["createdAt", "DESC"]],
    });
    if (boards) {
      return res.json({ msg: "방명록 불러오기 성공.", data: boards });
    } else {
      return res.status(400);
    }
  } catch (e) {
    console.log(e);
  }
});

router.post("/", authUser, async (req, res) => {
  try {
    const { accessToken } = req.user;
    const { roomId, contents } = req.body;
    const findUser = await Aim_user_info.findOne({
      where: {
        accessToken,
      },
    });
    if (findUser) {
      const result = await Aim_board.create({
        roomId,
        userId: findUser.id,
        contents,
      });
      if (result) {
        return res.json({ msg: "방명록 생성." });
      } else {
        return res.status(400);
      }
    }
  } catch (e) {
    console.log(e);
  }
});

router.put("/", authUser, async (req, res) => {
  try {
    const { boardId, contents } = req.body;
    const findBoard = await Aim_board.findOne({
      where: {
        id: boardId,
      },
    });
    const result = await findBoard.update({
      contents,
    });
    if (result) {
      return res.json({ msg: "업데이트 성공." });
    } else {
      return res.status(400);
    }
  } catch (e) {
    console.log(e);
  }
});

router.delete("/:boardId", authUser, async (req, res) => {
  try {
    const { boardId } = req.params;
    const result = await Aim_board.findOne({
      where: {
        id: boardId,
      },
    });
    if (result) {
      const r = result.update({
        status: 0,
      });
      if (r) {
        return res.json({ msg: "삭제 성공." });
      } else {
        return res.status(400);
      }
    } else {
      res.json({ msg: "방명록을 찾을 수 없습니다." });
    }
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
