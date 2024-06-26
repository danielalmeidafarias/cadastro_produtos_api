import { Module, forwardRef } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductRepository } from './repository/product.repository';
import { AuthModule } from '../Auth/auth.module';
import { Product } from './entity/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { StoreModule } from '../Store/store.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    forwardRef(() => AuthModule),
    forwardRef(() => StoreModule),
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository, JwtService],
  exports: [ProductService, ProductRepository],
})
export class ProductModule {}
