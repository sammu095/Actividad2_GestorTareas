const express = require("express");
const router = express.Router();
const Tarea = require("../Tarea");
const verificarToken = require("../middleware/auth");

// Proteger todas las rutas de tareas
router.use(verificarToken);

// CREATE: Crear tarea
router.post("/", async (req, res) => {
    try {
        const nuevaTarea = new Tarea({
            nombre: req.body.nombre
        });

        await nuevaTarea.save();
        res.status(201).json(nuevaTarea);

    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
});

// READ: Consultar tareas
router.get("/", async (req, res) => {
    try {
        const tareas = await Tarea.find();
        res.json(tareas);

    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// UPDATE: Actualizar tarea
router.put("/:id", async (req, res) => {
    try {
        const tarea = await Tarea.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!tarea) {
            return res.status(404).json({
                mensaje: "Tarea no encontrada"
            });
        }

        res.json(tarea);

    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
});

// DELETE: Eliminar tarea
router.delete("/:id", async (req, res) => {
    try {
        const tarea = await Tarea.findByIdAndDelete(req.params.id);

        if (!tarea) {
            return res.status(404).json({
                mensaje: "Tarea no encontrada"
            });
        }

        res.json({ mensaje: "Tarea eliminada correctamente" });

    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
});

module.exports = router;
