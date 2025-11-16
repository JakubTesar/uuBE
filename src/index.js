const express = require("express");
const bodyParser = require("body-parser");
const { requireAuth, authorize } = require("./authService");
const authController = require("./authController");
const shoppingListController = require("./shoppingListController");
const itemController = require("./itemController");
const memberController = require("./memberController");

const app = express();
app.use(bodyParser.json());

// Auth (login to issue JWT)
app.post("/auth/login", authController.login);

// ShoppingList
app.post("/shoppingList",
    requireAuth, authorize(["User", "Authorities"]),
    shoppingListController.create
);

app.get("/shoppingList/:listId",
    requireAuth, authorize(["User", "Authorities"]),
    shoppingListController.get
);

app.get("/shoppingLists",
    requireAuth, authorize(["User", "Authorities"]),
    shoppingListController.listMine
);

app.put("/shoppingList/:listId",
    requireAuth, authorize(["User", "Authorities"]),
    shoppingListController.update
);

app.delete("/shoppingList/:listId",
    requireAuth, authorize(["User", "Authorities"]),
    shoppingListController.remove
);

// Membership
app.post("/shoppingList/:listId/members",
    requireAuth, authorize(["User", "Authorities"]),
    memberController.invite
);

app.delete("/shoppingList/:listId/members/:userId",
    requireAuth, authorize(["User", "Authorities"]),
    memberController.remove
);

app.get("/shoppingList/:listId/members",
    requireAuth, authorize(["User", "Authorities"]),
    memberController.list
);

//  Items
app.post("/shoppingList/:listId/items",
    requireAuth, authorize(["User", "Authorities"]),
    itemController.add
);

app.put("/shoppingList/:listId/items/:itemId",
    requireAuth, authorize(["User", "Authorities"]),
    itemController.update
);

app.delete("/shoppingList/:listId/items/:itemId",
    requireAuth, authorize(["User", "Authorities"]),
    itemController.remove
);

app.post("/shoppingList/:listId/items/:itemId/check",
    requireAuth, authorize(["User", "Authorities"]),
    itemController.check
);

app.post("/shoppingList/:listId/items/:itemId/uncheck",
    requireAuth, authorize(["User", "Authorities"]),
    itemController.uncheck
);

// Error handler (Yup + general)
app.use((err, req, res) => {
    if (err.name === "ValidationError") {
        const details = err.errors || [err.message];
        return res.status(400).json({
            data: null,
            uuAppErrorMap: { "validation/DtoInInvalid": { type: "error", message: "DtoIn is not valid.", details } }
        });
    }
    console.error(err);
    res.status(500).json({
        data: null,
        uuAppErrorMap: { "system/InternalServerError": { type: "error", message: "Unexpected error." } }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
