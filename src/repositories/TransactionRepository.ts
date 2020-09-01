import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const incomes = transactions
      .map(item => (item.type === 'income' ? item.value : 0))
      .reduce((accum, current) => accum + current, 0);

    const outcomes = transactions
      .map(item => (item.type === 'outcome' ? item.value : 0))
      .reduce((accum, current) => accum + current, 0);

    return {
      income: incomes,
      outcome: outcomes,
      total: incomes - outcomes,
    };
  }
}

export default TransactionRepository;
