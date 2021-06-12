import Joi, { ObjectSchema } from 'joi';

const genderSchema: ObjectSchema = Joi.object().keys({
    gender: Joi.string().required()
});

const relationshipSchema: ObjectSchema = Joi.object().keys({
    relationship: Joi.string().required()
});

const birthdaySchema: ObjectSchema = Joi.object().keys({
    month: Joi.string().required(),
    day: Joi.string().required()
});

const aboutSchema: ObjectSchema = Joi.object().keys({
    about: Joi.string().required()
});

const quotesSchema: ObjectSchema = Joi.object().keys({
    quotes: Joi.string().required()
});

const placesSchema: ObjectSchema = Joi.object().keys({
    _id: Joi.string().allow(null, ''),
    city: Joi.string().allow(null, ''),
    country: Joi.string().allow(null, ''),
    year: Joi.string().allow(null, ''),
    month: Joi.string().allow(null, '')
});

const workSchema: ObjectSchema = Joi.object().keys({
    _id: Joi.string().allow(null, ''),
    company: Joi.string().allow(null, ''),
    position: Joi.string().allow(null, ''),
    city: Joi.string().allow(null, ''),
    description: Joi.string().allow(null, ''),
    from: Joi.string().allow(null, ''),
    to: Joi.string().allow(null, '')
});

const educationSchema: ObjectSchema = Joi.object().keys({
    _id: Joi.string().allow(null, ''),
    name: Joi.string().allow(null, ''),
    course: Joi.string().allow(null, ''),
    degree: Joi.string().allow(null, ''),
    from: Joi.string().allow(null, ''),
    to: Joi.string().allow(null, '')
});

const changePasswordSchema: ObjectSchema = Joi.object().keys({
    currentPassword: Joi.string().required().min(4).max(8).messages({
        'string.base': 'Password should be a type of string',
        'string.min': 'Password must have a minimum length of {#limit}',
        'string.max': 'Password should have a maximum length of {#limit}',
        'string.empty': 'Password is a required field'
    }),
    newPassword: Joi.string().required().min(4).max(8).messages({
        'string.base': 'Password should be a type of string',
        'string.min': 'Password must have a minimum length of {#limit}',
        'string.max': 'Password should have a maximum length of {#limit}',
        'string.empty': 'Password is a required field'
    }),
    confirmPassword: Joi.any().equal(Joi.ref('newPassword')).required().messages({
        'any.only': 'Confirm password does not match new password.'
    })
});

const notificationSettingsSchema: ObjectSchema = Joi.object().keys({
    messages: Joi.boolean().optional(),
    reactions: Joi.boolean().optional(),
    comments: Joi.boolean().optional(),
    follows: Joi.boolean().optional()
});

export {
    genderSchema,
    birthdaySchema,
    relationshipSchema,
    aboutSchema,
    quotesSchema,
    placesSchema,
    workSchema,
    educationSchema,
    changePasswordSchema,
    notificationSettingsSchema
};
