import { Injectable } from '@nestjs/common';
import { CreateStoreDTO } from './dto/create-store.dto';
import { StoreRepository } from './repository/store.repository';
import { AuthService } from '../auth/auth.service';
import { UserRepository } from '../User/repository/user.repository';
import {
  UtilsService,
  VerifyCepResponse,
} from 'src/modules/utils/utils.service';
import { CreateStoreByUserDTO } from './dto/create-store-by-user.dto';
import { LoginStoreDTO } from './dto/login-store.dto';
import { GetStoreInfoDTO } from './dto/get-store-info.dto';
import { UUID } from 'crypto';
import { IGetUserStoreInfoDTO } from '../User/dto/get-user-store-info.dto';
import { EditProductDto } from '../Product/dto/edit-product.dto';
import { DeleteStoreDTO } from './dto/delete-store.dto';
import { IDeleteUserStoreDTO } from '../User/dto/delete-user-store.dto';

@Injectable()
export class StoreService {
  constructor(
    private storeRepository: StoreRepository,
    private authService: AuthService,
    private userRepository: UserRepository,
    private utilsService: UtilsService,
  ) {}
  // criacao de loja

  async createStoreByUser({
    access_token,
    cep: incomingCep,
    email,
    name,
    phone: incomingPhone,
    cnpj: incomingCnpj,
  }: CreateStoreByUserDTO) {
    const { newAccess_token, newRefresh_token } =
      await this.authService.getNewTokens(access_token);

    const id = await this.authService.getTokenId(newAccess_token);

    const user = await this.userRepository.verifyExistingUserById(id);

    // verificacao se o usuario ja possui loja com esse nome

    await this.authService.verifyTokenId(access_token, user.id);

    const address: VerifyCepResponse | undefined =
      incomingCep && (await this.utilsService.verifyCEP(incomingCep));

    const cnpj: string | undefined =
      incomingCnpj && (await this.utilsService.verifyCNPJ(incomingCnpj));

    const phone: string | undefined =
      incomingPhone &&
      (await this.utilsService.verifyPhoneNumber(incomingPhone));

    const store = {
      email: email ? email : user.email,
      password: user.password,
      name: name ? name.toUpperCase() : user.name,
      phone: incomingPhone ? phone : user.phone,
      cnpj: incomingCnpj ? cnpj : null,
      cpf: user.cpf,
      cep: incomingCep ? address.cep : user.cep,
      logradouro: incomingCep ? address.logradouro : user.logradouro,
      bairro: incomingCep ? address.bairro : user.bairro,
      cidade: incomingCep ? address.cidade : user.cidade,
      uf: incomingCep ? address.uf : user.uf,
      userId: user.id,
    };
    await this.storeRepository.verifyThereIsNoStoreWithName(name.toUpperCase());

    if (incomingCnpj) {
      await this.storeRepository.verifyThereIsNoStoreWithCnpj(store.cnpj);
    }

    await this.storeRepository.verifyThereIsNoStoreWithPhone(store.phone);

    await this.storeRepository.verifyThereIsNotStoreWithEmail(store.email);

    await this.storeRepository.create(store);

    return {
      store,
      access_token: newAccess_token,
      refresh_token: newRefresh_token,
    };
  }

  async createStore({
    cep: incomingCep,
    email,
    name,
    password,
    phone: incomingPhone,
    cnpj: incomingCnpj,
  }: CreateStoreDTO) {
    await this.storeRepository.verifyThereIsNoStoreWithName(name.toUpperCase());

    await this.storeRepository.verifyThereIsNotStoreWithEmail(email);

    const phone: string | undefined =
      incomingPhone &&
      (await this.utilsService.verifyPhoneNumber(incomingPhone));

    await this.storeRepository.verifyThereIsNoStoreWithPhone(phone);

    const cnpj = await this.utilsService.verifyCNPJ(incomingCnpj);

    await this.storeRepository.verifyThereIsNoStoreWithCnpj(cnpj);

    const { cep, logradouro, bairro, cidade, uf }: VerifyCepResponse =
      await this.utilsService.verifyCEP(incomingCep);

    const hashedPassword = await this.utilsService.hashPassword(password);

    const store = {
      email,
      password: hashedPassword,
      name: name.toUpperCase(),
      phone,
      cep,
      logradouro,
      bairro,
      cidade,
      uf,
      cnpj,
    };

    await this.storeRepository.create(store);

    return {
      store,
    };
  }

  async login({ email, password }: LoginStoreDTO) {
    const store = await this.storeRepository.verifyExistingStoreByEmail(email);

    await this.utilsService.passwordIsCorrect(store.password, password);

    const { access_token, refresh_token } =
      await this.authService.signIn(store);

    return {
      access_token,
      refresh_token,
    };
  }

  async getStoreInfo({ access_token }: GetStoreInfoDTO) {
    const { newAccess_token, newRefresh_token } =
      await this.authService.getNewTokens(access_token);
    const id: UUID = await this.authService.getTokenId(newAccess_token);

    await this.utilsService.verifyIsNotAnUserAccount(id);

    const store = await this.storeRepository.verifyExistingStoreById(id);

    await this.authService.verifyTokenId(access_token, store.id);

    return {
      store: await this.storeRepository.getStoreInfo(store.id),
      access_token: newAccess_token,
      refresh_token: newRefresh_token,
    };
  }

  async getUserStoreInfo({ access_token, storeId }: IGetUserStoreInfoDTO) {
    const { newAccess_token, newRefresh_token } =
      await this.authService.getNewTokens(access_token);

    const id: UUID = await this.authService.getTokenId(newAccess_token);

    await this.utilsService.verifyIsNotAnStoreAccount(id);

    const user = await this.userRepository.verifyExistingUserById(id);

    await this.authService.verifyTokenId(access_token, user.id);

    if (storeId) {
      return {
        store: await this.storeRepository.getStoreInfo(storeId),
        access_token: newAccess_token,
        refresh_token: newRefresh_token,
      };
    }

    return {
      stores: await this.storeRepository.getStoresInfoByUserId(user.id),
      access_token: newAccess_token,
      refresh_token: newRefresh_token,
    };
  }

  async editStore({ access_token }: EditProductDto) {
    const { newAccess_token, newRefresh_token } =
      await this.authService.getNewTokens(access_token);

    const id: UUID = await this.authService.getTokenId(newAccess_token);

    await this.utilsService.verifyIsNotAnUserAccount(id);

    const store = await this.storeRepository.verifyExistingStoreById(id);

    await this.authService.verifyTokenId(access_token, store.id);

    return {
      access_token: newAccess_token,
      refresh_token: newRefresh_token,
    };
  }

  async editUserStore(access_token: string, storeId: UUID) {
    const { newAccess_token, newRefresh_token } =
      await this.authService.getNewTokens(access_token);

    const id: UUID = await this.authService.getTokenId(newAccess_token);

    await this.utilsService.verifyIsNotAnStoreAccount(id);

    const user = await this.userRepository.verifyExistingUserById(id);

    await this.authService.verifyTokenId(access_token, user.id);

    console.log(storeId);

    return {
      access_token: newAccess_token,
      refresh_token: newRefresh_token,
    };
  }

  async deleteStore({ access_token }: DeleteStoreDTO) {
    const id: UUID = await this.authService.getTokenId(access_token);

    await this.utilsService.verifyIsNotAnUserAccount(id);

    const store = await this.storeRepository.verifyExistingStoreById(id);

    await this.authService.verifyTokenId(access_token, store.id);

    await this.storeRepository.deleteStore(id);

    return {
      message: `${store.name} deletado com sucesso`,
    };
  }

  async deleteUserStore({ access_token, storeId }: IDeleteUserStoreDTO) {
    const { newAccess_token, newRefresh_token } =
      await this.authService.getNewTokens(access_token);

    const id: UUID = await this.authService.getTokenId(newAccess_token);

    await this.utilsService.verifyIsNotAnStoreAccount(id);

    const user = await this.userRepository.verifyExistingUserById(id);

    await this.authService.verifyTokenId(access_token, user.id);

    console.log(storeId);

    return {
      access_token: newAccess_token,
      refresh_token: newRefresh_token,
    };
  }

  // encontrar lojas pelo nome
  async findStoreByName() {}

  // encontrar lojas pelo id da loja
  async findStoreById() {}

  // encontrar lojas pelo id do usuario
  async findStoreByUserId() {}

  // encontrar produtos da loja
  async searchStoreProducts() {
    // se tiver apenas o id da loja retornar todos produtos da loja
    // se tiver pesquisa retornar apenas o resultado da pesquisa
  }
}
