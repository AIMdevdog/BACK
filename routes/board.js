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

router.get("/read/:roomId", async (req, res) => {
  const { roomId } = req.params;
  try {
    const boards = await Aim_board.findAll({
        // include: [{ // 캐릭터 url이나 닉네임 가져올 때 join
        //     model: Aim_user_info, 
        //     attributes: [""],
        // }],
        where: {
            roomId,
            status: 1
        },
        include: [Aim_user_info, Aim_user_room]
        
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

router.post("/create", authUser, async (req, res) => {
  try {
    const { accessToken } = req.user;
    const { contents, roomId } = req.body;
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


router.put("/update", authUser, async (req, res) => {
  try {
    const { boardId, contents } = req.body;
    const findBoard = await Aim_board.findOne({
      where: {
        id: boardId,
      },
      // include: [Aim_user_info]
    })
    const result = await findBoard.update({
      contents,
    })
    if (result) { 
      return res.json({ msg: "업데이트 성공." });
    } else {
      return res.status(400)
    }

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

router.post("/delete", authUser, async (req, res) => {
  try {
    const { boardId } = req.body;
    const result = await Aim_board.findOne({
      where: {
        id: boardId,
      }
    })
    if(result) {
      const r = result.update({
        status: 0
      })
      if (r) {
        return res.json({ msg: "삭제 성공."})
      } else {
        return res.status(400);
      }
    } else {
      res.json({msg: "방명록을 찾을 수 없습니다."})
    }
    
  } catch (e) {
    console.log(e);
  }
});




module.exports = router;