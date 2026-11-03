
const express = require("express");
const router = express.Router();
const Usuario = require("../Usuario");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTRO DE USUARIO
router.post("/registro", async (req, res) => {
    try {
        const { nombre, correo, password } = req.body;

        const existe = await Usuario.findOne({ correo });

        if (existe) {
            return res.status(400).json({
                mensaje: "El correo ya está registrado"
            });
        }

        const passwordEncriptada = await bcrypt.hash(password, 10);

        const usuario = new Usuario({
            nombre,
            correo,
            password: passwordEncriptada
        });

        await usuario.save();

        res.status(201).json({
            mensaje: "Usuario registrado correctamente"
        });

    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// INICIO DE SESIÓN
router.post("/login", async (req, res) => {
    try {
        const { correo, password } = req.body;

        const usuario = await Usuario.findOne({ correo });

        if (!usuario) {
            return res.status(400).json({
                mensaje: "Credenciales incorrectas"
            });
        }

        const passwordCorrecta = await bcrypt.compare(
            password,
            usuario.password
        );

        if (!passwordCorrecta) {
            return res.status(400).json({
                mensaje: "Credenciales incorrectas"
            });
        }

        const token = jwt.sign(
            { id: usuario._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            mensaje: "Inicio de sesión correcto",
            token
        });

    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

module.exports = router;
