const memberService = require("../services/memberService");

async function invite(req, res, next) {
    try {
        const dtoOut = await memberService.invite(req.user, {
            listId: req.params.listId,
            userId: req.params.userId,
        });
        res.json({ data: dtoOut });
    } catch (e) {
        next(e);
    }
}

async function remove(req, res, next) {
    try {
        const dtoOut = await memberService.remove(req.user, {
            listId: req.params.listId,
            userId: req.params.userId,
        });
        res.json({ data: dtoOut });
    } catch (e) {
        next(e);
    }
}

async function list(req, res, next) {
    try {
        const dtoOut = await memberService.list(req.user, {
            listId: req.params.listId,
        });
        res.json({ data: dtoOut });
    } catch (e) {
        next(e);
    }
}

module.exports = { invite, remove, list };
