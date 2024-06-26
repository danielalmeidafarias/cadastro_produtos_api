import { Module, forwardRef } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { AuthModule } from '../Auth/auth.module';
import { UtilsModule } from '../Utils/utils.module';
import { PagarmeModule } from '../Pagarme/pagarme.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [WalletController],
  providers: [WalletService, JwtService],
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => UtilsModule),
    PagarmeModule,
  ],
  exports: [WalletService],
})
export class WalletModule {}
