const { object, number, string } = require("yup");

const inviteDtoIn = object({
    listId: number().integer().positive().required(),
    userId: number().integer().positive().required(),
    role: string().oneOf(["Member"]).required()
});

const removeDtoIn = object({
    listId: number().integer().positive().required(),
    userId: number().integer().positive().required()
});

const listDtoIn = object({
    listId: number().integer().positive().required()
});

async function invite(req, res, next) {
    try {
        const dtoIn = await inviteDtoIn.validate(
            { listId: Number(req.params.listId), ...req.body },
            { abortEarly: false, stripUnknown: true }
        );
        res.json({ data: dtoIn });
    } catch (e) { next(e); }
}

async function remove(req, res, next) {
    try {
        const dtoIn = await removeDtoIn.validate(
            { listId: Number(req.params.listId), userId: Number(req.params.userId) },
            { abortEarly: false, stripUnknown: true }
        );
        res.json({ data: dtoIn });
    } catch (e) { next(e); }
}

async function list(req, res, next) {
    try {
        const dtoIn = await listDtoIn.validate(
            { listId: Number(req.params.listId) },
            { abortEarly: false, stripUnknown: true }
        );
        res.json({ data: dtoIn });
    } catch (e) { next(e); }
}

module.exports = { invite, remove, list };
