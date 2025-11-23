const { object, string, number } = require("yup");
const Membership = require("../models/membership");
const ShoppingList = require("../models/shoppingList");
const User = require("../models/user");
const { createError } = require("./authService");

const inviteDtoIn = object({
    listId: string().required(),
    userId: string().required(),
});

const removeDtoIn = object({
    listId: string().required(),
    userId: string().required(),
});

const listDtoIn = object({
    listId: string().required(),
});

async function ensureListExists(listId) {
    const list = await ShoppingList.findById(listId);
    if (!list) {
        throw createError(
            404,
            "shoppingListDoesNotExist",
            "Shopping list with given id does not exist.",
            { listId }
        );
    }
}

async function ensureOwner(listId, userId) {
    const membership = await Membership.findOne({ listId, userId });
    if (!membership || membership.role !== "Owner") {
        throw createError(
            403,
            "userIsNotOwner",
            "User is not Owner of the shopping list.",
            { listId, userId }
        );
    }
}

async function ensureOwnerOrMember(listId, userId) {
    const membership = await Membership.findOne({ listId, userId });
    if (!membership) {
        throw createError(
            403,
            "userIsNotMember",
            "User is not Owner nor Member of the shopping list.",
            { listId, userId }
        );
    }
    return membership;
}

async function invite(user, dtoInRaw) {
    const dtoIn = await inviteDtoIn.validate(dtoInRaw, {
        abortEarly: false,
        stripUnknown: true,
    });

    const { listId, userId } = dtoIn;

    await ensureListExists(listId);
    await ensureOwner(listId, user.userId);

    let membership = await Membership.findOne({ listId, userId });

    if (!membership) {
        membership = await Membership.create({
            listId,
            userId,
            role: "Member",
        });
    }

    return {
        membership: {
            id: membership._id.toString(),
            listId: membership.listId.toString(),
            userId: membership.userId.toString(),
            role: membership.role,
        },
    };
}


async function remove(user, dtoInRaw) {
    const dtoIn = await removeDtoIn.validate(dtoInRaw, {
        abortEarly: false,
        stripUnknown: true,
    });

    const { listId, userId } = dtoIn;

    await ensureListExists(listId);
    await ensureOwner(listId, user.userId);

    await Membership.deleteOne({ listId, userId });

    return { listId, userId, removed: true };
}

async function list(user, dtoInRaw) {
    const dtoIn = await listDtoIn.validate(dtoInRaw, {
        abortEarly: false,
        stripUnknown: true,
    });

    const { listId } = dtoIn;

    await ensureListExists(listId);
    await ensureOwnerOrMember(listId, user.userId);

    const memberships = await Membership.find({ listId });

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
                userId: m.userId.toString(),
                listId: m.listId.toString(),
                role: m.role,
            },
        };
    });

    return { members: membersDto };
}

module.exports = { invite, remove, list };
