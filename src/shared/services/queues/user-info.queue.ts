import { BaseQueue } from '@service/queues/base.queue';
import { IUserJobInfo } from '@user/interfaces/user.interface';
import { userInfoWorker } from '@worker/user-info.worker';

class UserInfoQueue extends BaseQueue {
    constructor() {
        super('usersInfo');
        this.processJob('updateUserInfoInCache', 5, userInfoWorker.updateUserInfo);
        this.processJob('updateSocialLinksInCache', 5, userInfoWorker.updateSocialLinks);
    }

    public addUserInfoJob(name: string, data: IUserJobInfo): void {
        this.addJob(name, data);
    }
}

export const userInfoQueue: UserInfoQueue = new UserInfoQueue();
