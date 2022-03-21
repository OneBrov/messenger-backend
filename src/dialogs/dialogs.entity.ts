import { User } from 'src/users/users.entity';
import { CreateDateColumn, Entity, ManyToOne } from 'typeorm';

// UserDialogs — таблица для хранения списка контактов пользователей,
// а также для хранения даты последнего прочитанного сообщения
@Entity()
export class UserDialogs {
  @CreateDateColumn({ type: 'timestamp' })
  lastReadMessageDate: Date;

  @ManyToOne(() => User, (user) => user.id, { primary: true })
  user: User;

  @ManyToOne(() => User, (user) => user.id, { primary: true })
  companion: User;
}
