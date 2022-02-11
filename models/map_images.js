const Sequelize =require('sequelize');
const Aim_user_info = require('../models/aim_user_info');
module.exports = class Map_images extends Sequelize.Model {
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
            host_id: {
                type:Sequelize.STRING(45),
                allowNull: false,
            },
            map_s3_addr: {
                type:Sequelize.STRING(200),
                defaultValue: "NULL",
            },
            title: {
                type:Sequelize.STRING(100),
                defaultValue: "NULL",
            },
            desc: {
                type:Sequelize.STRING(100),
                defaultValue: "NULL",
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
        db.Map_images.belongsTo(db.Aim_user_info, { foreignKey: 'host_id', targetKey:'id'});
    }
};