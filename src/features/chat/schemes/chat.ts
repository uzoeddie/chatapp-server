import Joi, { ObjectSchema } from 'joi';

const addChatSchema: ObjectSchema = Joi.object().keys({
    conversationId: Joi.string().optional().allow(null, ''),
    receiverId: Joi.object().required(),
    receiverName: Joi.string().required(),
    body: Joi.string().optional().allow(null, ''),
    gifUrl: Joi.string().optional().allow(null, ''),
    profilePicture: Joi.string().optional().allow(null, ''),
    isRead: Joi.boolean().optional(),
    selectedImages: Joi.array(),
    createdAt: Joi.date().optional()
});

const markChatSchema: ObjectSchema = Joi.object().keys({
    conversationId: Joi.string().optional().allow(null, ''),
    receiverId: Joi.string().required(),
    userId: Joi.string().required()
});

export { addChatSchema, markChatSchema };
