const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const { requireAuth, authorize } = require("./services/authService");
const authController = require("./controllers/authController");
const shoppingListController = require("./controllers/shoppingListController");
const memberController = require("./controllers/memberController");
const itemController = require("./controllers/itemController");


const app = express();
app.use(bodyParser.json());

//  AUTH
app.post("/auth/login", authController.login);
app.post("/auth/register", authController.register);

// SHOPPING LISTS
app.post(
    "/shoppingList",
    requireAuth,
    authorize(["User", "Authorities"]),
    shoppingListController.create
);

app.get(
    "/shoppingList/:listId",
    requireAuth,
    authorize(["User", "Authorities"]),
    shoppingListController.get
);

app.get(
    "/shoppingLists",
    requireAuth,
    authorize(["User", "Authorities"]),
    shoppingListController.listMine
);

app.put(
    "/shoppingList/:listId",
    requireAuth,
    authorize(["User", "Authorities"]),
    shoppingListController.update
);

app.delete(
    "/shoppingList/:listId",
    requireAuth,
    authorize(["User", "Authorities"]),
    shoppingListController.remove
);

// MEMBERS
app.post(
    "/shoppingList/:listId/members/:userId",
    requireAuth,
    authorize(["User", "Authorities"]),
    memberController.invite
);

app.delete(
    "/shoppingList/:listId/members/:userId",
    requireAuth,
    authorize(["User", "Authorities"]),
    memberController.remove
);

app.get(
    "/shoppingList/:listId/members",
    requireAuth,
    authorize(["User", "Authorities"]),
    memberController.list
);

// ITEMS
app.post(
    "/shoppingList/:listId/items",
    requireAuth,
    authorize(["User", "Authorities"]),
    itemController.add
);

app.put(
    "/shoppingList/:listId/items/:itemId",
    requireAuth,
    authorize(["User", "Authorities"]),
    itemController.update
);

app.delete(
    "/shoppingList/:listId/items/:itemId",
    requireAuth,
    authorize(["User", "Authorities"]),
    itemController.remove
);

app.post(
    "/shoppingList/:listId/items/:itemId/check",
    requireAuth,
    authorize(["User", "Authorities"]),
    itemController.check
);

app.post(
    "/shoppingList/:listId/items/:itemId/uncheck",
    requireAuth,
    authorize(["User", "Authorities"]),
    itemController.uncheck
);

// Errors
app.use((err, req, res, next) => {
    if (err.name === "ValidationError") {
        const details = err.errors || [err.message];
        return res.status(400).json({
            error: {
                code: "invalidDtoIn",
                message: "DtoIn is not valid.",
                details,
            },
        });
    }

    if (err.apiError) {
        return res.status(err.status || 500).json({
            error: {
                code: err.code || "InternalError",
                message: err.message || "Unexpected error.",
                params: err.params || {},
            },
        });
    }

    console.error(err);
    res.status(500).json({
        error: {
            code: "InternalServerError",
            message: "Unexpected error.",
        },
    });
});

mongoose
    .connect("mongodb://localhost:27017/shopping-list")
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(3000, () => console.log(`http://localhost:${3000}`));
    })
    .catch((err) => {
        console.error("Mongo connection failed", err);
        process.exit(1);
    });
