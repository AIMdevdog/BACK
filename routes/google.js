// google.js

const http = require("http");
const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const passport = require("passport");
const fs = require("fs");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const bodyParser = require("body-parser");
const mysql = require("mysql");

const router = express.Router();

// 위의 Google Developers Console에서 생성한 client id와 secret
// const GOOGLE_CLIENT_ID =
//   "8184804334-ug7p9u3tibnuqfsf5feaijmefbl48s2d.apps.googleusercontent.com";
// const GOOGLE_CLIENT_SECRET = "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";

// db session store options
const options = {
  host: "db-aim.cv48si1lach8.us-east-2.rds.amazonaws.com",
  port: 3306,
  user: "admin",
  password: "aimjungle!2345",
  database: "aim_production",
};

// mysql session store 생성
const sessionStore = new MySQLStore(options);

// express session 연결
router.use(
  session({
    secret: "secret key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
  })
);

// mysql 연결
let db = mysql.createConnection(options);
db.connect();

//
router.use(bodyParser.urlencoded({ extended: true }));

// image 사용을 위한 static folder 지정
router.use(express.static("public"));

// passport 초기화 및 session 연결
router.use(passport.initialize());
router.use(passport.session());

// login이 최초로 성공했을 때만 호출되는 함수
// done(null, user.id)로 세션을 초기화 한다.
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// 사용자가 페이지를 방문할 때마다 호출되는 함수
// done(null, id)로 사용자의 정보를 각 request의 user 변수에 넣어준다.
passport.deserializeUser(function (id, done) {
  done(null, id);
});

// Google login 전략
// 로그인 성공 시 callback으로 request, accessToken, refreshToken, profile 등이 나온다.
// 해당 콜백 function에서 사용자가 누구인지 done(null, user) 형식으로 넣으면 된다.
// 이 예시에서는 넘겨받은 profile을 전달하는 것으로 대체했다.
// passport.use(
//   new GoogleStrategy(
//     {
//       // 예림 관리 키
//       clientID: GOOGLE_CLIENT_ID,
//       clientSecret: GOOGLE_CLIENT_SECRET,
//       callbackURL: "http://localhost:8000/auth/google/callback",
//       passReqToCallback: true,
//     },
//     function (request, accessToken, refreshToken, profile, done) {
//       db.query(
//         "SELECT * FROM aim_user_info WHERE email=?",
//         [profile.email],
//         function (error, result) {
//           if (error) {
//             throw error;
//           }

//           if (result.length === 0) {
//             db.query(
//               "INSERT INTO aim_user_info (session_id, email) VALUES(?,?)",
//               [request.session.passport.user, profile.email],
//               function (error2, result) {
//                 if (error2) {
//                   throw error2;
//                 }
//               }
//             );
//           }
//         }
//       );

      // console.log(profile);
      // console.log(accessToken);

  //     return done(null, profile);
  //   }
  // )
// );

// login 화면
// 이미 로그인한 회원이라면(session 정보가 존재한다면) main화면으로 리다이렉트
// router.get("/login", (req, res) => {
//   if (req.user) {
//     // 닉네임, 캐릭터 정보를 조회하는 쿼리

//     return res.redirect("/");
//   } else {
//     fs.readFile("./webpage/login.html", (error, data) => {
//       if (error) {
//         console.log(error);
//         return res.sendStatus(500);
//       }

//       res.writeHead(200, { "Content-Type": "text/html" });
//       res.end(data);
//     });
//   }
// });



// login 화면
// 로그인 하지 않은 회원이라면(session 정보가 존재하지 않는다면) login화면으로 리다이렉트
// router.get("/", (req, res) => {
//   //1.이 유저가 login이 되어있는지 체크
//     // 세션 ID를 client에서 받고 DB에 있는지만 확인
//   const { sessionId } = req.query;
//   //DB확인 sequalize
//   result = "DB확인 sequalize check"
//   if (result) { //로그인 O
//     res.send(200);
//   } else { //로그인 X
//     res.send(400);
//   }
// });

    
  
  //조회
  // if (!req.user) return res.redirect("/login");
  // fs.readFile("./webpage/selectCharacter.html", (error, data) => {
  //   if (error) {
  //     console.log(error);
  //     return res.sendStatus(500);
  //   }

  //   res.writeHead(200, { "Content-Type": "text/html" });
  //   res.end(data);
  // });

// });
//Nickname page에서 만들기 버튼을 만들었을 때, 
router.post("/sendNickname", (req, res) => {
  const { email, nickname, character } = req.body;
  const { Aim_user_info } = require('./models');
  // input : nickname, character
  
  // DB 조회
  const isInDB = async () => {
    await Aim_user_info.findOne({
      where: {
        [Op.and]: [{email: { [Op.ne]:email },
        nickname: nickname}], 
      },
    });
  };
  console.log('****', isInDB);
  res.sendStatus(200);
});

  // // 나 외 nickname 중복값이 있는지 확인하고 리턴
  // // DB 저장 (닉넴, 캐릭터)
  // Aim_user_info.update({
  //   nickname: nickname,
  //   character: character,
  // }, {
  //   where: {email: email},
  // });
  // 결과 리턴
  
  
  //   req.session.user.session_id;
  //   let post = req.body;
  //   let result = req.db.query(
  //     "UPDATE aim_user_info SET nickname=? WHERE session_id=?",
  //     [nickname, sessionId],
  //     function (error, result, fields) {
  //       if (error) throw error;
  //       else if (result?.length) {
  //         res.json({
  //           code: 200,
  //           data: result,
  //         });
  //       } else {
  //         res.json({
  //           code: 400,
  //           message: "유저를 찾을 수 없습니다.",
  //         });
  //       }
  //     }
  //   );

  // console.log('Got body:', req.body);
//   res.sendStatus(200);
// });

// router.get("/lobby", usercheck, async (req, res) => {
//   if (usercheck) {
//     try {
//       const findAllMaps = await db.query(
//         `SELECT * FROM map_images`,
//         function (error, result, fields) {
//           if (error) throw error;
//           else if (result?.length) {
//             res.json({
//               code: 200,
//               data: result,
//             });
//           } else {
//             res.json({
//               code: 400,
//               message: "방이 없습니다.",
//             });
//           }
//         }
//       );
//     } catch (e) {
//       console.log(e);
//     }
//   } else {
//     res.json({
//       code: 400,
//       message: "방이 없습니다.",
//     });
//   }
// });

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
  res.redirect("/login");
});

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
