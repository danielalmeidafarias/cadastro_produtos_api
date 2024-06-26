import { UserRepository } from './repository/user.repository';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './entity/user.entity';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../Auth/auth.service';
import { UtilsService } from 'src/modules/Utils/utils.service';
import { StoreRepository } from '../Store/repository/store.repository';
import { ProductRepository } from '../Product/repository/product.repository';
import { PagarmeService } from '../Pagarme/pagarme.service';
import { UserStore } from '../Store/entity/store.entity';
import { CartRepository } from '../Cart/repository/cart.repository';
import { Costumer } from '../Pagarme/classes/Costumer';

export interface ICreateUser {
  email: string;
  password: string;
  incomingCep: string;
  numero: string;
  complemento: string;
  incomingCpf: string;
  birthdate: Date;
  name: string;
  incomingMobilePhone: string;
  incomingHomePhone: string;
  ponto_referencia: string;
}

export interface IUpdateUser {
  access_token: string;
  refresh_token: string;
  password: string;
  newPassword: string;
  newEmail: string;
  newCEP: string;
  newNumero: string;
  newComplemento: string;
  newName: string;
  newMobilePhone: string;
  newHomePhone: string;
}

export interface IDeleteUser {
  access_token: string;
  refresh_token: string;
  password: string;
}

export interface IGetUserInfo {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private authService: AuthService,
    private utilsService: UtilsService,
    private storeRepository: StoreRepository,
    private productRepository: ProductRepository,
    private pagarmeService: PagarmeService,
    private cartRepository: CartRepository,
  ) {}

  async createUser({
    email,
    password,
    incomingCep,
    numero,
    complemento,
    incomingCpf,
    birthdate,
    name,
    incomingMobilePhone,
    incomingHomePhone,
    ponto_referencia,
  }: ICreateUser) {
    await this.utilsService.verifyIsMaiorDeIdade(birthdate);

    const cpf = await this.utilsService.verifyCPF(incomingCpf);

    const mobile_phone =
      await this.utilsService.verifyPhoneNumber(incomingMobilePhone);

    const home_phone = incomingHomePhone
      ? await this.utilsService.verifyPhoneNumber(incomingHomePhone)
      : null;

    const { cep, logradouro, bairro, cidade, uf } =
      await this.utilsService.verifyCEP(incomingCep);

    const hashedPassword = await this.utilsService.hashPassword(password);

    await this.storeRepository.verifyThereIsNoStoreWithEmail(email);

    await this.userRepository.verifyThereIsNoUserWithEmail(email);

    await this.userRepository.verifyThereIsNoUserWithCPF(cpf);

    await this.storeRepository.verifyThereIsNoStoreWithPhone(mobile_phone);

    await this.userRepository.verifyThereIsNoUserWithPhone(mobile_phone);

    const costumer_mobile_phone =
      await this.utilsService.transformCostumerPhone(incomingMobilePhone);

    const costumer_home_phone = incomingHomePhone
      ? await this.utilsService.transformCostumerPhone(incomingHomePhone)
      : null;

    const costumer_address = await this.utilsService.transformCostumerAddress(
      cep,
      numero,
      complemento,
    );

    const costumer = new Costumer({
      address: costumer_address,
      birthdate,
      document: cpf,
      document_type: 'CPF',
      email,
      name,
      phones: {
        mobile_phone: costumer_mobile_phone,
        home_phone: costumer_home_phone,
      },
      type: 'individual',
    });

    const { costumerId } = await this.pagarmeService.createCostumer(costumer);

    const user = new User(
      costumerId,
      email,
      hashedPassword,
      name.toUpperCase(),
      birthdate,
      cpf,
      cep,
      numero,
      complemento,
      ponto_referencia,
      logradouro,
      bairro,
      cidade,
      uf,
      mobile_phone,
      home_phone ? home_phone : null,
    );

    const { userId } = await this.userRepository.createUser(user);

    await this.cartRepository.create(userId);

    return {
      userId,
      user,
    };
  }

  async getUser({ access_token, refresh_token }: IGetUserInfo) {
    const { user, newAccess_token, newRefresh_token } =
      await this.authService.userVerification(access_token, refresh_token);

    return {
      user: await this.userRepository.getUserInfo(user.id),
      access_token: newAccess_token,
      refresh_token: newRefresh_token,
    };
  }

  async updateUser({
    access_token,
    refresh_token,
    password,
    newPassword,
    newEmail,
    newCEP,
    newNumero,
    newComplemento,
    newName,
    newMobilePhone,
    newHomePhone,
  }: IUpdateUser) {
    const { user, newAccess_token, newRefresh_token } =
      await this.authService.userVerification(access_token, refresh_token);

    const mobile_phone = newMobilePhone
      ? await this.utilsService.verifyPhoneNumber(newMobilePhone)
      : await this.utilsService.verifyPhoneNumber(user.mobile_phone);

    const home_phone = newMobilePhone
      ? await this.utilsService.verifyPhoneNumber(newHomePhone)
      : user.home_phone
        ? await this.utilsService.verifyPhoneNumber(user.home_phone)
        : null;

    const address = newCEP
      ? await this.utilsService.verifyCEP(newCEP)
      : await this.utilsService.verifyCEP(user.cep);

    if (newPassword || newEmail) {
      if (!password) {
        throw new HttpException('Digite a senha', HttpStatus.UNAUTHORIZED);
      }
      await this.authService.userLogin(user.password, password);
    }

    if (newEmail) {
      await this.storeRepository.verifyThereIsNoStoreWithEmail(newEmail);
      await this.userRepository.verifyThereIsNoUserWithEmail(newEmail);
      await this.userRepository.verifyThereIsNoUserWithEmail(newEmail);
    }

    if (newMobilePhone) {
      await this.storeRepository.verifyThereIsNoStoreWithPhone(mobile_phone);
      await this.userRepository.verifyThereIsNoUserWithPhone(mobile_phone);
    }

    const editedUser = new User(
      user.costumerId,
      newEmail ? newEmail : user.email,
      newPassword ? bcrypt.hashSync(newPassword, 10) : password,
      newName ? newName.toUpperCase() : user.name,
      user.birthdate,
      user.cpf,
      newCEP ? address.cep : user.cep,
      newCEP ? newNumero : user.numero,
      newCEP ? newComplemento : user.complemento,
      newCEP ? address.logradouro : user.logradouro,
      newCEP ? address.bairro : user.bairro,
      newCEP ? address.cidade : user.cidade,
      newCEP ? address.uf : user.uf,
      newMobilePhone ? mobile_phone : user.mobile_phone,
      newHomePhone ? home_phone : user.home_phone,
      user.id,
    );

    if (
      editedUser.email === user.email &&
      editedUser.password === user.password &&
      editedUser.cep === user.cep &&
      editedUser.name === user.name &&
      editedUser.mobile_phone === user.mobile_phone
    ) {
      throw new HttpException(
        'Nenhuma mudança foi requerida',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userStore = await this.storeRepository.findByUserId(user.id);

    if (userStore) {
      const editedUserStore = new UserStore(
        userStore.recipientId,
        user.id,
        editedUser,
        editedUser.email,
        editedUser.name,
        editedUser.birthdate,
        editedUser.cep,
        editedUser.numero,
        editedUser.complemento,
        editedUser.logradouro,
        editedUser.bairro,
        editedUser.cidade,
        editedUser.uf,
        editedUser.mobile_phone,
        editedUser.home_phone,
        editedUser.cpf,
        userStore.id,
      );

      await this.storeRepository.updateStore(editedUserStore);
    }

    const costumer_mobile_phone =
      await this.utilsService.transformCostumerPhone(editedUser.mobile_phone);

    const costumer_home_phone = await this.utilsService.transformCostumerPhone(
      editedUser.home_phone,
    );

    const costumer_address = await this.utilsService.transformCostumerAddress(
      editedUser.cep,
      editedUser.numero,
      editedUser.complemento,
    );

    const costumer = new Costumer({
      name: editedUser.name,
      email: editedUser.email,
      costumer_Id: editedUser.costumerId,
      document_type: 'CPF',
      type: 'individual',
      document: editedUser.cpf,
      birthdate: editedUser.birthdate,
      phones: {
        mobile_phone: costumer_mobile_phone,
        home_phone: costumer_home_phone,
      },
      address: costumer_address,
    });

    await this.pagarmeService.updateCostumer(costumer);

    await this.userRepository.updateUser(editedUser);

    return {
      message: 'Usuario editado com sucesso!',
      user: editedUser,
      access_token: newAccess_token,
      refresh_token: newRefresh_token,
    };
  }

  async deleteUser({ access_token, refresh_token, password }: IDeleteUser) {
    const { user } = await this.authService.userVerification(
      access_token,
      refresh_token,
    );

    await this.authService.userLogin(user.password, password);

    await this.storeRepository.deleteUserStore(user.id);

    await this.productRepository.deleteUserProducts(user.id);

    await this.cartRepository.delete(user.id);

    await this.userRepository.deleteUser(user.id);

    return {
      message: 'Usuario deletado com sucesso!',
    };
  }
}
