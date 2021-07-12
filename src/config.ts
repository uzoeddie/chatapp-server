import dotenv from 'dotenv';
import cloudinary from 'cloudinary';
import bunyan from 'bunyan';

dotenv.config({});

class Config {
    public DATABASE_URL: string | undefined;
    public JWT_TOKEN: string | undefined;
    public NODE_ENV: string | undefined;
    public SECRET_KEY_ONE: string | undefined;
    public SECRET_KEY_TWO: string | undefined;
    public CLIENT_URL: string | undefined;
    public CLOUD_NAME: string | undefined;
    public CLOUD_API_KEY: string | undefined;
    public CLOUD_API_SECRET: string | undefined;
    public REDIS_HOST: string | undefined;
    public SENDER_EMAIL: string | undefined;
    public SENDER_EMAIL_PASSWORD: string | undefined;
    public SENDGRID_API_KEY: string | undefined;
    public EC2_URL: string | undefined;

    private readonly DEFAULT_DATABASE_URL = 'mongodb://localhost:27017/chatapp-backend-test';
    private readonly DEFAULT_CLIENT_URL = 'http://localhost:4200'

    constructor() {
        this.DATABASE_URL = process.env.DATABASE_URL || this.DEFAULT_DATABASE_URL;
        this.JWT_TOKEN = process.env.JWT_TOKEN || '1234';
        this.NODE_ENV = process.env.NODE_ENV || '';
        this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE || '';
        this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO || '';
        this.CLIENT_URL = process.env.CLIENT_URL || this.DEFAULT_CLIENT_URL;
        this.CLOUD_NAME = process.env.CLOUD_NAME || '';
        this.CLOUD_API_KEY = process.env.CLOUD_API_KEY || '';
        this.CLOUD_API_SECRET = process.env.CLOUD_API_SECRET || '';
        this.REDIS_HOST = process.env.REDIS_HOST || '';
        this.SENDER_EMAIL = process.env.SENDER_EMAIL || '';
        this.SENDER_EMAIL_PASSWORD = process.env.SENDER_EMAIL_PASSWORD || '';
        this.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || 'SG.1234';
        this.EC2_URL = process.env.EC2_URL || '';
    }

    public createLogger(name: string): bunyan {
        return bunyan.createLogger({ name, level: 'debug' });
    }

    public validateConfig(): void {
        for (const [key, value] of Object.entries(this)) {
            if (value === undefined) {
                throw new Error(`Configuration ${key} is undefined.`);
            }
        }
    }

    public cloudinaryConfig(): void {
        cloudinary.v2.config({
            cloud_name: this.CLOUD_NAME,
            api_key: this.CLOUD_API_KEY,
            api_secret: this.CLOUD_API_SECRET
        });
    }
}

export const config: Config = new Config();
