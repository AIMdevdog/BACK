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
// const wsServer = new Server(httpServer);
const PORT = 8000;
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

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
let corsOption = {
  origin: "http://18.116.38.147:3000/", // 허락하는 요청 주소
  credentials: true, // true로 하면 설정한 내용을 response 헤더에 추가 해줍니다.
};

app.use(cors(corsOption));
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

httpServer.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

///////////////////

const video_call_stack = [];

class GameObject {
  constructor(socket) {
    this.socket = socket;
    this.x = 80;
    this.y = 80;
    this.direction = [];
    this.Buffer = [];
    this.src = null;
    // this.src = "https://dynamic-assets.gather.town/sprite/avatar-M8h5xodUHFdMzyhLkcv9-IJzSdBMLblNeA34QyMJg-qskNbC9Z4FBsCfj5tQ1i-KqnHZDZ1tsvV3iIm9RwO-g483WRldPrpq2XoOAEhe-sb7g6nQb3ZYxzNHryIbM.png";
  }
  get id() {
    return this.socket.id;
  }
  pushInput(data) {
    this.Buffer.unshift(data);
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

let characters = [];
let charMap = {};

function joinGame(socket) {
  let user = new GameObject(socket);
  characters.push(user);
  charMap[socket.id] = user;
  return user;
}

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
const MAXIMUM = 5;

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
  const MAXIMUM = 5;

  let myRoomName = null;
  let myNickname = null;

  socket.on("join_room", (roomName, nickname) => {
    myRoomName = roomName;
    myNickname = nickname;

    let isRoomExist = false;
    let targetRoomObj = null;

    // forEach를 사용하지 않는 이유: callback함수를 사용하기 때문에 return이 효용없음.
    for (let i = 0; i < roomObjArr.length; ++i) {
      if (roomObjArr[i].roomName === roomName) {
        // Reject join the room
        if (roomObjArr[i].currentNum >= MAXIMUM) {
          socket.emit("reject_join");
          return;
        }

        isRoomExist = true;
        targetRoomObj = roomObjArr[i];
        break;
      }
    }

    // Create room
    if (!isRoomExist) {
      targetRoomObj = {
        roomName,
        currentNum: 0,
        users: [],
      };
      roomObjArr.push(targetRoomObj);
    }

    //Join the room
    targetRoomObj.users.push({
      socketId: socket.id,
      nickname,
    });
    ++targetRoomObj.currentNum;

    socket.join(roomName);
    socket.emit("accept_join", targetRoomObj.users);
    // console.log(targetRoomObj.users)
  });

  socket.on("offer", (offer, remoteSocketId, localNickname) => {
    socket.to(remoteSocketId).emit("offer", offer, socket.id, localNickname);
  });

  socket.on("answer", (answer, remoteSocketId) => {
    socket.to(remoteSocketId).emit("answer", answer, socket.id);
  });

  socket.on("ice", (ice, remoteSocketId) => {
    socket.to(remoteSocketId).emit("ice", ice, socket.id);
  });

  socket.on("chat", (message, roomName) => {
    socket.to(roomName).emit("chat", message);
  });

  // socket.on("user_call", ({caller, callee}) => {
  //   const DuplCheck = video_call_stack?.filter((item) => item.caller === caller && item.callee === callee)

  //   if (DuplCheck.length === 0) {
  //     video_call_stack.push({
  //       caller,
  //       callee
  //     });
  //     console.log(video_call_stack);
  //   }
  //   //video_call_stack : [ {Caller1, Callee}, {Caller1, Callee},,,, ]
  //   //input : { '4TD7oabReWtFetOOAAAO', 'MxzUNhfFivHmFQoQAAAG' }
  //   const result = video_call_stack.shift();
  //   console.log(result.caller, result.callee);

  //   //caller 방만든다.

  // });
  // video_call_stack
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
  /////////////////////////////////////////////////////////////

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
});
function updateGame() {
  for (let i = 0; i < characters.length; i++) {
    let character = characters[i];

    character.update_location();

    // ball.handleInput(timeRate);
  }

  setTimeout(updateGame, 32);
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

  setTimeout(broadcastState, 32);
}

updateGame();
broadcastState();
/////////////////////////////////////////////////////////////////////////////

///////////////////

module.exports = app;
