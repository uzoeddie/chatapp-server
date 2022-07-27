import { authMiddleware } from '@global/helpers/auth-middleware';
import { ChangePassword } from '@user/controllers/edit/change-password';
import { EditBasicInfo } from '@user/controllers/edit/edit-basic-info';
import { Settings } from '@user/controllers/edit/update-settings';
import { Get } from '@user/controllers/get-profile';
import { Search } from '@user/controllers/search-user';
import express, { Router } from 'express';

class UserRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/user/all/:page', authMiddleware.checkAuthentication, Get.prototype.all);
    this.router.get('/user/profile', authMiddleware.checkAuthentication, Get.prototype.profile);
    this.router.get('/user/profile/posts/:username/:userId/:uId', authMiddleware.checkAuthentication, Get.prototype.profileAndPosts);
    this.router.get('/user/profile/:userId', authMiddleware.checkAuthentication, Get.prototype.profileByUserId);
    this.router.get('/user/profile/user/suggestions', authMiddleware.checkAuthentication, Get.prototype.randomUserSuggestions);
    this.router.get('/user/profile/search/:query', authMiddleware.checkAuthentication, Search.prototype.user);

    this.router.put('/user/profile/basic-info', authMiddleware.checkAuthentication, EditBasicInfo.prototype.info);
    this.router.put('/user/profile/social-links', authMiddleware.checkAuthentication, EditBasicInfo.prototype.social);
    this.router.put('/user/profile/change-password', authMiddleware.checkAuthentication, ChangePassword.prototype.update);
    this.router.put('/user/profile/settings', authMiddleware.checkAuthentication, Settings.prototype.update);

    return this.router;
  }
}

export const userRoutes: UserRoutes = new UserRoutes();
