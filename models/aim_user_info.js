const Sequelize =require('sequelize');
const Map_images = require('../models/map_images');

module.exports = class Aim_user_info extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            /* 시퀄라이즈는 알아서 id를 기본키로 연결하므로 id컬럼은 넣을 필요없다. */
            // id: {
            //     type:Sequelize.INTEGER.UNSIGNED(11),
            //     primaryKey: true, 
            //     allowNull:false,
            //     unique: true,
            //     autoIncrement: true,
            // },
            accessToken: {
                type:Sequelize.STRING(512),
                allowNull: false,
                unique: true, 
            },
            email: {
                type:Sequelize.STRING(45),
                allowNull: false,
                unique: true, 
            },
            password: {
                type:Sequelize.STRING(20),
            },
            nickname: {
                type:Sequelize.STRING(20),
                unique: true, 
            },
            character: {
                type:Sequelize.STRING(200),
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
        db.Aim_user_info.hasMany(db.Map_images, { foreignKey: 'host_id', sourceKey:'id'});
    }
};