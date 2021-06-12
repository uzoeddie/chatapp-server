/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { authUserPayload } from '@root/mocks/auth.mock';
import { fileDocument, imagesMockRequest, imagesMockResponse } from '@root/mocks/image.mock';
import { ImageModel } from '@image/models/image.schema';
import { Get } from '@image/controllers/get-images';

jest.useFakeTimers();

describe('Get', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('should send correct json response', async () => {
        const req: Request = imagesMockRequest({}, {}, authUserPayload, { imageId: '12345' }) as Request;
        const res: Response = imagesMockResponse();
        jest.spyOn(ImageModel, 'findOne');
        jest.spyOn(Promise, 'all');
        jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce(fileDocument);

        await Get.prototype.images(req, res);
        expect(ImageModel.findOne).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'User images',
            images: fileDocument,
            notification: false
        });
    });
});
