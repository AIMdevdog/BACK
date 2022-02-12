const http = require("http");
const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const bodyParser = require("body-parser");
const mysql = require("mysql");
const { Aim_user_info } = require("../models");
// import { Aim_user_info } from "../models";

var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  console.log("here");
  res.send("respond with a resource");
});

router.post("/auth/google", async function (req, res, next) {
  //accessToken X, email X DB에 저장해야한다.
  //accessToken O, email X => 이런 경우는 없다.
  //accessToken X, email O => 로그인 만료됐다.
  //accessToken O, email O => 성공 메세지
  // => 수정 필요 :
  try {
    const { accessToken, email } = req.body;
    const findUser = await Aim_user_info.findOne({
      where: {
        email,
      },
    });
    if (!findUser) {
      const result = Aim_user_info.create({
        accessToken: accessToken,
        email: email,
      });
      res.json({
        code: 200,
        data: result,
        msg: "회원 가입이 완료됐습니다.",
      });
    } else {
      res.json({
        code: 200,
        data: findUser,
        msg: "로그인이 되어있습니다.",
      });
    }
  } catch (e) {
    console.log(e);
  }
});

/* GET users listing. */
router.post("/update/profile", async function (req, res) {
  var { accessToken, nickname, character } = req.body;
  // console.log("success");
  try {
    //여기의 버튼은 회원가입이 안되어있으면 못들어오는 페이지 => email check 안해도 될 듯함
    const checkToken = await Aim_user_info.findOne({
      where: { accessToken },
    });
    console.log(checkToken.accessToken);
    if (checkToken.accessToken) {
      //token checked
      //update user_info in DB

      await checkToken.update({
        nickname,
        character,
      });
      res.json({
        code: 200,
        msg: "캐릭터가 생성되었습니다(정보가 업데이트 되었습니다)",
      });
    } else {
      res.json({
        code: 400,
        msg: "토큰이 만료됐습니다.",
      });
    }
  } catch (e) {
    console.log(e);
  }
});

/* GET users listing. */
router.post("/get/userinfo", async function (req, res) {
  var { accessToken } = req.body;
  try {
    //여기의 버튼은 회원가입이 안되어있으면 못들어오는 페이지 => email check 안해도 될 듯함
    const checkToken = await Aim_user_info.findOne({
      where: { accessToken },
    });
    if (checkToken) {
      res.json({
        code: 200,
        data: checkToken,
      });
    } else {
      res.json({
        code: 400,
        msg: "토큰이 만료됐습니다.",
      });
    }
  } catch (e) {
    console.log(e);
  }
});

// /* POST login */
// router.get("/login", (req, res) => {
//   /* 로그인 버튼을 클릭시, req = {email, password}
//    * email과 password가 둘 다 동일하면 res.sendStatus(200);
//    * email 동일한게 없다면 data = {400, "회원정보가 없습니다. "}
//    */
//   res.sendStatus(200);
// });

// //Nickname page에서 만들기 버튼을 만들었을 때,
// router.post("/sendNickname", async(req, res) => {
//   const { email, nickname, character } = req.body;
//   console.log(email)
//   // input : nickname, character

//   // DB 조회
//   const findUser = await Aim_user_info.findOne({
//     where: {
//       email
//       // [Op.and]: [{email: { [Op.ne]:email },
//       //             nickname: nickname}],
//     },
//   });
//   console.log('****', findUser);
//   res.send(findUser);
//   res.json({
//     code: 400,
//     message: "방이 없습니다.",
//   });
// });

// // 나 외 nickname 중복값이 있는지 확인하고 리턴
// // DB 저장 (닉넴, 캐릭터)
// Aim_user_info.update({
//   nickname: nickname,
//   character: character,
// }, {
//   where: {email: email},
// });
// 결과 리턴

// google login 화면
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

// google login 성공과 실패 리다이렉트
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

// logout
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

module.exports = router;
