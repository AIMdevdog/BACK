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
const PORT = 8000;
const io = require("socket.io")(httpServer, {
  // cors: {
  //   origin: "*",
  //   credentials: true,
  // },
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

/* 전역 변수 */
let charMap = {}; //character information (x,y 등등)

/* for group call */
const groupCallName = 0; //CallName for temp
const MAXIMUM = 5; //Call maximum
let groupName = 0;
let roomObjArr = {
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
};
let groupObjArr = [
  // {
  //   groupName,
  //   currentNum,
  //   users: [
  //     {
  //       socketId,
  //       nickname,
  //     },
  //   ],
  // },
];

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

httpServer.listen(process.env.PORT || 8000, () => {
  console.log(`Server running on ${PORT}`);
});

const video_call_stack = [];
let roomNum = 0;
class GameObject {
  constructor(socket) {
    this.socket = socket;
    this.x = 80;
    this.y = 80;
    this.direction = [];
    this.buffer = [];
    this.src = null;
    this.groupNumber = 0;
    this.nickname = "";
    this.roomId = "";
    // this.src = "https://dynamic-assets.gather.town/sprite/avatar-M8h5xodUHFdMzyhLkcv9-IJzSdBMLblNeA34QyMJg-qskNbC9Z4FBsCfj5tQ1i-KqnHZDZ1tsvV3iIm9RwO-g483WRldPrpq2XoOAEhe-sb7g6nQb3ZYxzNHryIbM.png";
  }
  get id() {
    return this.socket.id;
  }
  pushInput(data) {
    this.buffer.push(data);
    let stay_num = this.buffer.filter(
      (element) =>
        element.direction === undefined &&
        element.x === data.x &&
        element.y === data.y
    ).length;
    if (stay_num > 5) {
      this.buffer = [];
    }
  }
  update_location() {
    const input = this.buffer.shift();
    // console.log(input)
    if (this.buffer.length > 0) {
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

function makeGame(socket, roomId){
  console.log("makeGame func called");
  let user = new GameObject(socket);
  initGameObj = []
  initGameObj.push(user);
  roomObjArr[roomId] = initGameObj;
  return user;
}

function joinGame(socket, roomId) {
  console.log("joinGame func called");
  let user = new GameObject(socket);
  roomObjArr[roomId].push(user);
  return user;
}


function leaveGame(socket) {
  delete charMap[socket.id];
  Object.values(roomObjArr).forEach((gameGroup)=>{
    for (let i = 0; i < gameGroup.length; i++) {
      if (gameGroup[i].id === socket.id) {
        const roomId = gameGroup[i].roomId;
        gameGroup.splice(i, 1);
        if(gameGroup.length === 0){
          delete roomObjArr[roomId];
        }
        return;
      }
    }
  });
}

function onInput(socket, data) {
  let user = charMap[data.id];
  const inputData = {
    x: data.x,
    y: data.y,
    direction: data.direction,
  };
  user.pushInput(inputData);
}

function updateGame() {
  Object.values(charMap).forEach((object)=>{
    object.update_location();
  })
  setTimeout(updateGame, 16);
}

function broadcastState() {
  Object.values(roomObjArr).forEach((gameGroup) => {
    let data = {};
    for (let i = 0; i < gameGroup.length; i++) {
      let character = gameGroup[i];
      data[i] = {
        id: character.id,
        x: character.x,
        y: character.y,
        direction: character.direction.shift(),
      };
    }
    io.sockets.in(gameGroup[0].roomId).emit("update_state", data);
  })




  setTimeout(broadcastState, 16);
}

updateGame();
broadcastState();



io.on("connection", function (socket) {
  console.log(`${socket.id} has joined!`);
  socket.on("disconnect", function (reason) {
    console.log(`${socket.id} has leaved! (${reason})`);
    removeUser(socket.id);
    leaveGame(socket);
    socket.broadcast.emit("leave_user", {
      id: socket.id
    });
  });

  socket.on("input", function (data) {
    onInput(socket, data);
  });
  socket.emit("join_user");

  socket.on("send_user_info", function(data){
    const {src, x, y, nickname,roomId} = data;
    socket.join(roomId);
    let newUser;
    if(roomObjArr[roomId]){
      newUser = joinGame(socket, roomId);
      newUser.x = x;
      newUser.y = y;
      newUser.src = src;
      newUser.nickname = nickname;
      newUser.roomId = roomId;
    }else{
      newUser = makeGame(socket, roomId);
      newUser.x = x;
      newUser.y = y;
      newUser.src = src;
      newUser.nickname = nickname;
      newUser.roomId = roomId;
    }

    charMap[socket.id] = newUser;
    const gameGroup = roomObjArr[roomId];
    for (let i = 0; i < gameGroup.length; i++) {
      let user = gameGroup[i];
      socket.emit("get_user_info", {
        id: user.socket.id,
        x: user.x,
        y: user.y,
        src: user.src,
        nickname: user.nickname,
      });
    }
    socket.to(roomId).emit("get_user_info", {
      id: socket.id,
      x: newUser.x,
      y: newUser.y,
      src: newUser.src,
      nickname: newUser.nickname,
    });
  })

  /*
  1. 방원 -> 서버 -> 방장 (offer)
  2. 방장 -> 서버 -> 방원 (answer)
  3. 방원 -> 서버 -> 방장 (add ice)
  4. 방장 -> 서버 -> 방원 (add ice) 
*/

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
    if (socket.rooms.has(roomName)) {
      socket.to(roomName).emit("chat", message);
    }
  });

  function removeUser(removeSid){
    let deleted = []; // player.id로 groupObjArr에서 roomName찾기
    let findGroupName;
    for (let i = 0; i < groupObjArr.length; i++) {
      for (let j = 0; j < groupObjArr[i].users.length; j++) {
        // 거리가 멀어질 player의 Sid로 화상통화 그룹 정보에 저장된 동일한 Sid를 찾아서 그룹에서 삭제해준다
        if (removeSid === groupObjArr[i].users[j].socketId) {
          findGroupName = groupObjArr[i].groupName;
          socket.leave(groupObjArr[i].groupName);   //  socket Room 에서 삭제
          // console.log("socket에서 잘 삭제됐는지?", socket.rooms)
          groupObjArr[i].users.splice(j, 1)        // 우리가 따로 저장했던 배열에서도 삭제
          // console.log('*지웠나 체크*', groupObjArr[i].users)
          if (groupObjArr[i].users.length === 0) { // for 빈 소켓 룸([]) 삭제 1
            deleted.push(i);
          }
          break
        }
      }
    }
    for (let i = 0; i < deleted.length; i++) { // for 빈 소켓 룸([]) 삭제 2
      groupObjArr.splice(deleted[i], 1);
    }
    console.log("____________leave_group____________")
    socket.to(findGroupName).emit("leave_succ", {
      removeSid,
    })
    charMap[removeSid].groupNumber = 0;
  }

  socket.on("leave_Group", (removeSid) => {
    console.log("________ㅠㅠ 멀어졌다..____________ sid = ", removeSid)
 // 그룹 넘버 초기화
    removeUser(removeSid);
  });
});

//when caller make the room
function makeGroup(socket, nickname) {
  console.log( `socket ${socket.id}으로 makeGroup`, socket.id);
  initGroupObj = {
    groupName: ++groupName,
    currentNum: 0,
    users: [
      {
        socketId: socket.id,
        nickname,
      },
    ],
  };
  groupObjArr.push(initGroupObj);
  socket.join(groupName);
  console.log("join:", groupName)
  socket.emit("accept_join", [1]);
  return groupName;
}
//when callee join the room
function joinGroup(groupName, socket, nickname) {
  console.log("joinGroup");
  for (let i = 0; i < groupObjArr.length; ++i) { 
    console.log(`${i} 방 안에 있는 모든 유저의 소켓ID : `, groupObjArr[i].users);
    if (groupObjArr[i].groupName === groupName) {
      // Reject join the room
      if (groupObjArr[i].users.length >= MAXIMUM) {
        socket.emit("reject_join");
        return;
      }
      //Join the room
      groupObjArr[i].users.push({
        socketId: socket.id,
        nickname,
      });
      // ++groupObjArr[i].currentNum;
      
      socket.join(groupName);
      socket.emit("accept_join", groupObjArr[i].users);
    }
  }
}

module.exports = app;
