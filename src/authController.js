const jwt = require("jsonwebtoken");
const { object, string } = require("yup");
const { JWT_SECRET } = require("./authService");

// fake users
const USERS = [
    { id: 1, email: "admin@example.com", password: "admin", profile: "Authorities" },
    { id: 2, email: "user@example.com",  password: "user",  profile: "User" }
];

const loginDtoIn = object({
    email: string().email().required(),
    password: string().min(3).required()
});

async function login(req, res, next) {
    try {
        const dtoIn = await loginDtoIn.validate(req.body, { abortEarly: false, stripUnknown: true });

        const u = USERS.find(x => x.email === dtoIn.email && x.password === dtoIn.password);
        if (!u) {
            return res.status(401).json({
                data: null,
                uuAppErrorMap: { "auth/InvalidCredentials": { type: "error", message: "Invalid email or password." } }
            });
        }
        const token = jwt.sign({ userId: u.id, email: u.email, profile: u.profile }, JWT_SECRET, { expiresIn: "24h" });
        res.json({ data: { token, profile: u.profile } });
    } catch (e) { next(e); }
}

module.exports = { login };
