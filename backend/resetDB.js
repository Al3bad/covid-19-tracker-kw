const Case = require("./database");

const resetDB = async () => {
    await Case.sync({ force: true });
    console.log("The table for the Case model was just (re)created!");
  
    await Case.create({ date: "2021-01-01", newCases: 285, newDeaths: 2, newRecoveries: 260, icu: 46, activeCases: 3156, newTests: 4161 })
    await Case.create({ date: "2021-01-02", newCases: 205, newDeaths: 1, newRecoveries: 213, icu: 47, activeCases: 3147, newTests: 3245 })
    await Case.create({ date: "2021-01-03", newCases: 269, newDeaths: 0, newRecoveries: 281, icu: 53, activeCases: 3135, newTests: 4712 })
    await Case.create({ date: "2021-01-04", newCases: 372, newDeaths: 1, newRecoveries: 240, icu: 51, activeCases: 3266, newTests: 5067 })
    await Case.create({ date: "2021-01-05", newCases: 312, newDeaths: 0, newRecoveries: 273, icu: 55, activeCases: 3305, newTests: 5180 })
    await Case.create({ date: "2021-01-06", newCases: 411, newDeaths: 0, newRecoveries: 231, icu: 56, activeCases: 3485, newTests: 10558 })
    await Case.create({ date: "2021-01-07", newCases: 540, newDeaths: 0, newRecoveries: 224, icu: 55, activeCases: 3801, newTests: 12279 })
    await Case.create({ date: "2021-01-08", newCases: 495, newDeaths: 2, newRecoveries: 244, icu: 54, activeCases: 4050, newTests: 11597 })
    await Case.create({ date: "2021-01-09", newCases: 427, newDeaths: 2, newRecoveries: 245, icu: 51, activeCases: 4230, newTests: 8015 })
    await Case.create({ date: "2021-01-10", newCases: 414, newDeaths: 1, newRecoveries: 279, icu: 46, activeCases: 4364, newTests: 7781 })
    await Case.create({ date: "2021-01-11", newCases: 527, newDeaths: 2, newRecoveries: 366, icu: 50, activeCases: 4523, newTests: 10087 })
    await Case.create({ date: "2021-01-12", newCases: 494, newDeaths: 1, newRecoveries: 202, icu: 47, activeCases: 4814, newTests: 10340 })
    await Case.create({ date: "2021-01-13", newCases: 539, newDeaths: 0, newRecoveries: 234, icu: 48, activeCases: 5119, newTests: 11567 })
    await Case.create({ date: "2021-01-14", newCases: 560, newDeaths: 0, newRecoveries: 252, icu: 49, activeCases: 5427, newTests: 10360 })
    await Case.create({ date: "2021-01-15", newCases: 530, newDeaths: 1, newRecoveries: 268, icu: 48, activeCases: 5688, newTests: 10862 })
    await Case.create({ date: "2021-01-16", newCases: 435, newDeaths: 0, newRecoveries: 349, icu: 48, activeCases: 5774, newTests: 8651 })
    await Case.create({ date: "2021-01-17", newCases: 378, newDeaths: 0, newRecoveries: 464, icu: 54, activeCases: 5688, newTests: 8251 })
    await Case.create({ date: "2021-01-18", newCases: 467, newDeaths: 1, newRecoveries: 354, icu: 56, activeCases: 5800, newTests: 8807 })
    await Case.create({ date: "2021-01-19", newCases: 578, newDeaths: 2, newRecoveries: 440, icu: 53, activeCases: 5936, newTests: 8845 })
    await Case.create({ date: "2021-01-20", newCases: 442, newDeaths: 1, newRecoveries: 484, icu: 54, activeCases: 5893, newTests: 10283 })
    await Case.create({ date: "2021-01-21", newCases: 570, newDeaths: 0, newRecoveries: 406, icu: 51, activeCases: 6057, newTests: 10712 })
    await Case.create({ date: "2021-01-22", newCases: 533, newDeaths: 1, newRecoveries: 481, icu: 48, activeCases: 6108, newTests: 10311 })
    await Case.create({ date: "2021-01-23", newCases: 534, newDeaths: 0, newRecoveries: 439, icu: 50, activeCases: 6203, newTests: 8978 })
    await Case.create({ date: "2021-01-24", newCases: 384, newDeaths: 0, newRecoveries: 507, icu: 48, activeCases: 6080, newTests: 7695 })
    await Case.create({ date: "2021-01-25", newCases: 492, newDeaths: 2, newRecoveries: 513, icu: 51, activeCases: 6057, newTests: 7928 })
    await Case.create({ date: "2021-01-26", newCases: 204, newDeaths: 1, newRecoveries: 229, icu: 42, activeCases: 3117, newTests: 2106 })
    await Case.create({ date: "2021-01-27", newCases: 204, newDeaths: 1, newRecoveries: 229, icu: 42, activeCases: 3117, newTests: 2106 })
};

module.exports =  resetDB;