const Sequelize = require("sequelize");

module.exports = class Aim_character_images extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        image: {
          type: Sequelize.STRING(512),
          defaultValue: "NULL",
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Aim_character_images",
        tableName: "aim_character_images",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  //   static associate(db) {
  //     db.Aim_user_info.hasMany(db.Aim_map_images, {
  //       foreignKey: "hostId",
  //       sourceKey: "id",
  //     });
  //   }
};
