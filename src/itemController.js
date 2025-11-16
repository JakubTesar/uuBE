const {object, number, string, boolean} = require("yup");

const addDtoIn = object({
    listId: number().integer().positive().required(),
    name: string().min(1).max(120).required()
});

const updateDtoIn = object({
    listId: number().integer().positive().required(),
    itemId: number().integer().positive().required(),
    name: string().min(1).max(120).required(),
    isDone: boolean().required()
});

const idOnlyDtoIn = object({
    listId: number().integer().positive().required(),
    itemId: number().integer().positive().required()
});

async function add(req, res, next) {
    try {
        const dtoIn = await addDtoIn.validate(
            {listId: Number(req.params.listId), ...req.body},
            {abortEarly: false, stripUnknown: true}
        );
        res.json({data: dtoIn});
    } catch (e) {
        next(e);
    }
}

async function update(req, res, next) {
    try {
        const dtoIn = await updateDtoIn.validate(
            {listId: Number(req.params.listId), itemId: Number(req.params.itemId), ...req.body},
            {abortEarly: false, stripUnknown: true}
        );
        res.json({data: dtoIn});
    } catch (e) {
        next(e);
    }
}

async function remove(req, res, next) {
    try {
        const dtoIn = await idOnlyDtoIn.validate(
            {listId: Number(req.params.listId), itemId: Number(req.params.itemId)},
            {abortEarly: false, stripUnknown: true}
        );
        res.json({data: dtoIn});
    } catch (e) {
        next(e);
    }
}

async function check(req, res, next) {
    try {
        const dtoIn = await idOnlyDtoIn.validate(
            {listId: Number(req.params.listId), itemId: Number(req.params.itemId)},
            {abortEarly: false, stripUnknown: true}
        );
        res.json({data: {...dtoIn, isDone: true}});
    } catch (e) {
        next(e);
    }
}

async function uncheck(req, res, next) {
    try {
        const dtoIn = await idOnlyDtoIn.validate(
            {listId: Number(req.params.listId), itemId: Number(req.params.itemId)},
            {abortEarly: false, stripUnknown: true}
        );
        res.json({data: {...dtoIn, isDone: false}});
    } catch (e) {
        next(e);
    }
}

module.exports = {add, update, remove, check, uncheck};
