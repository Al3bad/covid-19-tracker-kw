const { Sequelize, DataTypes } = require("sequelize");

// Database configuration
const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: "mysql",
  logging: false,
});

const Case = db.define("Case", {
  id: {
    type: DataTypes.INTEGER,
    unique: true,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    unique: true,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  newCases: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  newDeaths: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  newRecoveries: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  newTests: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  activeCases: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  icu: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Case;
