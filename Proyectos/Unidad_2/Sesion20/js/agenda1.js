document.addEventListener("DOMContentLoaded", function () {

    const nombreInput = document.getElementById("nombre");
    const telefonoInput = document.getElementById("telefono");
    const correoInput = document.getElementById("correo");
    const fotoInput = document.getElementById("foto");
    const previewImg = document.getElementById("preview");

    const guardarButton = document.getElementById("guardarBtn");
    const buscarButton = document.getElementById("buscarBtn");
    const eliminarButton = document.getElementById("eliminarBtn");
    const eliminarTodosButton = document.getElementById("eliminarTodosBtn");
    const modificarButton = document.getElementById("modificar");
    const listaContactos = document.getElementById("listaContactos");

    let fotoBase64 = ""; // Variable para guardar la imagen convertida a texto

    // --- LÓGICA PARA LEER Y PREVISUALIZAR LA FOTO ---
    fotoInput.addEventListener("change", function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                fotoBase64 = e.target.result; // Guardamos la imagen en Base64
                previewImg.src = fotoBase64;
                previewImg.style.display = "block";
            };
            reader.readAsDataURL(file);
        } else {
            fotoBase64 = "";
            previewImg.src = "";
            previewImg.style.display = "none";
        }
    });

    function validarTelefono(telefono) {
        return /^\d{9}$/.test(telefono);
    }

    // Función auxiliar para limpiar el formulario
    function limpiarFormulario() {
        nombreInput.value = "";
        telefonoInput.value = "";
        correoInput.value = "";
        fotoInput.value = "";
        fotoBase64 = "";
        previewImg.src = "";
        previewImg.style.display = "none";
    }

    function guardarDatos() {
        const nombre = nombreInput.value.trim();
        const telefono = telefonoInput.value.trim();
        const correo = correoInput.value.trim();

        if (nombre === "" || telefono === "") {
            alert("Por favor, complete al menos el nombre y el teléfono.");
            return;
        }

        if (!validarTelefono(telefono)) {
            alert("El teléfono debe tener exactamente 9 dígitos.");
            return;
        }

        if (localStorage.getItem(nombre)) {
            alert("Ese contacto ya existe.");
            return;
        }

        // Creamos un objeto con toda la información
        const contacto = {
            nombre: nombre,
            telefono: telefono,
            correo: correo,
            foto: fotoBase64 || "https://via.placeholder.com/50" // Imagen por defecto si no sube una
        };

        // Guardamos el objeto convirtiéndolo a texto JSON
        localStorage.setItem(nombre, JSON.stringify(contacto));

        limpiarFormulario();
        actualizarTabla();
        alert("Contacto guardado correctamente.");
    }

    function buscarDatos() {
        const nombreABuscar = nombreInput.value.trim();

        if (nombreABuscar === "") {
            alert("Ingrese un nombre para buscar.");
            return;
        }

        const datosEncontrados = localStorage.getItem(nombreABuscar);

        if (datosEncontrados) {
            try {
                // Parseamos el JSON guardado
                const contacto = JSON.parse(datosEncontrados);
                telefonoInput.value = contacto.telefono || "";
                correoInput.value = contacto.correo || "";
                fotoBase64 = contacto.foto || "";
                
                if (fotoBase64 && fotoBase64 !== "https://via.placeholder.com/50") {
                    previewImg.src = fotoBase64;
                    previewImg.style.display = "block";
                }
            } catch (e) {
                // Por si tenías datos viejos guardados solo como texto
                telefonoInput.value = datosEncontrados;
            }
        } else {
            alert("No se encontró el contacto.");
            telefonoInput.value = "";
            correoInput.value = "";
        }
    }

    function modificarDatos() {
        const nombre = nombreInput.value.trim();
        const telefono = telefonoInput.value.trim();
        const correo = correoInput.value.trim();

        if (nombre === "" || telefono === "") {
            alert("Complete nombre y teléfono para modificar.");
            return;
        }

        if (!validarTelefono(telefono)) {
            alert("El teléfono debe tener exactamente 9 dígitos.");
            return;
        }

        if (!localStorage.getItem(nombre)) {
            alert("El contacto no existe, no se puede modificar.");
            return;
        }

        const contactoModificado = {
            nombre: nombre,
            telefono: telefono,
            correo: correo,
            foto: fotoBase64 || "https://via.placeholder.com/50"
        };

        // Sobrescribimos con los nuevos datos
        localStorage.setItem(nombre, JSON.stringify(contactoModificado));

        limpiarFormulario();
        actualizarTabla();
        alert("Contacto modificado correctamente.");
    }

    function eliminarDatos() {
        const nombreAEliminar = nombreInput.value.trim();

        if (nombreAEliminar === "") {
            alert("Ingrese el nombre del contacto a eliminar.");
            return;
        }

        if (localStorage.getItem(nombreAEliminar)) {
            localStorage.removeItem(nombreAEliminar);
            limpiarFormulario();
            actualizarTabla();
            alert("Contacto eliminado correctamente.");
        } else {
            alert("El contacto no existe.");
        }
    }

    function eliminarTodos() {
        if (localStorage.length === 0) {
            alert("La agenda ya está vacía.");
            return;
        }

        const confirmar = confirm("¿Está seguro de eliminar todos los contactos?");

        if (confirmar) {
            localStorage.clear();
            limpiarFormulario();
            actualizarTabla();
            alert("Todos los contactos fueron eliminados.");
        }
    }

    function actualizarTabla() {
        listaContactos.innerHTML = "";

        for (let i = 0; i < localStorage.length; i++) {
            const clave = localStorage.key(i);
            const datosBrutos = localStorage.getItem(clave);
            
            let contacto;
            try {
                contacto = JSON.parse(datosBrutos);
            } catch (e) {
                // Ignorar datos que no sean objetos JSON válidos (como datos antiguos rotos)
                continue; 
            }

            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>
                    <img src="${contacto.foto}" width="50" height="50" style="object-fit: cover; border-radius: 5px;">
                </td>
                <td>${contacto.nombre}</td>
                <td>${contacto.telefono}</td>
                <td>${contacto.correo || "-"}</td>
            `;

            listaContactos.appendChild(fila);
        }
    }

    // --- EVENT LISTENERS ---
    guardarButton.addEventListener("click", guardarDatos);
    buscarButton.addEventListener("click", buscarDatos);
    modificarButton.addEventListener("click", modificarDatos);
    eliminarButton.addEventListener("click", eliminarDatos);
    eliminarTodosButton.addEventListener("click", eliminarTodos);

    // Cargar tabla al iniciar
    actualizarTabla();
});