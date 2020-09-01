import { getCustomRepository } from 'typeorm';
import csvParse from 'csv-parse';

import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';
import TransactionRepository from '../repositories/TransactionRepository';
import CreateTransactionService from './CreateTransactionService';
import CreateCategoryService from './CreateCategoryService';
import CategoryRepository from '../repositories/CategoryRepository';

interface TransactionCSV {
  title: string;
  type: string;
  value: number;
  category?: string;
}

class ImportTransactionsService {
  async execute(buffer: Buffer, mimetype: string): Promise<Transaction[]> {
    if (mimetype !== 'text/csv') {
      throw new AppError('The format file is not valid, allows only: csv');
    }
    const transactionService = new CreateTransactionService();
    const categoryRepository = getCustomRepository(CategoryRepository);

    const parsedCSV = csvParse(buffer, {
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const transactions: Array<Transaction> = [];
    const arrayCSV: Array<TransactionCSV> = [];

    parsedCSV
      .on('data', line => {
        const [title, type, value, category] = line;
        arrayCSV.push({ title, type, value, category });
      })
      .on('error', err => err);

    await new Promise(resolve => parsedCSV.on('end', resolve));

    if (arrayCSV.length) {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < arrayCSV.length; i++) {
        const { title, type, value, category } = arrayCSV[i];

        // eslint-disable-next-line no-await-in-loop
        const objCategory = await categoryRepository.checkCategoryByTitle(
          category,
        );

        if (title && value && (type === 'income' || type === 'outcome')) {
          // eslint-disable-next-line no-await-in-loop
          const transaction = await transactionService.execute({
            title,
            type,
            value,
            category: objCategory,
          });

          transactions.push(transaction);
        }
      }
    }

    return transactions;
  }
}

export default ImportTransactionsService;
