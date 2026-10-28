const { ObjectId } = require("mongodb")
const connectMongo = require("../config/mongo_config")
const AppError = require("../Error/error")

class HamaeshModel {
    getAll = async()=>{
        try {
            const db = await connectMongo()
            const collection = db.collection("hamaesh_collection")
            const result = await collection.find({}).toArray()
            return result
        } catch (error) {
            throw new AppError("Err in model",400,"ERROR_IN_MODEL")
        }
    }



    getById = async(id)=>{
        try {
            const db = await connectMongo()
            const collection = db.collection("hamaesh_collection")
            const result =await collection.findOne({_id:new ObjectId(id)})
            return result
        } catch (error) {
            throw new AppError("Err in model",400,"ERROR_IN_MODEL")
        }
    }


    getByName = async(name)=>{
        try {
            const db = await connectMongo()
            const collection = db.collection("hamaesh_collection")
            const result =await collection.findOne({name})
            return result
        } catch (error) {
            throw new AppError("Err in model",400,"ERROR_IN_MODEL")
        }
    }

    getByPhone = async(phone)=>{
        try {
            const db = await connectMongo()
            const collection = db.collection("hamaesh_collection")
            const result =await collection.findOne({phone})
            return result
        } catch (error) {
            throw new AppError("Err in model",400,"ERROR_IN_MODEL")
        }
    }


    getByRole = async(role)=>{
        try {
            const db = await connectMongo()
            const collection = db.collection("hamaesh_collection")
            const result =await collection.findOne({role})
            return result
        } catch (error) {
            throw new AppError("Err in model",400,"ERROR_IN_MODEL")
        }
    }


     getByCompanyName = async(companyname)=>{
        try {
            const db = await connectMongo()
            const collection = db.collection("hamaesh_collection")
            const result =await collection.findOne({companyname})
            return result
        } catch (error) {
            throw new AppError("Err in model",400,"ERROR_IN_MODEL")
        }
    }


    addInfo = async(name,phone,role,companyname)=>{
        try {
            const db = await connectMongo()
            const collection = db.collection("hamaesh_collection")
            const result = await collection.insertOne({name,phone,role,companyname})
            return result
        } catch (error) {
            throw new AppError("Err in model",400,"ERROR_IN_MODEL")
        }
    }
}

module.exports = new HamaeshModel()