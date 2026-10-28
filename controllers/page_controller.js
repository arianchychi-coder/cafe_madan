const path = require("node:path")
const AppError = require("../Error/error")


const frogs = [
    {name:"index",file:"index.html"},
    {name:"admin",file:"adminlogin.html"},   
]


const getPage = async(req,res)=>{
    const nameURL = decodeURIComponent(req.params.name)
    const frog = frogs.find(c=>c.name === nameURL)

    if (!frog) {
        throw new AppError("Page not found",404,"PAGE_NOT_FOUND")
    }

    res.sendFile(path.join(__dirname,"..","public",frog.file.trim()))
}


module.exports = {
    getPage
}