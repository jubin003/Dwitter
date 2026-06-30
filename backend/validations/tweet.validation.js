import joi from 'joi';

export const createTweetSchema = joi.object({

    content: joi.string().min(1).max(280).required().messages({
        'string.min': 'Tweet content cannot be empty',
        'string.max': 'Tweet content cannot exceed 280 characters',
        'string.empty': 'Tweet content should not be empty',
        'any.required': 'Tweet content is required'
    })

});
