import { IProduct } from 'src/interfaces/IProduct';
import { IUser } from 'src/interfaces/IUser';
import { Product } from 'src/modules/Product/entity/product.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique(['email'])
export class User {
  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @PrimaryColumn()
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;

  @DeleteDateColumn()
  deleted_at?: Date;

  @OneToMany(() => Product, (product) => product.id, { nullable: true })
  products: IProduct[];
}
