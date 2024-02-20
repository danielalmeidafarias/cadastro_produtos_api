import { Module } from "@nestjs/common";
import { StoreController } from "./store.controller";
import { StoreService } from "./store.service";
import { StoreRepository } from "./repository/store.repository";
import { AuthModule } from "../auth/auth.module";
import { UserModule } from "../User/user.module";
import { UtilsService } from "src/utils/utils.service";
import { JwtService } from "@nestjs/jwt";
import { UtilsModule } from "src/utils/utils.module";

@Module(
  {
    controllers: [StoreController],
    providers: [StoreService, StoreRepository, JwtService],
    imports: [AuthModule, UserModule, UtilsModule],
    exports: [StoreService, StoreRepository]
  }
)
export class StoreModule {}