const {constantError} = require("./constantError")
const errorHandler = (error,req,res,next) =>{
    const statusCode = res.statusCode ? res.statusCode : 500;
    switch(statusCode)
    {
        case  constantError.VALIDATION_ERROR:
            res.json({title:'Validation Failed'
            , message: error.message
            , stackTrace: error.stack});
            break;
        case constantError.NOT_FOUND:
            res.json({title:'Not Found'
            , message: error.message
            , stackTrace: error.stack});
            break;
        case constantError.UNAUTHORIZED:
            res.json({title:'Unauthorized'
            , message: error.message
            , stackTrace: error.stack});
            break;   
        case constantError.FORBIDDEN:
            res.json({title:'Forbidden'
            , message: error.message,
             stackTrace: error.stack});
            break;  
        case constantError.SERVER_ERROR:
            res.json({title:'Server error'
            , message: error.message,
             stackTrace: error.stack});
            break;  
        default:
            console.log(res.statusCode)
            break;
    }

}
module.exports = [errorHandler]