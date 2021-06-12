import mongoose, { Document } from 'mongoose';

export interface IParticipant {
    sender: mongoose.Types.ObjectId;
    receiver: mongoose.Types.ObjectId;
}

export interface IConversationDocument extends Document {
    _id: mongoose.Types.ObjectId;
    participants: IParticipant[];
}
