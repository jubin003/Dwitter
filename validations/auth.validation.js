import joi from 'joi';

export const registerSchema = joi.object({

    username: joi.string().min(3).max(30).required().messages({
        'string.min': 'Username should be at least 3 characters long',
        'string.max': 'Username should not exceed 30 characters',
        'any.required': 'Username field should not be empty'
    }),

    email: joi.string().email().required().messages({
        'string.email': 'Email should be in standard email format',
        'any.required': 'Email field should not be empty'
    }),

    password: joi.string().min(8).required().messages({
        'string.min': 'Password should be at least 8 characters long',
        'any.required': 'Password field should not be empty'
    }),

    bio: joi.string().max(300).optional().messages({
        'string.max': 'Bio limit is 300 characters'
    })

});

export const loginSchema = joi.object({

    email: joi.string().email().required().messages({
        'string.email': 'Email should be in standard email format',
        'string.empty': 'Email field should not be empty',
        'any.required': 'Email field is required'
    }),

    password: joi.string().required().messages({
        'string.empty': 'Password field should not be empty',
        'any.required': 'Password field is required'
    })

});