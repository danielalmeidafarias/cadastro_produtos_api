import { UUID } from 'crypto';
import { Store } from 'src/modules/Store/entity/store.entity';
import { User } from 'src/modules/User/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Product {
  constructor(
    storeId: UUID,
    store: Store,
    name: string,
    price: number,
    quantity: number,
    productId?: UUID,
  ) {

    this.storeId = storeId;
    this.store = store;
    this.name = name;
    this.price = price;
    this.quantity = quantity;
    this.available = quantity;

    if (productId) {
      this.id = productId;
    }
  }

  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column({ nullable: true })
  quantity: number;

  @Column({ nullable: true })
  available: number;

  @ManyToOne(() => Store, (store) => store.id)
  store: Store;

  @Column()
  storeId: UUID;

  @ManyToOne(() => User, (user) => user.id)
  user: User;
  @Column({ nullable: true })
  userId: UUID;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}

export class UserStoreProduct implements Product {
  constructor(
    storeId: UUID,
    store: Store,
    userId: UUID,
    user: User,
    name: string,
    price: number,
    quantity: number,
    productId?: UUID,
  ) {
    this.storeId = storeId;
    this.store = store
    this.userId = userId;
    this.user = user
    this.name = name;
    this.price = price;
    this.quantity = quantity;
    this.available = quantity;

    if (productId) {
      this.id = productId;
    }
  }

  storeId: UUID;
  store: Store;
  userId: UUID;
  user: User;
  id: UUID;
  name: string;
  price: number;
  quantity: number;
  available: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}
