import Joi, { ObjectSchema } from 'joi';

const emailSchema: ObjectSchema = Joi.object().keys({
    email: Joi.string().email().required().messages({
        'string.base': 'Field must be valid',
        'string.required': 'Field must be valid',
        'string.email': 'Field must be valid'
    })
});

const passwordSchema: ObjectSchema = Joi.object().keys({
    password: Joi.string().required().min(4).max(8).messages({
        'string.base': 'Password should be of type string',
        'string.min': 'Password must have a minimum length of {#limit}',
        'string.max': 'Password must have a maximum length of {#limit}',
        'string.empty': 'Password is a required field'
    }),
    cpassword: Joi.string().required().valid(Joi.ref('password')).messages({
        'any.only': 'Passwords should match',
        'any.required': 'Confirm password is a required field'
    })
});

export { emailSchema, passwordSchema };
