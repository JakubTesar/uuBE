const { object, string } = require("yup");
const ShoppingList = require("../models/shoppingList");
const Membership = require("../models/membership");
const Item = require("../models/item");
const User = require("../models/user");const { createError } = require("./authService");

const createDtoIn = object({
    name: string().min(1).max(100).required(),
});

const getDtoIn = object({
    listId: string().required(),
});

const updateDtoIn = object({
    listId: string().required(),
    name: string().min(1).max(100).required(),
});

const deleteDtoIn = object({
    listId: string().required(),
});

async function getListOrThrow(listId) {
    const list = await ShoppingList.findById(listId);
    if (!list) {
        throw createError(
            404,
            "shoppingListDoesNotExist",
            "Shopping list with given id does not exist.",
            { listId }
        );
    }
    return list;
}

async function getMembershipOrThrow(listId, userId, allowedRoles) {
    const membership = await Membership.findOne({ listId, userId });
    if (!membership || !allowedRoles.includes(membership.role)) {
        throw createError(
            403,
            "userIsNotMember",
            "User is not Owner nor Member of the shopping list.",
            { listId, userId }
        );
    }
    return membership;
}

async function create(user, dtoInRaw) {
    const dtoIn = await createDtoIn.validate(dtoInRaw, {
        abortEarly: false,
        stripUnknown: true,
    });

    const list = await ShoppingList.create({
        name: dtoIn.name,
        ownerId: user.userId,
    });

    const membership = await Membership.create({
        listId: list._id,
        userId: user.userId,
        role: "Owner",
    });

    return {
        list: {
            id: list._id.toString(),
            name: list.name,
            createdAt: list.createdAt,
            updatedAt: list.updatedAt,
        },
        membership: {
            id: membership._id.toString(),
            userId: membership.userId,
            listId: membership.listId.toString(),
            role: membership.role,
        },
    };
}

async function get(user, dtoInRaw) {
    const dtoIn = await getDtoIn.validate(dtoInRaw, {
        abortEarly: false,
        stripUnknown: true,
    });

    const list = await getListOrThrow(dtoIn.listId);
    await getMembershipOrThrow(dtoIn.listId, user.userId, ["Owner", "Member"]);

    const items = await Item.find({ listId: dtoIn.listId }).sort({ createdAt: 1 });
    const memberships = await Membership.find({ listId: dtoIn.listId });

    const userIds = memberships.map((m) => m.userId);
    const users = await User.find({ _id: { $in: userIds } });
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const membersDto = memberships.map((m) => {
        const u = userMap.get(m.userId.toString());
        return {
            user: u
                ? { id: u._id.toString(), name: u.name, email: u.email }
                : { id: m.userId.toString(), name: null, email: null },
            membership: {
                id: m._id.toString(),
                userId: m.userId,
                listId: m.listId.toString(),
                role: m.role,
            },
        };
    });

    return {
        list: {
            id: list._id.toString(),
            name: list.name,
            createdAt: list.createdAt,
            updatedAt: list.updatedAt,
        },
        items: items.map((it) => ({
            id: it._id.toString(),
            listId: it.listId.toString(),
            name: it.name,
            isDone: it.isDone,
            createdAt: it.createdAt,
        })),
        members: membersDto,
    };
}

async function listMine(user) {
    const memberships = await Membership.find({ userId: user.userId });
    const listIds = memberships.map((m) => m.listId);
    const lists = await ShoppingList.find({ _id: { $in: listIds } });

    const listsMap = new Map(lists.map((l) => [l._id.toString(), l]));

    return {
        lists: memberships.map((m) => {
            const list = listsMap.get(m.listId.toString());
            return {
                list: list
                    ? {
                        id: list._id.toString(),
                        name: list.name,
                        createdAt: list.createdAt,
                        updatedAt: list.updatedAt,
                    }
                    : null,
                role: m.role,
            };
        }),
    };
}

async function update(user, dtoInRaw) {
    const dtoIn = await updateDtoIn.validate(dtoInRaw, {
        abortEarly: false,
        stripUnknown: true,
    });

    const list = await getListOrThrow(dtoIn.listId);

    const membership = await Membership.findOne({
        listId: dtoIn.listId,
        userId: user.userId,
    });
    if (!membership || membership.role !== "Owner") {
        throw createError(
            403,
            "userIsNotOwner",
            "User is not Owner of the shopping list.",
            { listId: dtoIn.listId, userId: user.userId }
        );
    }

    list.name = dtoIn.name;
    await list.save();

    return {
        list: {
            id: list._id.toString(),
            name: list.name,
            createdAt: list.createdAt,
            updatedAt: list.updatedAt,
        },
    };
}

async function remove(user, dtoInRaw) {
    const dtoIn = await deleteDtoIn.validate(dtoInRaw, {
        abortEarly: false,
        stripUnknown: true,
    });

    await getListOrThrow(dtoIn.listId);

    const membership = await Membership.findOne({
        listId: dtoIn.listId,
        userId: user.userId,
    });
    if (!membership || membership.role !== "Owner") {
        throw createError(
            403,
            "userIsNotOwner",
            "User is not Owner of the shopping list.",
            { listId: dtoIn.listId, userId: user.userId }
        );
    }

    await Item.deleteMany({ listId: dtoIn.listId });
    await Membership.deleteMany({ listId: dtoIn.listId });
    await ShoppingList.deleteOne({ _id: dtoIn.listId });

    return { listId: dtoIn.listId, deleted: true };
}

module.exports = { create, get, listMine, update, remove };
