import { ObjectID, ObjectId } from 'mongodb';
import mongoose, { Aggregate } from 'mongoose';
import { IMessageDocument, IChatMessage, IQueryMessage } from '@chat/interfaces/chat.interface';
import { IConversationDocument } from '@chat/interfaces/conversation.interface';
import { MessageModel } from '@chat/models/chat.schema';
import { ConversationModel } from '@chat/models/conversation.schema';
import { IQuerySort } from '@comment/interfaces/comment.interface';

class Chat {
    public async addMessageToDB(data: IMessageDocument): Promise<void> {
        const conversation: IConversationDocument[] = await ConversationModel.aggregate([
            {
                $match: {
                    $or: [
                        {
                            participants: {
                                $elemMatch: {
                                    sender: new ObjectId(data.senderId),
                                    receiver: new ObjectId(data.receiverId)
                                }
                            }
                        },
                        {
                            participants: {
                                $elemMatch: {
                                    sender: new ObjectId(data.receiverId),
                                    receiver: new ObjectId(data.senderId)
                                }
                            }
                        }
                    ]
                }
            }
        ]).exec();

        if (conversation.length === 0) {
            await ConversationModel.create({
                _id: data.conversationId,
                participants: [{ sender: data.senderId, receiver: data.receiverId }]
            });
        }

        const message: IMessageDocument = new MessageModel({
            _id: data._id,
            conversationId: data.conversationId,
            senderId: data.senderId,
            senderName: data.senderName,
            receiverId: data.receiverId,
            receiverName: data.receiverName,
            body: data.body,
            gifUrl: data.gifUrl,
            isRead: data.isRead,
            images: data.images,
            createdAt: data.createdAt
        });
        await message.save();
    }

    public async getMessages(query: IQueryMessage, sort?: IQuerySort): Promise<IChatMessage[]> {
        return new Promise((resolve) => {
            const messages: Aggregate<IChatMessage[]> = MessageModel.aggregate([
                { $match: query },
                { $lookup: { from: 'User', localField: 'receiverId', foreignField: '_id', as: 'receiverId' } },
                { $unwind: '$receiverId' },
                { $lookup: { from: 'User', localField: 'senderId', foreignField: '_id', as: 'senderId' } },
                { $unwind: '$senderId' },
                {
                    $project: {
                        _id: 1,
                        'senderId._id': 1,
                        'senderId.username': 1,
                        'senderId.avatarColor': 1,
                        'senderId.email': 1,
                        'senderId.profilePicture': 1,
                        'receiverId._id': 1,
                        'receiverId.username': 1,
                        'receiverId.avatarColor': 1,
                        'receiverId.email': 1,
                        'receiverId.profilePicture': 1,
                        createdAt: 1,
                        body: 1,
                        conversationId: 1,
                        images: 1,
                        isRead: 1,
                        senderName: 1,
                        gifUrl: 1
                    }
                },
                { $sort: sort }
            ]);
            resolve(messages);
        });
    }

    public async markMessagesAsRead(conversationId: ObjectID): Promise<void> {
        await MessageModel.updateMany({ conversationId }, { $set: { isRead: true } }).exec();
    }

    public conversationAggregate(userId: string, receiverId: string): Promise<IConversationDocument[]> {
        return new Promise((resolve) => {
            const conversation: Aggregate<IConversationDocument[]> = ConversationModel.aggregate([
                {
                    $match: {
                        $or: [
                            {
                                participants: {
                                    $elemMatch: {
                                        sender: mongoose.Types.ObjectId(userId),
                                        receiver: mongoose.Types.ObjectId(receiverId)
                                    }
                                }
                            },
                            {
                                participants: {
                                    $elemMatch: {
                                        sender: mongoose.Types.ObjectId(receiverId),
                                        receiver: mongoose.Types.ObjectId(userId)
                                    }
                                }
                            }
                        ]
                    }
                }
            ]);
            resolve(conversation);
        });
    }
}

export const chatService: Chat = new Chat();
