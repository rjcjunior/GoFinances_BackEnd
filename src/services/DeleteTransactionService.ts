import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const transactionsExists = await transactionRepository.findOne({
      where: { id },
    });

    if (!transactionsExists) {
      throw new AppError('Transaction id not valid', 400);
    }

    transactionRepository.delete(transactionsExists.id);
  }
}

export default DeleteTransactionService;
