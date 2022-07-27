import { authMiddleware } from '@global/helpers/auth-middleware';
import { CurrentUser } from '@auth/controllers/current-user';
import express, { Router } from 'express';

class CurrentUserRoute {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/currentuser', authMiddleware.checkAuthentication, CurrentUser.prototype.read);

    return this.router;
  }
}

export const currentUserRoute: CurrentUserRoute = new CurrentUserRoute();
