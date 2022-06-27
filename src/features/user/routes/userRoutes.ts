import { authMiddleware } from '@global/helpers/auth-middleware';
// import { AddBasicInfo } from '@user/controllers/user/add/add-basic-info';
// import { AddDetails } from '@user/controllers/user/add/add-details';
// import { AddPlaces } from '@user/controllers/user/add/add-places';
// import { AddWorkAndEducation } from '@user/controllers/user/add/add-work-and-education';
// import { DeletePlacesLived } from '@user/controllers/user/delete/delete-places';
// import { DeleteWorkAndEducation } from '@user/controllers/user/delete/delete-work-and-education';
import { ChangePassword } from '@user/controllers/user/edit/change-password';
import { EditBasicInfo } from '@user/controllers/user/edit/edit-basic-info';
// import { EditWorkAndEducation } from '@user/controllers/user/edit/edit-work-and-education';
import { Settings } from '@user/controllers/user/edit/update-settings';
import { Get } from '@user/controllers/user/get-profile';
import { Search } from '@user/controllers/user/search-user';
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
