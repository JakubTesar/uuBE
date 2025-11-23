const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
    {
        listId: { type: mongoose.Schema.Types.ObjectId, ref: "ShoppingList", required: true },
        name: { type: String, required: true },
        isDone: { type: Boolean, default: false, required: true },
    },
    { timestamps: true }
);

const Item = mongoose.model("Item", ItemSchema);

module.exports = Item;
