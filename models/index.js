"use strict";

// const fs = require('fs');
// const path = require('path');
const Sequelize = require("sequelize");
const Aim_user_info = require("./aim_user_info");
const Aim_map_images = require("./aim_map_images");
const Aim_character_images = require("./aim_character_image");
const Aim_user_room = require("./aim_user_room");
// const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
//DB table require
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// fs
//   .readdirSync(__dirname)
//   .filter(file => {
//     return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
//   })
//   .forEach(file => {
//     const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
//     db[model.name] = model;
//   });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

//생성한 models을 models/index.js와 연결

db.Aim_user_info = Aim_user_info;
db.Aim_map_images = Aim_map_images;
db.Aim_character_images = Aim_character_images;
db.Aim_user_room = Aim_user_room;

Aim_user_info.init(sequelize);
Aim_map_images.init(sequelize);
Aim_character_images.init(sequelize);
Aim_user_room.init(sequelize);

Aim_user_info.associate(db);
// Aim_map_images.associate(db);
Aim_user_room.associate(db);

module.exports = db;
