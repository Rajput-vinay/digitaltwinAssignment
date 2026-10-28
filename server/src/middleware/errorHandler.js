

export class HttpError extends Error {
    constructor (status,message,error){
        super(message)
        this.status = status
        this.error = error
    }
}

export function notFound(req,_res,next){
    next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`))
}

export function errorHandler(err,_req,res,_next){
    let {status = 500 , message,errors} = err;

    if(err.name === 'ValidationError' && err.errors){
        status = 400;
        message = 'Validation Error';
        errors = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
    }else if(err.name === 'CastError'){
        status = 400;
        message = 'Cast Error';
    }else if(err.code === 11000){
        status = 400;
        message = 'Duplicate Error';
    }else if(err.type === 'entity.parse.faile'){
        status = 400;
        message = 'Request body is not valid JSON';
    }

    if(status >=500) {
        console.error(err);
    }

    res.status(status).json({
        message:status>=500 ? 'Internal server error' : message, ...(errors && {errors})
    })
}