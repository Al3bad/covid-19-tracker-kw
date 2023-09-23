import { Database } from "bun:sqlite";

const db = new Database(":memory:", { create: true });
const query = db.query("select 'Hello world' as message;");
query.get(); // => { message: "Hello world" }

export const createRecordTable = () => {
  const query = db.query(`
    CREATE TABLE IF NOT EXISTS record (
      id INTEGER PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      newCases INTEGER NOT NULL,
      newRecoveries INTEGER NOT NULL,
      newTests INTEGER NOT NULL,
      newDeaths INTEGER NOT NULL,
      activeCases INTEGER NOT NULL,
      icu INTEGER NOT NULL
    )
  `);
  query.run();
};

export const insertRecord = (newRecord: {
  $date: string;
  $newCases: number;
  $newRecoveries: number;
  $newTests: number;
  $newDeaths: number;
  $activeCases: number;
  $icu: number;
}) => {
  const query = db.query(`
    INSERT INTO record (date, newCases, newRecoveries, newTests, newDeaths, activeCases, icu)
    VALUES ($date, $newCases, $newRecoveries, $newTests, $newDeaths, $activeCases, $icu)
  `);
  query.run(newRecord);
};

export const getRecords = (limit?: number) => {
  const query = db.query(`
    SELECT * FROM record;
  `);
  return query.all();
};

export const getRecord = (recordID: number) => {
  const query = db.query(`
    SELECT * FROM record WHERE ?;
  `);
  return query.get(recordID);
};

// ========================================================================

// const { Sequelize, DataTypes } = require("sequelize");
//
// // Database configuration
// const db = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASS,
//   {
//     host: process.env.DB_HOST,
//     dialect: "mysql",
//     logging: false,
//   }
// );
//
// const Case = db.define("Case", {
//   id: {
//     type: DataTypes.INTEGER,
//     unique: true,
//     primaryKey: true,
//     autoIncrement: true,
//     allowNull: false,
//   },
//   date: {
//     type: DataTypes.DATEONLY,
//     unique: true,
//     defaultValue: DataTypes.NOW,
//     allowNull: false,
//   },
//   newCases: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   newDeaths: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   newRecoveries: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   newTests: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   activeCases: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   icu: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
// });
//
// module.exports = Case;
