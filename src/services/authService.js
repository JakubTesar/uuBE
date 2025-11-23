const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-super-secret";

function requireAuth(req, res, next) {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) {
        return res.status(401).json({
            error: {
                code: "NotAuthenticated",
                message: "Missing or invalid Authorization header.",
            },
        });
    }

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({
            error: {
                code: "TokenInvalid",
                message: "Invalid token.",
            },
        });
    }
}

function authorize(allowedProfiles) {
    return (req, res, next) => {
        const ok = req.user && allowedProfiles.includes(req.user.profile);
        if (!ok) {
            return res.status(403).json({
                error: {
                    code: "Forbidden",
                    message: "Not authorized for this endpoint (profile).",
                },
            });
        }
        next();
    };
}
function createError(status, code, message, params = {}) {
    const err = new Error(message);
    err.status = status;
    err.code = code;
    err.params = params;
    err.apiError = true;
    return err;
}

module.exports = { requireAuth, authorize, JWT_SECRET, createError };