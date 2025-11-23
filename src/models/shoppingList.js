const mongoose = require("mongoose");

const ShoppingListSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        isArchive: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const ShoppingList = mongoose.model("ShoppingList", ShoppingListSchema);

module.exports = ShoppingList;
