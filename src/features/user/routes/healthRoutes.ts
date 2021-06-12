import express, { Router, Request, Response } from 'express';
import moment from 'moment';
import axios from 'axios';
import { performance } from 'perf_hooks';
import HTTP_STATUS from 'http-status-codes';
import { config } from '@root/config';

class HealthRoute {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.get('/health', (_req: Request, res: Response) => {
            res.status(HTTP_STATUS.OK).send(
                `Health: Server instance is healthy with process id ${process.pid} on ${moment().format('LL')}`
            );
        });

        return this.router;
    }

    public instance(): Router {
        this.router.get('/instance', async (_req: Request, res: Response) => {
            const response = await axios({
                method: 'get',
                url: config.EC2_URL
            });
            res.status(HTTP_STATUS.OK).send(
                `Server is running on EC2 instance with id ${response.data} and process id ${process.pid} on ${moment().format('LL')}`
            );
        });

        return this.router;
    }

    public fiboRoutes(): Router {
        this.router.get('/fibo/:num', async (req: Request, res: Response) => {
            const start: number = performance.now();
            const result: number = this.fibo(parseInt(req.params.num, 10));
            const end: number = performance.now();

            const response = await axios({
                method: 'get',
                url: config.EC2_URL
            });
            res.status(HTTP_STATUS.OK).send(
                `Fibonacci series of ${req.params.num} is ${result} and it took ${end - start}ms with EC2 instance of ${
                    response.data
                } process id ${process.pid} on ${moment().format('LL')}`
            );
        });

        return this.router;
    }

    private fibo(data: number): number {
        if (data < 2) {
            return 1;
        } else {
            return this.fibo(data - 2) + this.fibo(data - 1);
        }
    }
}

export const healthRoute: HealthRoute = new HealthRoute();
