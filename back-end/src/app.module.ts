import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityModule } from './activity/activity.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MeModule } from './me/me.module';
import { SeedModule } from './seed/seed.module';
import { UserModule } from './user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { JwtModule, JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import { JwtPayload } from './auth/types/jwtPayload.dto';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [JwtModule],
      inject: [JwtService, ConfigService],
      useFactory: async (
        jwtService: JwtService,
        configService: ConfigService,
      ) => ({
        autoSchemaFile: 'schema.gql',
        sortSchema: true,
        playground: configService.get<string>('NODE_ENV') !== 'production',
        buildSchemaOptions: { numberScalarMode: 'integer' },
        context: async ({ req, res }: { req: Request; res: Response }) => {
          const token = req.cookies?.['jwt'] as string | undefined;

          let jwtPayload: JwtPayload | null = null;
          if (token) {
            try {
              jwtPayload = (await jwtService.verifyAsync(token, {
                secret: configService.get<string>('JWT_SECRET'),
              })) as JwtPayload;
            } catch {
              // Invalid or expired token — leave jwtPayload null.
              // AuthGuard will reject protected routes; public routes proceed normally.
            }
          }

          return {
            jwtPayload,
            req,
            res,
          };
        },
      }),
    }),
    AuthModule,
    UserModule,
    MeModule,
    ActivityModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class BaseAppModule {}

@Module({
  imports: [
    BaseAppModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
  ],
})
export class AppModule {}
