const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const GuildSetting = sequelize.define('GuildSetting', {
        guildId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            primaryKey: true
        },
        timeoutDuration: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 300 // 5 minutes in seconds
        },
        defaultLanguage: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'en'
        }
    });
    
    return GuildSetting;
}; 