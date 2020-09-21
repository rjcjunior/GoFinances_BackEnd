import { Router } from 'express';

import transactionsRouter from './transactions.routes';
import categoryRouter from './category.route';

const routes = Router();

routes.use('/category', categoryRouter);
routes.use('/transactions', transactionsRouter);

export default routes;
