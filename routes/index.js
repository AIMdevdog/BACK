var express = require('express');
var router = express.Router();

//DB 정보
const { Aim_user_info } = require('../models');

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

router.get("/", (req, res) => {
  //1.이 유저가 login이 되어있는지 체크
    // 세션 ID를 client에서 받고 DB에 있는지만 확인
  const { sessionId } = req.query;
  //DB확인 sequalize
  result = "DB확인 sequalize check"
  if (result) { //로그인 O
    console.log("success");
    res.send(200);
  } else { //로그인 X
    res.send(400);
  }
});

/* lobby 화면 */
router.get("/lobby", async (req, res) => {
  /* 
   * (업데이트 필요) authUser 미들웨어 추가 => 로그인 되어있는지 확인
   * 로그인이 안되어있으면 => return 400
   * 
   * return {map_images DB에 있는 모든 열}
   */

  var {accessToken} = req.body;
  // accessToken을 DB에서 확인한다. 
  // input : nickname, character
  
  // accessToken을 통해 DB 조회
  var result = await Aim_user_info.findOne({
    where: {
      accessToken,
    },
  });

  var findUserInfo = await Map_images.findOne({

  })



  if (result) {

  }
  
  res.sendStatus(200);


  if (usercheck) {
    try {
      const findAllMaps = await db.query(
        `SELECT * FROM map_images`,
        function (error, result, fields) {
          if (error) throw error;
          else if (result?.length) {
            res.json({
              code: 200,
              data: result,
            });
          } else {
            res.json({
              code: 400,
              message: "방이 없습니다.",
            });
          }
        }
      );
    } catch (e) {
      console.log(e);
    }
  } else {
    res.json({
      code: 400,
      message: "방이 없습니다.",
    });
  }
});



module.exports = router;
