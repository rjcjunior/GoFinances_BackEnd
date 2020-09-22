import csvParse from 'csv-parse';
import fs from 'fs';
import { getCustomRepository, getRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const csvFile = fs.createReadStream(filePath);
    const categoryRepository = getRepository(Category);

    const parse = csvParse({
      fromLine: 2,
    });

    const parseCsv = csvFile.pipe(parse);
    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCsv.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value || !category) return;

      transactions.push({ title, type, value, category });
      categories.push(category);
    });

    await new Promise(resolve => parseCsv.on('end', resolve));

    const categoryExisting = await categoryRepository.find({
      where: {
        title: In(categories),
      },
    });

    const categoryExistingTitle = categoryExisting.map(
      category => category.title,
    );

    const categoryNews = categories
      .filter(category => !categoryExistingTitle.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index); // Pegar os caras com valores diferentes

    const createCategory = await categoryRepository.create(
      categoryNews.map(title => ({
        title,
      })),
    );

    await categoryRepository.save(createCategory);

    const allCategories = await categoryRepository.find();

    const transactionToCreate = await transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        value: transaction.value,
        type: transaction.type,
        category: allCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionRepository.save(transactionToCreate);

    return transactionToCreate;
  }
}

export default ImportTransactionsService;
