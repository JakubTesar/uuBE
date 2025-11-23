const shoppingListService = require("../services/shoppingListService");

async function create(req, res, next) {
    try {
        const dtoOut = await shoppingListService.create(req.user, req.body);
        res.json({ data: dtoOut });
    } catch (e) {
        next(e);
    }
}

async function get(req, res, next) {
    try {
        const dtoOut = await shoppingListService.get(req.user, {
            listId: req.params.listId,
        });
        res.json({ data: dtoOut });
    } catch (e) {
        next(e);
    }
}

async function listMine(req, res, next) {
    try {
        const dtoOut = await shoppingListService.listMine(req.user);
        res.json({ data: dtoOut });
    } catch (e) {
        next(e);
    }
}

async function update(req, res, next) {
    try {
        const dtoOut = await shoppingListService.update(req.user, {
            listId: req.params.listId,
            ...req.body,
        });
        res.json({ data: dtoOut });
    } catch (e) {
        next(e);
    }
}

async function remove(req, res, next) {
    try {
        const dtoOut = await shoppingListService.remove(req.user, {
            listId: req.params.listId,
        });
        res.json({ data: dtoOut });
    } catch (e) {
        next(e);
    }
}

module.exports = { create, get, listMine, update, remove };
