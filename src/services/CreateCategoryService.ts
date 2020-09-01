import { getCustomRepository } from 'typeorm';

import Category from '../models/Category';
import CategoryRepository from '../repositories/CategoryRepository';
import AppError from '../errors/AppError';

interface Request {
  title: string;
}

class CreateCategoryService {
  public async execute({ title }: Request): Promise<Category> {
    if (!title) {
      throw new AppError('You must specify a category for this transaction');
    }

    const categoryRepository = getCustomRepository(CategoryRepository);
    const category = await categoryRepository.checkCategoryByTitle(title);

    return category;
  }
}

export default CreateCategoryService;
