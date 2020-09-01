import { EntityRepository, Repository } from 'typeorm';

import Category from '../models/Category';

@EntityRepository(Category)
class CategoryRepository extends Repository<Category> {
  public async checkCategoryByTitle(title?: string): Promise<Category> {
    let category = await this.findOne({
      where: { title },
    });

    if (!category) {
      category = await this.save({ title });
    }

    return category;
  }
}

export default CategoryRepository;
