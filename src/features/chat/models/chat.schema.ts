import mongoose, { Model, model, Schema } from 'mongoose';
import { IMessageDocument } from '@chat/interfaces/chat.interface';

const messageSchema: Schema = new Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    senderName: { type: String },
    receiverName: { type: String },
    body: { type: String, default: '' },
    gifUrl: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    images: [{ type: String, default: '' }],
    createdAt: { type: Date, default: Date.now }
});

const MessageModel: Model<IMessageDocument> = model<IMessageDocument>('Message', messageSchema, 'Message');
export { MessageModel };
