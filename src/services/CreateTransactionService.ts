import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  category?: Category;
  type: 'income' | 'outcome';
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionRepository);

    if (!type.match(/^(income|outcome)$/)) {
      throw new AppError('Type of transaction is invalid.');
    }

    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();

      if (total < value) {
        throw new AppError("You don't have enough balance.");
      }
    }

    const transaction = await transactionsRepository.save({
      title,
      type,
      value,
      category,
    });

    return transaction;
  }
}

export default CreateTransactionService;
