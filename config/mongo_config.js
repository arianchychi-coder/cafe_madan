require("dotenv").config()
const {MongoClient} = require("mongodb")
const AppError = require("../Error/error")


const client = new MongoClient(process.env.MONGO_URL2)


async function connectMongo() {
    try {
        await client.connect()
        console.log("Connect to DB: ",process.env.MONGO_URL2)
        const db = client.db(process.env.DB_NAME)
        return db
    } catch (error) {
       throw new AppError("Err in config",400,"ERROR_IN_CONFIG")
    }
}

module.exports = connectMongo