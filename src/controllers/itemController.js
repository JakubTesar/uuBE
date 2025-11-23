// src/controllers/itemController.js
const itemService = require("../services/itemService");

// POST /shoppingList/:listId/items
async function add(req, res, next) {
    try {
        const dtoOut = await itemService.add(req.user, {
            listId: req.params.listId,
            ...req.body,
        });
        res.json({ data: dtoOut });
    } catch (e) {
        next(e);
    }
}

// PUT /shoppingList/:listId/items/:itemId
async function update(req, res, next) {
    try {
        const dtoOut = await itemService.update(req.user, {
            listId: req.params.listId,
            itemId: req.params.itemId,
            ...req.body,
        });
        res.json({ data: dtoOut });
    } catch (e) {
        next(e);
    }
}

// DELETE /shoppingList/:listId/items/:itemId
async function remove(req, res, next) {
    try {
        const dtoOut = await itemService.remove(req.user, {
            listId: req.params.listId,
            itemId: req.params.itemId,
        });
        res.json({ data: dtoOut });
    } catch (e) {
        next(e);
    }
}

// POST /shoppingList/:listId/items/:itemId/check
async function check(req, res, next) {
    try {
        const dtoOut = await itemService.check(req.user, {
            listId: req.params.listId,
            itemId: req.params.itemId,
        });
        res.json({ data: dtoOut });
    } catch (e) {
        next(e);
    }
}

// POST /shoppingList/:listId/items/:itemId/uncheck
async function uncheck(req, res, next) {
    try {
        const dtoOut = await itemService.uncheck(req.user, {
            listId: req.params.listId,
            itemId: req.params.itemId,
        });
        res.json({ data: dtoOut });
    } catch (e) {
        next(e);
    }
}

module.exports = { add, update, remove, check, uncheck };
