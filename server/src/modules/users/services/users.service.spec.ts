import { UsersService } from './users.service';
import type { Repository } from 'typeorm';
import { User } from '@users/entities';
import type { BudgetsService } from '@budgets/services';

describe('UsersService', () => {
  let service: UsersService;
  const mockRepo = {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((dto: Partial<User>) => dto as User),
    save: jest.fn().mockImplementation((u: User) => Promise.resolve(u)),
    find: jest.fn().mockResolvedValue([]),
    delete: jest.fn().mockResolvedValue(undefined),
  } as unknown as Partial<Repository<User>>;
  const mockBudgets = {
    ensureDefaultBudget: jest.fn().mockResolvedValue(true),
  } as unknown as Partial<BudgetsService>;

  beforeEach(() => {
    service = new UsersService(
      mockRepo as unknown as Repository<User>,
      mockBudgets as unknown as BudgetsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('sanitizeUser should remove password', () => {
    const user = {
      id: '1',
      email: 'a@b.com',
      password: 'secret',
    } as unknown as User;
    const sanitized = service.sanitizeUser(user);
    expect((sanitized as unknown as Partial<User>).password).toBeUndefined();
    expect((sanitized as unknown as Partial<User>).email).toBe('a@b.com');
  });
});
