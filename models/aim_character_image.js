const Sequelize =require('sequelize');
const Aim_character_image = require('./aim_character_image');

module.exports = class Aim_user_info extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            images: {
                type:Sequelize.STRING(512),
                defaultValue: NULL
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Aim_user_info',
            tableName: 'aim_user_info',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
    static associate(db) {
        db.Aim_user_info.hasMany(db.Aim_map_images, { foreignKey: 'host_id', sourceKey:'id'});
    }
};