const Sequelize = require("sequelize");
const Aim_user_info = require("../models/aim_user_info");
module.exports = class Aim_map_images extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        /* 시퀄라이즈는 알아서 id를 기본키로 연결하므로 id컬럼은 넣을 필요없다. */
        image: {
          type: Sequelize.STRING(200),
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Aim_map_images",
        tableName: "aim_map_images",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  // static associate(db) {
  //   db.Aim_map_images.belongsTo(db.Aim_user_info, {
  //     foreignKey: "hostId",
  //     targetKey: "id",
  //   });
  // }
};
