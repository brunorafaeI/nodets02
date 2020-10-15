import { Router } from 'express';
import multer from 'multer';

import { getCustomRepository } from 'typeorm';
import CreateCategoryService from '../services/CreateCategoryService';
import CreateTransactionService from '../services/CreateTransactionService';
import TransactionRepository from '../repositories/TransactionRepository';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer();

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionRepository);

  const transactions = await transactionRepository.find({
    select: ['id', 'title', 'value', 'type', 'created_at'],
    relations: ['category'],
  });

  const balance = await transactionRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const categoryService = new CreateCategoryService();
  const transactionService = new CreateTransactionService();

  const checkedCategory = await categoryService.execute({ title: category });
  const transaction = await transactionService.execute({
    title,
    value,
    type,
    category: checkedCategory,
  });

  return response.status(201).json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const transactionService = new DeleteTransactionService();
  await transactionService.execute({ id });

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const { file } = request;

    const importTransactionService = new ImportTransactionsService();

    const transactions = await importTransactionService.execute(
      file.buffer,
      file.mimetype,
    );

    return response.json(transactions);
  },
);

export default transactionsRouter;
