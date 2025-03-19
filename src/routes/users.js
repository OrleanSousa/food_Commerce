import express from "express";
import UsersControllers from "../controllers/users.js";

const usersRouter = express.Router();

const usersControllers = new UsersControllers();

usersRouter.get("/", async (req, res) => {
    const { success, statusCode, body} = await usersControllers.getUsers();

    res.status(statusCode).send({ success, statusCode, body });
} );

usersRouter.delete("/:userId", async (req, res) => {
    const { success, statusCode, body } = await usersControllers.deleteUser(req.params.userId);

    res.status(statusCode).send({ success, statusCode, body });
});

usersRouter.put("/:userId", async (req, res) => {
    const { success, statusCode, body } = await usersControllers.updateUser(req.params.userId, req.body);

    res.status(statusCode).send({ success, statusCode, body });
});











export default usersRouter