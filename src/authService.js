const jwt = require("jsonwebtoken");
const JWT_SECRET = 'debug_key'

function requireAuth(req, res, next) {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
        return res.status(401).json({
            data: null,
            uuAppErrorMap: { "auth/NotAuthenticated": { type: "error", message: "Missing or invalid Authorization header." } }
        });
    }
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({
            data: null,
            uuAppErrorMap: { "auth/TokenInvalid": { type: "error", message: "Invalid token." } }
        });
    }
}

function authorize(allowedProfiles) {
    return (req, res, next) => {
        const ok = req.user && allowedProfiles.includes(req.user.profile);
        if (!ok) {
            return res.status(403).json({
                data: null,
                uuAppErrorMap: { "auth/Forbidden": { type: "error", message: "Not authorized for this." } }
            });
        }
        next();
    };
}

module.exports = { requireAuth, authorize, JWT_SECRET };
