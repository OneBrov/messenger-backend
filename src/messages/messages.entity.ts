import { File } from 'src/files/files.entity';
import { User } from 'src/users/users.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  from: User;

  @ManyToOne(() => User, (user) => user.id)
  to: User;

  @Column()
  text: string;

  @ManyToOne(() => File, (file) => file.id, { nullable: true })
  file: File;

  @ManyToOne(() => File, (image) => image.id, { nullable: true })
  image: File;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  sendingDate: Date;
}
