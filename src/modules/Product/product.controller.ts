import { AuthGuard } from './../auth/auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import {
  CreateProductStoreDTO,
  CreateProductUserDTO,
} from './dto/create-product.dto';
import {
  DeleteProductBodyDTO,
  DeleteProductStoreQueryDTO,
  DeleteProductUserQueryDTO,
} from './dto/delete-product.dto';
import {
  UpdateProductBodyDTO,
  UpdateProductStoreQuery,
  UpdateProductUserQuery,
} from './dto/update-product.dto';
import { SearchProductDTO } from './dto/search-product.dto';

@Controller()
export class ProductController {
  constructor(private productService: ProductService) {}

  @UseGuards(AuthGuard)
  @Post('/product/create')
  async create(
    @Body()
    {
      name,
      description,
      price,
      quantity,
      access_token,
      refresh_token,
    }: CreateProductStoreDTO,
  ) {
    return this.productService.createProduct({
      name,
      description,
      price,
      quantity,
      access_token,
      refresh_token,
    });
  }

  @UseGuards(AuthGuard)
  @Post('/user/product/create')
  async createUserStoreProduct(
    @Body()
    {
      access_token,
      refresh_token,
      name,
      description,
      price,
      quantity,
      storeId,
    }: CreateProductUserDTO,
  ) {
    return this.productService.createUserStoreProduct({
      storeId,
      name,
      description,
      price,
      quantity,
      access_token,
      refresh_token,
    });
  }

  @UseGuards(AuthGuard)
  @Put('/product/update')
  async update(
    @Body()
    {
      access_token,
      refresh_token,
      newName,
      newDescription,
      newPrice,
      newQuantity,
    }: UpdateProductBodyDTO,
    @Query() { productId }: UpdateProductStoreQuery,
  ) {
    return this.productService.updateProduct({
      access_token,
      refresh_token,
      productId,
      newName,
      newDescription,
      newPrice,
      newQuantity,
    });
  }

  @UseGuards(AuthGuard)
  @Put('/user/product/update')
  async updateUserStoreProduct(
    @Body()
    {
      access_token,
      refresh_token,
      newName,
      newDescription,
      newPrice,
      newQuantity,
    }: UpdateProductBodyDTO,
    @Query() { productId, storeId }: UpdateProductUserQuery,
  ) {
    return this.productService.updateUserStoreProduct({
      productId,
      storeId,
      access_token,
      refresh_token,
      newName,
      newDescription,
      newPrice,
      newQuantity,
    });
  }

  @UseGuards(AuthGuard)
  @Delete('/product/delete')
  async delete(
    @Body() { access_token, refresh_token }: DeleteProductBodyDTO,
    @Query() { productId }: DeleteProductStoreQueryDTO,
  ) {
    return this.productService.deleteProduct({
      productId,
      access_token,
      refresh_token,
    });
  }

  @UseGuards(AuthGuard)
  @Delete('/user/product/delete')
  async deleteUserStoreProduct(
    @Body() { access_token, refresh_token }: DeleteProductBodyDTO,
    @Query() { productId, storeId }: DeleteProductUserQueryDTO,
  ) {
    return this.productService.deleteUserStoreProduct({
      productId,
      access_token,
      refresh_token,
      storeId,
    });
  }

  @Get('/product/search')
  async searchProduct(@Query() { name, id }: SearchProductDTO) {
    return this.productService.searchProduct(name, id);
  }
}
