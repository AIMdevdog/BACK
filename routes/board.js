const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const { Aim_user_info, Aim_board, Aim_user_room } = require("../models");
const authUser = require("./middlewares/authUser");
const { update } = require("../models/aim_user_info");

const router = express.Router();

/* GET users listing. */
// router.get("/", function (req, res, next) {
//   console.log("here");
//   res.send("respond with a resource");
// });

// router.post("/test", ())

router.get("/room/:roomId/board/read", async (req, res) => {
  const { roomId } = req.params;
  try {
    const boards = await Aim_board.findAll({
        // include: [{ // 캐릭터 url이나 닉네임 가져올 때 join
        //     model: Aim_user_info, 
        //     attributes: [""],
        // }],
        where: {
            roomId,
        },
        include: [Aim_user_info, Aim_user_room]
    });
    return res.json({ msg: "방명록 불러오기 성공.", data: boards });
  } catch (e) {
    console.log(e);
  }
});

router.post("/room/board/create", async (req, res) => {
  try {
    // const { accessToken } = req.user;
    const { contents, roomId, accessToken } = req.body;
    const { roomId } = req.params;
    const findUser = await Aim_user_info.findOne({
      where: {
        accessToken,
      },
    });
    if (findUser) {
      const result = await Aim_board.create({
          roomId,
          userId : findUser.id,
          contents,
      });
      res.json(result);
    }
  } catch (e) {
    console.log(e);
  }
});


router.put("/room/${roomId}/board/update", async (req, res) => {
  try {
    const { boardId, contents } = req.body;
    const findBoard = await Aim_board.findOne({
      include: [{
        model: Aim_user_info, 
        attributes: ["accessToken"],
      }],
      where: {
        boardId,
      }
    })
    await findBoard.update({
      contents,
    })
  } catch (e) {
    console.log(e);
  }

    
    // const findCreatedUser = await Aim_board.findOne({
    //   where: {
    //     ,
    //   },
    // });
    // if (findUser === ) {
    //   const updateContents = await Aim_board.update({
    //       contents,
    //   });
    //   res.json(updateContents);
    // }

});

router.delete("/room/${roomId}/board/delete", async (req, res) => {
  try {
    const { boardId } = req.body;
    const result = await Aim_board.destroy({
      where: {
        boardId,
      }
    })
    return res.json({ msg: "삭제 성공."})
  } catch (e) {
    console.log(e);
  }
});




module.exports = router;