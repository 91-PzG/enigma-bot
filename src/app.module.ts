import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import { HllEventModule } from './hllevents/hllevent.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [databaseConfig] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (service: ConfigService) => ({
        type: 'postgres',
        host: service.get('database.host'),
        port: service.get('database.port'),
        username: service.get('database.username'),
        password: service.get('database.password'),
        database: 'enigmabot',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: service.get('database.sync'),
      }),
      inject: [ConfigService],
    }),

    HllEventModule,
  ],
})
export class AppModule {}
