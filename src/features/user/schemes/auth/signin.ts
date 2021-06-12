import Joi, { ObjectSchema } from 'joi';

const loginSchema: ObjectSchema = Joi.object().keys({
    username: Joi.string().required().min(4).max(8).messages({
        'string.base': 'Username must be of type string',
        'string.min': 'Username must have a minimum length of {#limit}',
        'string.max': 'Username must have a maximum length of {#limit}',
        'string.empty': 'Username is a required field'
    }),
    password: Joi.string().required().min(4).max(8).messages({
        'string.base': 'Password must be of type string',
        'string.min': 'Password must have a minimum length of {#limit}',
        'string.max': 'Password must have a maximum length of {#limit}',
        'string.empty': 'Password is a required field'
    })
});

export { loginSchema };
