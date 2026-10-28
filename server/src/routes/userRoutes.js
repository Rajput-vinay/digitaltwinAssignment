
import express from 'express';

import {
    listUsers,
    getStats,
    getUser,
    createUser,
    updateUser,
    deleteUser,
} from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/', listUsers);
userRouter.get('/stats', getStats);
userRouter.get('/:id', getUser);
userRouter.post('/', createUser);
userRouter.put('/:id', updateUser);
userRouter.delete('/:id', deleteUser);

export default userRouter;
