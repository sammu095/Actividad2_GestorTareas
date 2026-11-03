
const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({
            mensaje: "Acceso denegado. No hay token."
        });
    }

    try {
        const tokenLimpio = token.replace("Bearer ", "");

        const verificado = jwt.verify(
            tokenLimpio,
            process.env.JWT_SECRET
        );

        req.usuario = verificado;
        next();

    } catch (error) {
        res.status(400).json({
            mensaje: "Token inválido"
        });
    }
};

module.exports = verificarToken;
