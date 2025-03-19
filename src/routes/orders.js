import express from "express";
import OrdersControllers from "../controllers/orders.js";



const ordersRouter = express.Router();
const ordersControllers = new OrdersControllers();

ordersRouter.get("/", async (req, res) => {
    const { success, statusCode, body} = await ordersControllers.getOrders();

    res.status(statusCode).send({ success, statusCode, body });
} );

ordersRouter.post("/", async (req, res) => {
    const { success, statusCode, body } = await ordersControllers.addOrder(req.body);

    res.status(statusCode).send({ success, statusCode, body });
});

ordersRouter.delete("/:orderId", async (req, res) => {
    const { success, statusCode, body } = await ordersControllers.deleteOrder(req.params.orderId);

    res.status(statusCode).send({ success, statusCode, body });
});

ordersRouter.put("/:orderId", async (req, res) => {
    const { success, statusCode, body } = await ordersControllers.updateOrders(req.params.orderId, req.body);

    res.status(statusCode).send({ success, statusCode, body });
});



export default ordersRouter