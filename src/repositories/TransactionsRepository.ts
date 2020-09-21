import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const balance = (await this.find()).reduce(
      (accum: Balance, transaction: Transaction) => {
        switch (transaction.type) {
          case 'income':
            accum.income += transaction.value;
            break;
          case 'outcome':
            accum.outcome += transaction.value;
            break;
          default:
            break;
        }

        return accum;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    balance.total = balance.income - balance.outcome;
    return balance;
  }
}

export default TransactionsRepository;
