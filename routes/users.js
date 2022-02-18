const http = require("http");
const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const bodyParser = require("body-parser");
const mysql = require("mysql");
const { Aim_user_info } = require("../models");
const jwt = require("jsonwebtoken");
const authUser = require("./middlewares/authUser");
const bcrypt = require('bcrypt');

const router = express.Router();
const privateKey = 'session';
const refreshKey = 'refresh';

/* GET users listing. */
// router.get("/", function (req, res, next) {
//   console.log("here");
//   res.send("respond with a resource");
// });

// router.post("/test", ())

router.post("/login", async(req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(500).json({ result: '아이디나 비밀번호를 입력해주세요.' });
    }
    const findUser = await Aim_user_info.findOne({
      where: {
        email
      }
    });
    if (!findUser) {
      res.status(401).json({ result: '회원정보가 없습니다.' });
    } else {
      if (findUser.password === password) {
      // 암호화 저장시 사용
      // if (await bcrypt.compare(findUser.password, password)) {
        const accessToken = jwt.sign({
          email,
          info: 'AccessToken',
        }, privateKey, { expiresIn: '60s' });
        const refreshToken = jwt.sign({
          email,
          info: 'RefreshToken',
        }, refreshKey, { expiresIn: '3d'});
  
        const result = await findUser.update({
          accessToken, 
          refreshToken,
        });
        res.status(200).json({ msg: '로그인에 성공했습니다.', result: {access_token: accessToken, refresh_token: refreshToken} });
      } else {
        res.status(401).json({ msg: '비밀번호가 틀렸습니다.' });
      }
    }
  } catch (e) {
    console.log(e);
  }
});

router.get('/refreshToken', (req, res) => {
  const token = req.headers['refresh-token'];
  console.log('refresh', token);
  jwt.verify(token, refreshKey, (err, decoded) => {
    if (err) return res.status(500).json({ result: err });

    const token = jwt.sign({
        email: req.body.email,
      }, privateKey, { expiresIn: '60s' });
      return res.json({ msg: '리프레쉬 성공', result: { access_token: token } });
  });
});

router.post('/signup', async function(req, res) {
  const { email, password, nickname } = req.body;
  try {
    if (!email || !password || !nickname) {
      return res.status(500).json({ msg: '값을 입력하십시오.' });
    }
    const isExistUser = await Aim_user_info.findOne({
      where: {
        email,
      }
    })
    console.log(isExistUser)
    if (isExistUser) {
      return res.status(500).json({ msg: '중복된 이메일입니다.' })
    } else {
      const result = await Aim_user_info.create({
        email,
        password,
        nickname,
      })
      if (result) {
        return res.json({ msg: '회원가입이 완료되었습니다.' })
      } else {
        return res.status(500).json({ msg: '회원가입에 실패했습니다.' })
      }
    }
  } catch(e) {
    console.log(e)
  }
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
    if (findUser) {
      const result = await findUser.update({
        accessToken,
      });
      res.json(result);
    } else {
      const result = await Aim_user_info.create({
        accessToken,
        email,
      });
      res.json(result);
    }
  } catch (e) {
    console.log(e);
  }
});

/* GET users listing. */
router.post("/update/profile", authUser,  async function (req, res) {
  const { accessToken, nickname, character } = req.body;
  // console.log("success");
  try {
    //여기의 버튼은 회원가입이 안되어있으면 못들어오는 페이지 => email check 안해도 될 듯함
    const userInfo = req.user;
    if (userInfo) {
      await userInfo.update({
        nickname,
        character,
      });
      res.json({
        msg: "캐릭터가 생성되었습니다.(정보가 업데이트 되었습니다.)",
      });
    } else {
      res.status(400).json({
        msg: "토큰이 만료되었습니다.",
      });
    }
  } catch (e) {
    console.log(e);
  }
});

/* GET users listing. */
router.post("/get/userinfo", authUser, async function (req, res) {
  const { accessToken } = req.body;
  try {
    //여기의 버튼은 회원가입이 안되어있으면 못들어오는 페이지 => email check 안해도 될 듯함
    if (req.user) {
      res.json({ result : req.user });
    } else {
      res.status(400).json( { msg: "토큰이 만료됐습니다." });
    }
  } catch (e) {
    console.log(e);
  }
});



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

// // google login 화면
// router.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["email", "profile"] })
// );

// // google login 성공과 실패 리다이렉트
// router.get(
//   "/auth/google/callback",
//   passport.authenticate("google", {
//     successRedirect: "/",
//     failureRedirect: "/login",
//   })
// );

// logout
router.get("/logout", (req, res) => {
  req.logout();
  // res.redirect("/login");
  res.json({ msg: '로그아웃 되었습니다.' })
});

module.exports = router;
