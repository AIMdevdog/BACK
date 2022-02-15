const http = require("http");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const passport = require("passport");
const cors = require("cors");
const fs = require("fs");
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const { sequelize } = require("./models");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const roomRouter = require("./routes/room");
const characterRouter = require("./routes/characters");
const userRoomRouter = require("./routes/userRoom");

const app = express();

const httpServer = http.createServer(app);
const PORT = 5000;
const HOST = "0.0.0.0";
const io = require("socket.io")(httpServer, {
  cors: {
    origin: ["https://dev-team-aim.com:*"],
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
    autoConnect: true,
    pingInterval: 25000,
    pingTimeout: 180000,
  },
  allowEIO3: true,
  cookie: {
    name: "domainio",
    httpOnly: false,
    secure: true,
  },
});

// console.log(io);

// express앱과 MySQL을 연결
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.log(err);
  });

// image 사용을 위한 static folder 지정
// let corsOption = {
//   origin: "http://18.116.38.147:3000/", // 허락하는 요청 주소
//   credentials: true, // true로 하면 설정한 내용을 response 헤더에 추가 해줍니다.
// };

/* 전역 변수 */
let characters = []; //character socketID list
let charMap = {}; //character information (x,y 등등)

/* for group call */
const groupCallName = 0; //CallName for temp
const MAXIMUM = 5; //Call maximun
//roomObjArr는 오해의 소지가 있어 groupObjArr로 변경 예정
let roomObjArr = [
  // {
  //   roomName,
  //   currentNum,
  //   users: [
  //     {
  //       socketId,
  //       nickname,
  //     },
  //   ],
  // },
];
let groupObjArr = [
  // {
  //   roomName,
  //   currentNum,
  //   users: [
  //     {
  //       socketId,
  //       nickname,
  //     },
  //   ],
  // },
];

app.use(cors());
app.use(express.static("public"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/users", usersRouter);
app.use("/room", roomRouter);
app.use("/character", characterRouter);
app.use("/userRoom", userRoomRouter);
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

httpServer.listen(PORT, HOST, () => {
  console.log(`Server running on ${PORT}`);
});

const video_call_stack = [];

class GameObject {
  constructor(socket) {
    this.socket = socket;
    this.x = 80;
    this.y = 80;
    this.direction = [];
    this.Buffer = [];
    this.src = null;
    this.groupNumber = 0;
    // this.src = "https://dynamic-assets.gather.town/sprite/avatar-M8h5xodUHFdMzyhLkcv9-IJzSdBMLblNeA34QyMJg-qskNbC9Z4FBsCfj5tQ1i-KqnHZDZ1tsvV3iIm9RwO-g483WRldPrpq2XoOAEhe-sb7g6nQb3ZYxzNHryIbM.png";
  }
  get id() {
    return this.socket.id;
  }
  pushInput(data) {
    this.Buffer.push(data);
  }
  update_location() {
    const input = this.Buffer.shift();
    // console.log(input)
    if (this.Buffer.length > 0) {
      this.direction.unshift(input.direction);
      if (this.x !== input.x) {
        this.x = input.x;
      }
      if (this.y !== input.y) {
        this.y = input.y;
      }
    }
  }
}

function handler(req, res) {
  fs.readFile(__dirname + "/index.html", function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end("Error loading index.html");
    }

    res.writeHead(200);
    res.end(data);
  });
}

function joinGame(socket) {
  let user = new GameObject(socket);
  characters.push(user);
  charMap[socket.id] = user;
  return user;
} /*  */

function leaveGame(socket) {
  for (let i = 0; i < characters.length; i++) {
    if (characters[i].id === socket.id) {
      characters.splice(i, 1);
      break;
    }
  }
  delete charMap[socket.id];
}

function onInput(socket, data) {
  let user = charMap[data.id];
  // user.direction.push(data.direction);
  // user.x = data.x || 80;
  // user.y = data.y || 80;
  const inputData = {
    x: data.x,
    y: data.y,
    direction: data.direction,
  };
  user.pushInput(inputData);
}

function updateGame() {
  for (let i = 0; i < characters.length; i++) {
    let character = characters[i];

    character.update_location();

    // ball.handleInput(timeRate);
  }

  setTimeout(updateGame, 16);
}

function broadcastState() {
  let data = {};
  for (let i = 0; i < characters.length; i++) {
    let character = characters[i];
    // console.log(character.direction);
    data[i] = {
      id: character.id,
      x: character.x,
      y: character.y,
      direction: character.direction.shift(),
    };
  }

  io.sockets.emit("update_state", data);

  setTimeout(broadcastState, 16);
}

updateGame();
broadcastState();

io.on("connection", function (socket) {
  console.log(`${socket.id} has joined!`);

  socket.on("disconnect", function (reason) {
    console.log(`${socket.id} has leaved! (${reason})`);

    leaveGame(socket);

    socket.broadcast.emit("leave_user", socket.id);
  });

  socket.on("input", function (data) {
    onInput(socket, data);
  });

  let newUser = joinGame(socket);
  socket.on("send_user_src", function (data) {
    const nUser = charMap[data.id];
    // console.log(nUser);
    nUser.src = data.src;
    for (let i = 0; i < characters.length; i++) {
      let user = characters[i];
      socket.emit("user_src", {
        id: user.socket.id,
        src: user.src,
      });
    }
    socket.broadcast.emit("user_src", {
      id: socket.id,
      src: nUser.src,
    });
  });
  for (let i = 0; i < characters.length; i++) {
    let user = characters[i];
    socket.emit("join_user", {
      id: user.id,
      x: user.x,
      y: user.y,
    });
  }
  socket.broadcast.emit("join_user", {
    id: socket.id,
    x: newUser.x,
    y: newUser.y,
  });

  /*//////////////////
  ms
  ** socket.on("join_room", (roomName, nickname)내에 room관련 정보들은 소켓 룸이며, 로비의 룸이 아니므로 따로 이벤트를 생성해야함.

  1. caller가 방 만들게 한다. (방 번호는 1번 부터 : global 변수 roomName)
  2. 방장(socketID)있으면 방장에게 방을 만들면 돼. (socket.join(roomName))
  3. 방원(socketID)을 이용해서 서버가 방원에게 offer정보를 만들라고 emit으로 시킨다.
    3-1. 방장이 만든 방 정보(roomName: 방장이 만든..)까지 같이 넘겨야되겠지? OK
  
  peer-to-peer
  1. 방원 -> 서버 -> 방장 (offer)
  2. 방장 -> 서버 -> 방원 (answer)
  3. 방원 -> 서버 -> 방장 (add ice)
  4. 방장 -> 서버 -> 방원 (add ice) 

  
  
  const groupCallName = 0; //CallName for temp
  const MAXIMUM = 5; //Call maximun
  let roomObjArr = [
    // {
    //   roomName,
    //   currentNum,
    //   users: [
    //     {
    //       socketId,
    //       nickname,
    //     },
    //   ],
    // },
  ];

  makeGroup함수를 만들어서 
  caller, callee 들어올때마다 
  caller가 방을 만들고, callee가 그룹에 참여하면 된다. 
  //////////////////*/

  socket.on("makegroup", (groupName, caller, callee) => {
    var nickname = "Anon";
    var groupName = 0;
    makeGroup(groupName, caller, nickname);
  });

  socket.on("user_call", ({ caller, callee }) => {
    const DuplCheck = video_call_stack?.filter(
      (item) => item.caller === caller && item.callee === callee
    );
    //아래 이름 바꾸기!

    if (DuplCheck.length === 0) {
      video_call_stack.push({
        caller,
        callee,
      });
    }

    const user_caller = charMap[caller];
    const user_callee = charMap[callee];
    // video_call_stack : [ {Caller1, Callee}, {Caller1, Callee},,,, ]
    // input : { '4TD7oabReWtFetOOAAAO', 'MxzUNhfFivHmFQoQAAAG' }
    // const result = video_call_stack.shift();

    //callee의 방이 있으면 그냥 참가 함수(caller)
    if (user_callee.groupNumber) {
      joinGroup(user_callee.groupNumber, user_caller.socket, "ANON");
    } else {
      makeGroup(user_caller.groupNumber, user_caller.socket, "ANON");
      joinGroup(user_caller.groupNumber, user_callee.socket, "ANON");
    }
    //성공하면 이거 설정 필요

    // user_caller.groupNumber = true;
    // user_callee.groupNumber = true;

    // function makeGroup(groupName, socket, nickname)

    //caller 방만든다.

    /* 현재 소켓의 룸넘버가 0이면 가까운 아무나 소켓의 룸넘버에 접근해서 그 룸에 해당 소켓을 넣게 한다 (룸넘버->클로저챗) (소켓에 필드추가)
     *
     */
  });

  socket.on("offer", (offer, remoteSocketId, localNickname) => {
    console.log("offer 실행", remoteSocketId, localNickname);
    socket.to(remoteSocketId).emit("offer", offer, socket.id, localNickname);
  });

  socket.on("answer", (answer, remoteSocketId) => {
    console.log("answer 실행", remoteSocketId);
    socket.to(remoteSocketId).emit("answer", answer, socket.id);
  });

  socket.on("ice", (ice, remoteSocketId) => {
    console.log("ice 실행", remoteSocketId);
    socket.to(remoteSocketId).emit("ice", ice, socket.id);
  });

  // socket.on("chat", (message, roomName) => {
  //   socket.to(roomName).emit("chat", message);
  // });

  // socket.on("disconnecting", () => {
  //   socket.to(myRoomName).emit("leave_room", socket.id, myNickname);

  //   let isRoomEmpty = false;
  //   for (let i = 0; i < roomObjArr.length; ++i) {
  //     if (roomObjArr[i].roomName === myRoomName) {
  //       const newUsers = roomObjArr[i].users.filter(
  //         (user) => user.socketId != socket.id
  //       );
  //       roomObjArr[i].users = newUsers;
  //       --roomObjArr[i].currentNum;

  //       if (roomObjArr[i].currentNum == 0) {
  //         isRoomEmpty = true;
  //       }
  //     }
  //   }

  //   // Delete room
  //   if (isRoomEmpty) {
  //     const newRoomObjArr = roomObjArr.filter(
  //       (roomObj) => roomObj.currentNum != 0
  //     );
  //     roomObjArr = newRoomObjArr;
  //   }
  // });
});

//when caller make the room
function makeGroup(groupName, socket, nickname) {
  console.log("실행 makeGroup");
  initGroupObj = {
    groupName,
    currentNum: 0,
    users: [
      {
        socketId: socket.id,
        nickname,
      },
    ],
  };
  groupObjArr.push(initGroupObj);
  // console.log(groupObjArr);
  // return targetGroupObj;
  socket.join(groupName);
  socket.emit("accept_join", [1]);
}
//when callee join the room
function joinGroup(groupName, socket, nickname) {
  console.log("실행 joinGroup");
  for (let i = 0; i < groupObjArr.length; ++i) {
    if (groupObjArr[i].groupName === groupName) {
      // Reject join the room

      if (groupObjArr[i].currentNum >= MAXIMUM) {
        socket.emit("reject_join");
        return;
      }
      //Join the room
      groupObjArr[i].users.push({
        socketId: socket.id,
        nickname,
      });
      ++groupObjArr[i].currentNum;

      console.log("*****방 사용자들", groupObjArr[i].users);
      socket.join(groupName);
      socket.emit("accept_join", groupObjArr[i].users);
    }
  }
}

module.exports = app;
