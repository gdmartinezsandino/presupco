import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from '@categories/entities';
import { CreateCategoryDto } from '@categories/dto';
import { Budget } from '@budgets/entities';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private repo: Repository<Category>) {}

  async create(budget: Budget, dto: CreateCategoryDto): Promise<Category> {
    const ent = this.repo.create({
      name: dto.name,
      description: dto.description,
      budget,
    });
    return this.repo.save(ent);
  }

  async findByBudget(budgetId: string): Promise<Category[]> {
    return this.repo.find({
      where: { budget: { id: budgetId } },
      relations: ['expenses'],
    });
  }

  async findOne(id: string): Promise<Category> {
    const c = await this.repo.findOne({
      where: { id },
      relations: ['expenses', 'budget'],
    });
    if (!c) throw new NotFoundException('Category not found');
    return c;
  }

  async findAndUpdate(
    filter: Partial<Category>,
    payload: Partial<Category>,
  ): Promise<Category | null> {
    const where = Object.assign({}, filter);

    const category = await this.repo.findOne({ where });
    if (!category) return null;

    Object.assign(category, payload);
    return this.repo.save(category);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
