const { object, string, boolean } = require("yup");
const Item = require("../models/item");
const Membership = require("../models/membership");
const ShoppingList = require("../models/shoppingList");
const { createError } = require("./authService");

const addDtoIn = object({
    listId: string().required(),
    name: string().min(1).max(120).required(),
});

const updateDtoIn = object({
    listId: string().required(),
    itemId: string().required(),
    name: string().min(1).max(120).required(),
    isDone: boolean().required(),
});

const idOnlyDtoIn = object({
    listId: string().required(),
    itemId: string().required(),
});

async function ensureListMember(listId, userId) {
    const list = await ShoppingList.findById(listId);
    if (!list) {
        throw createError(
            404,
            "shoppingListDoesNotExist",
            "Shopping list with given id does not exist.",
            { listId }
        );
    }

    const membership = await Membership.findOne({ listId, userId });
    if (!membership) {
        throw createError(
            403,
            "userIsNotMember",
            "User is not Owner nor Member of the shopping list.",
            { listId, userId }
        );
    }
}

async function add(user, dtoInRaw) {
    const dtoIn = await addDtoIn.validate(dtoInRaw, {
        abortEarly: false,
        stripUnknown: true,
    });

    const { listId, name } = dtoIn;

    await ensureListMember(listId, user.userId);

    const item = await Item.create({
        listId,
        name,
    });

    return {
        item: {
            id: item._id.toString(),
            listId: item.listId.toString(),
            name: item.name,
            isDone: item.isDone,
            createdAt: item.createdAt,
        },
    };
}

async function update(user, dtoInRaw) {
    const dtoIn = await updateDtoIn.validate(dtoInRaw, {
        abortEarly: false,
        stripUnknown: true,
    });

    const { listId, itemId, name, isDone } = dtoIn;

    await ensureListMember(listId, user.userId);

    const item = await Item.findOne({ _id: itemId, listId });
    if (!item) {
        throw createError(
            404,
            "itemDoesNotExist",
            "Item with given id does not exist in this list.",
            { listId, itemId }
        );
    }

    item.name = name;
    item.isDone = isDone;
    await item.save();

    return {
        item: {
            id: item._id.toString(),
            listId: item.listId.toString(),
            name: item.name,
            isDone: item.isDone,
            createdAt: item.createdAt,
        },
    };
}

async function remove(user, dtoInRaw) {
    const dtoIn = await idOnlyDtoIn.validate(dtoInRaw, {
        abortEarly: false,
        stripUnknown: true,
    });

    const { listId, itemId } = dtoIn;

    await ensureListMember(listId, user.userId);

    await Item.deleteOne({ _id: itemId, listId });

    return { listId, itemId, deleted: true };
}
async function check(user, dtoInRaw) {
    const dtoIn = await idOnlyDtoIn.validate(dtoInRaw, {
        abortEarly: false,
        stripUnknown: true,
    });

    const { listId, itemId } = dtoIn;

    await ensureListMember(listId, user.userId);

    const item = await Item.findOne({ _id: itemId, listId });
    if (!item) {
        throw createError(
            404,
            "itemDoesNotExist",
            "Item with given id does not exist in this list.",
            { listId, itemId }
        );
    }

    item.isDone = true;
    await item.save();

    return {
        item: {
            id: item._id.toString(),
            listId: item.listId.toString(),
            name: item.name,
            isDone: item.isDone,
            createdAt: item.createdAt,
        },

    };
}

async function uncheck(user, dtoInRaw) {
    const dtoIn = await idOnlyDtoIn.validate(dtoInRaw, {
        abortEarly: false,
        stripUnknown: true,
    });

    const { listId, itemId } = dtoIn;

    await ensureListMember(listId, user.userId);

    const item = await Item.findOne({ _id: itemId, listId });
    if (!item) {
        throw createError(
            404,
            "itemDoesNotExist",
            "Item with given id does not exist in this list.",
            { listId, itemId }
        );
    }

    item.isDone = false;
    await item.save();

    return {
        item: {
            id: item._id.toString(),
            listId: item.listId.toString(),
            name: item.name,
            isDone: item.isDone,
            createdAt: item.createdAt,
        },
    };
}

module.exports = { add, update, remove, check, uncheck };
