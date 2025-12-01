const {DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('user', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        username: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true,
            validate: {
                is: /^\w{3,}$/
            }
        },
        role: {
            allowNull: false,
            type: DataTypes.ENUM('admin', 'user')
        },
        password: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: false
        }
    });
}
