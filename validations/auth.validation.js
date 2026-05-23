import joi from 'joi';

export const registerSchema = joi.object({

    username:joi.string().min(3).max(30).required().message({
        'string.min':'lenght of username should be atleast 3',
        'string.max':'lenght of username should not exceed 30',
        'any.required':'field should not be empty'
    }),

    email:joi.string().email().required().message({
        'string.email':'should be in standard mail format',
        'any.required':'emil field should not be empty'
    }),
    password:joi.string().required().min(8).message({
        'string.min':'length of password should be >=8',
        'any.required':'field should not be empty'
    }),
    boi:joi.string().max(300).message({
        'string.max':'limit for boi is 300'
    })

})