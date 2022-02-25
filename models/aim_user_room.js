const Sequelize = require("sequelize");

module.exports = class Aim_user_room extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        hostId: {
          type: Sequelize.INTEGER(11),
        },
        mapId: {
          type: Sequelize.INTEGER(11),
        },
        title: {
          type: Sequelize.STRING(128),
        },
        description: {
          type: Sequelize.STRING(128),
        },
        status: {
          type: Sequelize.INTEGER(11),
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Aim_user_room",
        tableName: "aim_user_room",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Aim_user_room.belongsTo(db.Aim_user_info, {
      foreignKey: "hostId",
      sourceKey: "id",
    });
    db.Aim_user_room.belongsTo(db.Aim_map_images, {
      foreignKey: "mapId",
      sourceKey: "id",
    });
  }
};
