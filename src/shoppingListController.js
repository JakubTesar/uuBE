const { object, string, number } = require("yup");

//DTOos
const createDtoIn = object({
    name: string().min(1).max(100).required()
});
const getDtoIn = object({
    listId: number().integer().positive().required()
});
const listMineDtoIn = object({}); // nic
const updateDtoIn = object({
    listId: number().integer().positive().required(),
    name: string().min(1).max(100).required()
});
const deleteDtoIn = object({
    listId: number().integer().positive().required()
});

async function create(req, res, next) {
    try {
        const dtoIn = await createDtoIn.validate(req.body, { abortEarly: false, stripUnknown: true });
        res.json({ data: dtoIn});
    } catch (e) { next(e); }
}

async function get(req, res, next) {
    try {
        const dtoIn = await getDtoIn.validate(
            { listId: Number(req.params.listId) },
            { abortEarly: false, stripUnknown: true }
        );
        res.json({ data: dtoIn });
    } catch (e) { next(e); }
}

async function listMine(req, res, next) {
    try {
        const dtoIn = await listMineDtoIn.validate({}, { abortEarly: false, stripUnknown: true });
        res.json({ data: dtoIn });
    } catch (e) { next(e); }
}

async function update(req, res, next) {
    try {
        const dtoIn = await updateDtoIn.validate(
            { listId: Number(req.params.listId), ...req.body },
            { abortEarly: false, stripUnknown: true }
        );
        res.json({ data: dtoIn });
    } catch (e) { next(e); }
}

async function remove(req, res, next) {
    try {
        const dtoIn = await deleteDtoIn.validate(
            { listId: Number(req.params.listId) },
            { abortEarly: false, stripUnknown: true }
        );
        res.json({ data: dtoIn });
    } catch (e) { next(e); }
}

module.exports = { create, get, listMine, update, remove };
