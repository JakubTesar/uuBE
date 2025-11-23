const mongoose = require("mongoose");

const MembershipSchema = new mongoose.Schema(
    {
        listId: { type: mongoose.Schema.Types.ObjectId, ref: "ShoppingList", required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["Owner", "Member"], required: true },
    },
    { timestamps: true }
);

const Membership = mongoose.model("Membership", MembershipSchema);

module.exports = Membership;
