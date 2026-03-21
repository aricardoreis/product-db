import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesModule } from './sales/sales.module';
import { StoresModule } from './stores/stores.module';
import { PagerMiddleware } from './middleware/pager.middleware';
import { AuthModule } from './auth/auth.module';
import { SupabaseModule } from './shared/supabase/supabase.module';
import { SupabaseGuard } from './shared/supabase/supabase.guard';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule.forRoot({
      assignResponse: true,
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        serializers: {
          req(req) {
            const { authorization, cookie, ...safeHeaders } =
              req.raw?.headers || {};
            return {
              id: req.id,
              method: req.method,
              url: req.url,
              query: req.query,
              headers: safeHeaders,
            };
          },
        },
        transport: {
          targets: [
            {
              target: 'pino-pretty',
              options: {},
              level: 'debug',
            },
            ...(process.env.AXIOM_TOKEN
              ? [
                  {
                    target: '@axiomhq/pino',
                    options: {
                      dataset: process.env.AXIOM_DATASET || 'product-db-logs',
                      token: process.env.AXIOM_TOKEN,
                    },
                    level: 'info' as const,
                  },
                ]
              : []),
          ],
        },
      },
    }),
    ProductsModule,
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
    }),
    SalesModule,
    StoresModule,
    AuthModule,
    SupabaseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Enable guard by default, disable only in development
    ...(process.env.NODE_ENV !== 'development'
      ? [
          {
            provide: APP_GUARD,
            useClass: SupabaseGuard,
          },
        ]
      : []),
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PagerMiddleware)
      .forRoutes({ path: 'sales', method: RequestMethod.GET })
      .apply(PagerMiddleware)
      .forRoutes({ path: 'products', method: RequestMethod.GET });
  }
}
