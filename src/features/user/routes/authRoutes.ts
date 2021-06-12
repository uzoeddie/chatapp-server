import { Password } from '@user/controllers/auth/password';
import { SignIn } from '@user/controllers/auth/signin';
import { SignOut } from '@user/controllers/auth/signout';
import { SignUp } from '@user/controllers/auth/signup';
import express, { Router } from 'express';

class AuthRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.post('/signup', SignUp.prototype.create);
        this.router.post('/signin', SignIn.prototype.read);
        this.router.post('/forgot-password', Password.prototype.create);
        this.router.post('/reset-password/:token', Password.prototype.update);

        return this.router;
    }

    public signoutRoute(): Router {
        this.router.get('/signout', SignOut.prototype.update);

        return this.router;
    }
}

export const authRoutes: AuthRoutes = new AuthRoutes();
