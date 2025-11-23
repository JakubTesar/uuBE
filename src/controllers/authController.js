const jwt = require("jsonwebtoken");
const { object, string } = require("yup");
const { JWT_SECRET, createError } = require("../services/authService");
const User = require("../models/user");

const loginDtoIn = object({
    email: string().email().required(),
    password: string().min(3).required(),
});

const registerDtoIn = object({
    name: string().min(1).max(100).required(),
    email: string().email().required(),
    password: string().min(3).max(100).required(),
});


async function login(req, res, next) {
    try {
        const dtoIn = await loginDtoIn.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        const user = await User.findOne({ email: dtoIn.email });
        if (!user || user.password !== dtoIn.password) {
            return res.status(401).json({
                error: {
                    code: "InvalidCredentials",
                    message: "Invalid email or password.",
                },
            });
        }

        const token = jwt.sign(
            { userId: user._id.toString(), email: user.email, profile: "User" },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({
            data: {
                token,
                userId: user._id.toString(),
                email: user.email,
                name: user.name,
            },
        });

    } catch (e) {
        next(e);
    }
}


async function register(req, res, next) {
    try {
        const dtoIn = await registerDtoIn.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        const existing = await User.findOne({ email: dtoIn.email });
        if (existing) {
            throw createError(
                400,
                "userAlreadyExists",
                "User with this email already exists.",
                { email: dtoIn.email }
            );
        }

        const user = await User.create({
            name: dtoIn.name,
            email: dtoIn.email,
            password: dtoIn.password,
        });

        res.status(201).json({
            data: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
            },
        });
    } catch (e) {
        next(e);
    }
}


module.exports = { login, register };
