import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { type } from 'os';

@Module({
    imports: [MongooseModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
            uri: "mongodb://"
                + configService.get('DB_USERNAME')
                + ":"
                + configService.get('DB_PASSWORD')
                + "@localhost:" 
                + configService.get('DB_PORT') 
                + "/" 
                + configService.get('DB_NAME'),
        })
    })],
    controllers: [],
    providers: [],
})
export class DatabaseModule {}
