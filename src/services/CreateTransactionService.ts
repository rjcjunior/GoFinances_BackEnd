import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const balance = await transactionRepository.getBalance();

    if (type === 'outcome' && value > balance.total){
      throw new AppError('Outcome value is more than total', 400);
    }

    let categoryFromRepository = await categoryRepository.findOne({
      where: { category: title },
    });

    if (!categoryFromRepository) {
      categoryFromRepository = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(categoryFromRepository);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: categoryFromRepository,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
