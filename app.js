
// Clase que representa una tarea individual.
class Tarea {
    constructor(nombre, completa = false, id = null) {
        this.id = id;
        this.nombre = nombre;
        this.completa = completa;
    }
}

// Elementos de autenticación
const panelAutenticacion = document.querySelector("#panel-autenticacion");
const panelUsuario = document.querySelector("#panel-usuario");
const panelTareas = document.querySelector("#panel-tareas");

const formularioLogin = document.querySelector("#formulario-login");
const loginCorreo = document.querySelector("#login-correo");
const loginPassword = document.querySelector("#login-password");

const formularioRegistro = document.querySelector("#formulario-registro");
const registroNombre = document.querySelector("#registro-nombre");
const registroCorreo = document.querySelector("#registro-correo");
const registroPassword = document.querySelector("#registro-password");

const mensajeAuth = document.querySelector("#mensaje-auth");
const usuarioActivo = document.querySelector("#usuario-activo");
const cerrarSesionBoton = document.querySelector("#cerrar-sesion");

// Elementos de tareas
const formulario = document.querySelector("#formulario-tarea");
const entrada = document.querySelector("#nueva-tarea");
const mensaje = document.querySelector("#mensaje");
const listaTareas = document.querySelector("#lista-tareas");
const limpiarCompletadasBoton = document.querySelector("#limpiar-completadas");

const API = "http://localhost:3000/api";
let token = sessionStorage.getItem("token");

// Función para mostrar u ocultar los paneles
function mostrarSesion(activa) {
    panelAutenticacion.hidden = activa;
    panelUsuario.hidden = !activa;
    panelTareas.hidden = !activa;

    if (activa) {
        usuarioActivo.textContent = "Sesión iniciada";
    }
}

// Función para cerrar sesión
function cerrarSesion() {
    token = null;
    sessionStorage.removeItem("token");

    gestor.tareas = [];
    gestor.render();

    mostrarSesion(false);
    mensaje.textContent = "";
    mensajeAuth.textContent = "Has cerrado sesión.";
}

// Función para realizar peticiones a la API
async function apiFetch(url, opciones = {}) {
    const headers = {
        ...(opciones.headers || {})
    };

    if (opciones.body) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const respuesta = await fetch(url, {
        ...opciones,
        headers
    });

    return respuesta;
}

// Clase que administra las tareas mediante MongoDB.
class GestorDeTareas {
    constructor() {
        this.tareas = [];
    }

    // Consultar tareas
    async cargar() {
        try {
            const respuesta = await apiFetch(`${API}/tareas`);

            if (!respuesta.ok) {
                if (respuesta.status === 401 || respuesta.status === 400) {
                    cerrarSesion();
                    mensajeAuth.textContent = "Tu sesión expiró. Inicia sesión nuevamente.";
                    return;
                }

                throw new Error("Error al consultar tareas");
            }

            const datos = await respuesta.json();

            this.tareas = datos.map(
                dato => new Tarea(dato.nombre, dato.completa, dato._id)
            );

            this.render();

        } catch (error) {
            console.error(error);
            mensaje.textContent = "No se pudieron cargar las tareas.";
        }
    }

    // Crear tarea
    async agregarTarea(nombre) {
        const respuesta = await apiFetch(`${API}/tareas`, {
            method: "POST",
            body: JSON.stringify({ nombre })
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo agregar la tarea");
        }

        const dato = await respuesta.json();

        this.tareas.push(new Tarea(dato.nombre, dato.completa, dato._id));
        this.render();
    }

    // Editar tarea
    async editarTarea(id, nuevoNombre) {
        const respuesta = await apiFetch(`${API}/tareas/${id}`, {
            method: "PUT",
            body: JSON.stringify({ nombre: nuevoNombre })
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo editar la tarea");
        }

        const dato = await respuesta.json();

        const tarea = this.tareas.find(t => t.id === id);
        if (tarea) tarea.nombre = dato.nombre;

        this.render();
    }

    // Cambiar estado
    async cambiarEstado(id) {
        const tarea = this.tareas.find(t => t.id === id);
        if (!tarea) return;

        const respuesta = await apiFetch(`${API}/tareas/${id}`, {
            method: "PUT",
            body: JSON.stringify({ completa: !tarea.completa })
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo actualizar el estado");
        }

        const dato = await respuesta.json();
        tarea.completa = dato.completa;

        this.render();
    }

    // Eliminar tarea
    async eliminarTarea(id) {
        const respuesta = await apiFetch(`${API}/tareas/${id}`, {
            method: "DELETE"
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo eliminar la tarea");
        }

        this.tareas = this.tareas.filter(t => t.id !== id);
        this.render();
    }

    // Limpiar tareas completadas
    async limpiarCompletadas() {
        const completadas = this.tareas.filter(t => t.completa);

        await Promise.all(
            completadas.map(t =>
                apiFetch(`${API}/tareas/${t.id}`, {
                    method: "DELETE"
                }).then(res => {
                    if (!res.ok) {
                        throw new Error("Error al eliminar tarea");
                    }
                })
            )
        );

        this.tareas = this.tareas.filter(t => !t.completa);
        this.render();
    }

    // Mostrar tareas
    render() {
        const lista = document.querySelector("#lista-tareas");
        const listaVacia = document.querySelector("#lista-vacia");
        const contador = document.querySelector("#contador");

        lista.innerHTML = "";

        this.tareas.forEach(tarea => {
            const elemento = document.createElement("li");
            elemento.className = `tarea ${tarea.completa ? "completa" : ""}`;
            elemento.dataset.id = tarea.id;

            const contenido = document.createElement("div");
            contenido.className = "tarea-contenido";

            const nombre = document.createElement("span");
            nombre.className = "tarea-nombre";
            nombre.textContent = tarea.nombre;

            const estado = document.createElement("span");
            estado.className = "estado";
            estado.textContent = tarea.completa ? "Completada" : "Pendiente";

            contenido.append(nombre, estado);

            const acciones = document.createElement("div");
            acciones.className = "acciones";

            acciones.innerHTML = `
                <button type="button" class="boton boton-secundario" data-accion="estado">
                    ${tarea.completa ? "Reabrir" : "Completar"}
                </button>
                <button type="button" class="boton boton-secundario" data-accion="editar">
                    Editar
                </button>
                <button type="button" class="boton boton-secundario boton-eliminar" data-accion="eliminar">
                    Eliminar
                </button>
            `;

            elemento.append(contenido, acciones);
            lista.append(elemento);
        });

        const pendientes = this.tareas.filter(t => !t.completa).length;

        contador.textContent =
            `${this.tareas.length} ${this.tareas.length === 1 ? "tarea" : "tareas"} · ${pendientes} pendientes`;

        listaVacia.hidden = this.tareas.length > 0;
    }
}

// Crear el gestor
const gestor = new GestorDeTareas();

// Registro de usuario
formularioRegistro.addEventListener("submit", async evento => {
    evento.preventDefault();

    try {
        const respuesta = await fetch(`${API}/auth/registro`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nombre: registroNombre.value.trim(),
                correo: registroCorreo.value.trim(),
                password: registroPassword.value
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.mensaje || "No se pudo registrar el usuario");
        }

        formularioRegistro.reset();
        mensajeAuth.textContent = "Registro exitoso. Ahora puedes iniciar sesión.";

    } catch (error) {
        mensajeAuth.textContent = error.message;
    }
});

// Inicio de sesión
formularioLogin.addEventListener("submit", async evento => {
    evento.preventDefault();

    try {
        const respuesta = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                correo: loginCorreo.value.trim(),
                password: loginPassword.value
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.mensaje || "No se pudo iniciar sesión");
        }

        token = datos.token;
        sessionStorage.setItem("token", token);

        formularioLogin.reset();
        mensajeAuth.textContent = "";
        mostrarSesion(true);

        await gestor.cargar();

    } catch (error) {
        mensajeAuth.textContent = error.message;
    }
});

// Cerrar sesión
cerrarSesionBoton.addEventListener("click", cerrarSesion);

// Agregar tarea
formulario.addEventListener("submit", async evento => {
    evento.preventDefault();

    const nombre = entrada.value.trim();

    if (!nombre) {
        mensaje.textContent = "Escribe una tarea antes de agregarla.";
        entrada.focus();
        return;
    }

    try {
        await gestor.agregarTarea(nombre);
        formulario.reset();
        mensaje.textContent = "Tarea agregada correctamente.";
        entrada.focus();

    } catch (error) {
        mensaje.textContent = error.message;
    }
});

// Acciones de las tareas
listaTareas.addEventListener("click", async evento => {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) return;

    const elemento = boton.closest("li[data-id]");
    const id = elemento.dataset.id;
    const accion = boton.dataset.accion;

    const tarea = gestor.tareas.find(t => t.id === id);
    if (!tarea) return;

    try {
        if (accion === "editar") {
            const nuevoNombre = window.prompt(
                "Edita el nombre de la tarea:",
                tarea.nombre
            );

            if (nuevoNombre === null) return;

            if (!nuevoNombre.trim()) {
                mensaje.textContent = "El nombre no puede estar vacío.";
                return;
            }

            await gestor.editarTarea(id, nuevoNombre.trim());
            mensaje.textContent = "Tarea editada correctamente.";
        }

        if (accion === "eliminar") {
            const confirmar = window.confirm(
                `¿Deseas eliminar la tarea "${tarea.nombre}"?`
            );

            if (!confirmar) return;

            await gestor.eliminarTarea(id);
            mensaje.textContent = "Tarea eliminada correctamente.";
        }

        if (accion === "estado") {
            await gestor.cambiarEstado(id);
            mensaje.textContent = "Estado de la tarea actualizado.";
        }

    } catch (error) {
        mensaje.textContent = error.message;
    }
});

// Limpiar tareas completadas
limpiarCompletadasBoton.addEventListener("click", async () => {
    try {
        await gestor.limpiarCompletadas();
        mensaje.textContent = "Se eliminaron las tareas completadas.";

    } catch (error) {
        mensaje.textContent = error.message;
    }
});

// Comprobar si existe una sesión activa al abrir la página
if (token) {
    mostrarSesion(true);
    gestor.cargar();
} else {
    mostrarSesion(false);
}
