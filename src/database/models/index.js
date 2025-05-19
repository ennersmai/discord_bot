const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../data/database.sqlite'),
    logging: false // Set to console.log to see SQL queries
});

// Import models
const UserExemption = require('./userExemption')(sequelize);
const RoleExemption = require('./roleExemption')(sequelize);
const MonitoredChannel = require('./monitoredChannel')(sequelize);
const GuildSetting = require('./guildSetting')(sequelize);
const TimeoutLog = require('./timeoutLog')(sequelize);

// Define associations
GuildSetting.hasMany(MonitoredChannel);
MonitoredChannel.belongsTo(GuildSetting);

GuildSetting.hasMany(UserExemption);
UserExemption.belongsTo(GuildSetting);

GuildSetting.hasMany(RoleExemption);
RoleExemption.belongsTo(GuildSetting);

GuildSetting.hasMany(TimeoutLog);
TimeoutLog.belongsTo(GuildSetting);

// Function to sync all models with the database
async function syncDatabase() {
    try {
        await sequelize.sync();
        console.log('Database synchronized successfully');
    } catch (error) {
        console.error('Error synchronizing database:', error);
    }
}

module.exports = {
    sequelize,
    UserExemption,
    RoleExemption,
    MonitoredChannel,
    GuildSetting,
    TimeoutLog,
    syncDatabase
}; 