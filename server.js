
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api/tareas", require("./routes/tareas"));
app.use("/api/auth", require("./routes/auth"));

// Ruta principal
app.get("/", (req, res) => {
    res.json({
        mensaje: "API del Gestor de Tareas funcionando correctamente"
    });
});

// Ruta para comprobar el servidor
app.get("/api/health", (req, res) => {
    res.json({
        estado: "Activo",
        servidor: "Express",
        baseDatos: mongoose.connection.readyState === 1
            ? "Conectada"
            : "Desconectada"
    });
});

// Puerto del servidor
const PORT = process.env.PORT || 3000;

// Conexión a MongoDB y arranque del servidor
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB conectado correctamente");

        app.listen(PORT, () => {
            console.log(`Servidor funcionando en http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error al conectar con MongoDB:", error.message);
    });
