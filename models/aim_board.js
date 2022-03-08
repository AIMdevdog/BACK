const Sequelize = require("sequelize");

module.exports = class Aim_board extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        // id: {
        //   type: Sequelize.INTEGER(11),
        // },
        roomId: {
          type: Sequelize.INTEGER(11),
        },
        userId: {
          type: Sequelize.INTEGER(11),
        },
        contents: {
          type: Sequelize.STRING(600),
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Aim_board",
        tableName: "aim_board",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Aim_board.belongsTo(db.Aim_user_room, {
      foreignKey: "roomId",
      sourceKey: "id",
    });
    db.Aim_board.belongsTo(db.Aim_user_info, {
      foreignKey: "userId",
      sourceKey: "id",
    });
  }
};
