import { Request, Response } from 'express';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '@global/helpers/cloudinary-upload';
import { Add } from '@chat/controllers/add-chat-message';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { addChatSchema } from '@chat/schemes/chat';
import { IChatMessage } from '@chat/interfaces/chat.interface';
import { connectedUsersMap } from '@socket/user';
import { socketIOChatObject } from '@socket/chat';

export class AddMessage {
    @joiValidation(addChatSchema)
    public async image(req: Request, res: Response): Promise<void> {
        const { selectedImages } = req.body;
        let uploadResult: string[] = [];
        const chatData: IChatMessage = {
            senderId: {
                _id: req.currentUser?.userId,
                username: req.currentUser?.username,
                email: req.currentUser?.email,
                avatarColor: req.currentUser?.avatarColor,
                profilePicture: req.body.profilePicture
            },
            conversationId: req.body.conversationId,
            receiverId: req.body.receiverId,
            senderName: req.currentUser!.username,
            body: req.body.body,
            isRead: req.body.isRead,
            createdAt: req.body.createdAt,
            gifUrl: req.body.gifUrl,
            images: [...selectedImages]
        };
        const senderSocketId: string = connectedUsersMap.get(req.currentUser!.userId) as string;
        const receiverSocketId: string = connectedUsersMap.get(req.body.receiverId._id) as string;
        socketIOChatObject.to(senderSocketId).to(receiverSocketId).emit('message received', chatData);

        for (const file of selectedImages) {
            const result: UploadApiResponse = (await uploads(file)) as UploadApiResponse;
            const url = `http://res.cloudinary.com/ratingapp/image/upload/v${result.version}/${result.public_id}`;
            uploadResult = [...uploadResult, url];
        }

        if (uploadResult.length === selectedImages.length) {
            req.body.selectedImages = uploadResult;
            await Add.prototype.message(req, res);
        }
    }
}
