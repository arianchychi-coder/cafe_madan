const HamaeshModel = require("../models/hamaesh_model")
const AppError = require("../Error/error")
const Joi = require("joi")


const registerSchema = Joi.object({
    name:Joi.string().required(),
    phone:Joi.string().min(11).required(),
    role:Joi.string().required(),
    companyname:Joi.string().required()
})


const validate = (schema, data) => schema.validate(data)

const getAll = async(req,res,next)=>{
    try {
        const hamaesh = await HamaeshModel.getAll()

        const users = hamaesh.map(user=>({
            id:user._id.toString(),
            name:user.name,
            phone:user.phone,
            role:user.role,
            companyname:user.companyname
        }))

        res.json(users)

    } catch (error) {
        return next(
            new AppError("Err in server",500,"ERR_IN_SERVER")
        )
    }
}


const addInfo = async(req,res,next)=>{


    const {error} = validate(registerSchema, req.body)

    if (error) {
        throw new AppError(error.details[0].message,400,"VALIDATION_ERROR")
    }

    const {name,phone,role,companyname} = req.body


    try {
        
        const result = await HamaeshModel.addInfo(name,phone,role,companyname)

        if (!result) {
            throw new AppError("Err in save data",401,"ERR_IN_SAVE_DATA")
        }


        return res.status(200).json({
            message:"مشخصات شما با موفقیت ثبت شد"
        })

    } catch (error) {
        return next(
            new AppError("Err in server",500,"ERR_IN_SERVER")
        )
    }

}

module.exports = {
    getAll,addInfo
}