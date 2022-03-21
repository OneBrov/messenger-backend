import { Exclude } from 'class-transformer';
import { File } from 'src/files/files.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  tag: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  bio: string;

  @Column()
  password: string;

  @ManyToOne(() => File, (image) => image.id, { nullable: true })
  image: File;

  // @OneToMany(() => User, (user) => user.id)
  // userDialogs: User[];
  // @ManyToMany(() => User, (user) => user.id)
  // @JoinTable({
  //   name: 'user_dialogs',
  //   joinColumn: {
  //     name: 'user',
  //     referencedColumnName: 'id',
  //   },
  //   inverseJoinColumn: {
  //     name: 'companion',
  //     referencedColumnName: 'id',
  //   },
  // })
  // companions: User[];
}
