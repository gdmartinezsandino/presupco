import { ConflictException, Injectable } from '@nestjs/common';
import { forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, FindOptionsWhere } from 'typeorm';

import { User } from '@users/entities';
import { CreateUserDto } from '@users/dto';
import { BudgetsService } from '@budgets/services';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @Inject(forwardRef(() => BudgetsService))
    private budgetsService: BudgetsService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const exists = await this.repo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('User already registered');

    const user = this.repo.create(dto);
    const saved = await this.repo.save(user);

    try {
      await this.budgetsService.ensureDefaultBudget(saved);
    } catch (err) {
      console.error('Failed to create default budget', err);
    }

    return saved;
  }

  async findAll(): Promise<User[]> {
    return this.repo.find();
  }

  async findAllByPayload(payload: Partial<User>): Promise<User[]> {
    const whereObj: Record<string, unknown> = {
      ...(payload as Record<string, unknown>),
    };
    const p = payload as Record<string, unknown>;

    const roles = p['roles'];
    if (Array.isArray(roles)) {
      whereObj.roles = In(roles as string[]);
    }

    return this.repo.find({ where: whereObj as FindOptionsWhere<User> });
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findOneByPayload(payload: Partial<User>): Promise<User | null> {
    const whereObj: Record<string, unknown> = {
      ...(payload as Record<string, unknown>),
    };
    const p = payload as Record<string, unknown>;

    const roles = p['roles'];
    if (Array.isArray(roles)) {
      whereObj.roles = In(roles as string[]);
    }

    return this.repo.findOne({ where: whereObj as FindOptionsWhere<User> });
  }

  async findAndUpdate(
    filter: Partial<User>,
    payload: Partial<User>,
  ): Promise<User | null> {
    const whereObj: Record<string, unknown> = {
      ...(filter as Record<string, unknown>),
    };
    const f = filter as Record<string, unknown>;

    const roles = f['roles'];
    if (Array.isArray(roles)) {
      whereObj.roles = In(roles as string[]);
    }

    const user = await this.repo.findOne({
      where: whereObj as FindOptionsWhere<User>,
    });
    if (!user) return null;

    Object.assign(user, payload);
    return this.repo.save(user);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  sanitizeUser(user: User) {
    // Return a shallow copy without password field
    const obj = user as unknown as Record<string, unknown>;
    const sanitized = { ...obj };

    delete sanitized['password'];
    return sanitized;
  }
}
