// ==========================================
// 1. CONFIGURACIÓN DE LA TIENDA Y CATÁLOGO
// ==========================================
const TELEFONO_TIENDA = "584120000000"; // <-- COLOCA AQUÍ EL NÚMERO DE WHATSAPP DE LA TIENDA

const productos = [
    {
        modelo: "Camisa Básica Algodón",
        categoria: "camisas",
        precio: 12.00,
        colores: [
            { nombre: "Azul", id: "CAM-BAS-AZU", img: "img/CAM-BAS-AZU.jpg", stock: 5 },
            { nombre: "Rojo", id: "CAM-BAS-ROJ", img: "img/CAM-BAS-ROJ.jpg", stock: 0 }, // Agotado
            { nombre: "Negro", id: "CAM-BAS-NEG", img: "img/CAM-BAS-NEG.jpg", stock: 10 }
        ]
    },
    {
        modelo: "Pantalón Jeans Clásico",
        categoria: "pantalones",
        precio: 22.00,
        colores: [
            { nombre: "Azul Oscuro", id: "PAN-JEA-AZU", img: "img/PAN-JEA-OSC.jpg", stock: 8 },
            { nombre: "Negro", id: "PAN-JEA-NEG", img: "img/PAN-JEA-NEG.jpg", stock: 3 }
        ]
    }
    // Agrega aquí el resto de tus productos manteniendo esta misma estructura
];

// ==========================================
// 2. VARIABLES GLOBALES Y ESTADO
// ==========================================
let categoriaActual = "todos";
let listaFiltrada = [...productos];
let seleccionActualPorCard = {}; // Guarda qué variante tiene seleccionada cada tarjeta
let carrito = [];

const contenedor = document.getElementById("catalogo");

// ==========================================
// 3. RENDERIZADO DE PRODUCTOS Y VARIANTES
// ==========================================
function renderizarProductos(lista) {
    contenedor.innerHTML = "";
    seleccionActualPorCard = {};

    if (lista.length === 0) {
        contenedor.innerHTML = "<p class='no-encontrado'>No se encontraron productos con ese criterio.</p>";
        return;
    }

    lista.forEach((prod, index) => {
        const colorInicial = prod.colores[0];
        seleccionActualPorCard[index] = {
            modelo: prod.modelo,
            precio: prod.precio,
            ...colorInicial
        };

        const estaAgotado = colorInicial.stock <= 0;

        const card = document.createElement("div");
        card.className = "producto-card";
        card.innerHTML = `
            <div class="img-container" onclick="abrirModal('${colorInicial.img}')">
                <span id="badge-${index}" class="badge-agotado" style="display: ${estaAgotado ? 'block' : 'none'};">AGOTADO</span>
                <img id="img-${index}" src="${colorInicial.img}" alt="${prod.modelo}" loading="lazy">
            </div>
            <div class="info-card">
                <h3>${prod.modelo}</h3>
                <p class="precio">$${prod.precio.toFixed(2)}</p>
                <p class="id-etiqueta">Código: <strong id="id-txt-${index}">${colorInicial.id}</strong></p>
                <p class="stock-txt" id="stock-${index}" style="color: ${estaAgotado ? '#e63946' : '#2a9d8f'}">
                    ${estaAgotado ? 'Sin existencia' : `Disponibles: ${colorInicial.stock}`}
                </p>
                
                <div class="selector-colores">
                    ${prod.colores.map((c, cIndex) => `
                        <button class="btn-color ${cIndex === 0 ? 'activo' : ''}" 
                            onclick="cambiarVariante(${index}, ${cIndex}, this)">
                            ${c.nombre}
                        </button>
                    `).join("")}
                </div>

                <div class="contador-container" id="cont-qty-${index}" style="display: ${estaAgotado ? 'none' : 'flex'};">
                    <button class="btn-qty" onclick="cambiarCantidad(${index}, -1)">-</button>
                    <input type="number" class="input-qty" id="qty-${index}" value="1" min="1" max="${colorInicial.stock}" 
                        onchange="validarCantidad(${index})">
                    <button class="btn-qty" onclick="cambiarCantidad(${index}, 1)">+</button>
                </div>

                <button id="btn-add-${index}" class="btn-agregar" onclick="agregarAlCarrito(${index})" ${estaAgotado ? 'disabled' : ''}>
                    ${estaAgotado ? 'Agotado' : '🛒 Agregar al Carrito'}
                </button>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

function cambiarVariante(cardIndex, colorIndex, boton) {
    const prod = listaFiltrada[cardIndex];
    const variante = prod.colores[colorIndex];

    // Guardamos la nueva variante seleccionada
    seleccionActualPorCard[cardIndex] = {
        modelo: prod.modelo,
        precio: prod.precio,
        ...variante
    };

    // Actualizamos imagen y zoom
    const imgElement = document.getElementById(`img-${cardIndex}`);
    imgElement.src = variante.img;
    imgElement.parentElement.setAttribute("onclick", `abrirModal('${variante.img}')`);

    // Actualizamos textos e indicadores de stock
    const estaAgotado = variante.stock <= 0;
    document.getElementById(`id-txt-${cardIndex}`).innerText = variante.id;
    document.getElementById(`badge-${cardIndex}`).style.display = estaAgotado ? "block" : "none";

    const stockTxt = document.getElementById(`stock-${cardIndex}`);
    stockTxt.innerText = estaAgotado ? "Sin existencia" : `Disponibles: ${variante.stock}`;
    stockTxt.style.color = estaAgotado ? "#e63946" : "#2a9d8f";

    // Actualizamos selector de cantidad y botón
    const contQty = document.getElementById(`cont-qty-${cardIndex}`);
    const inputQty = document.getElementById(`qty-${cardIndex}`);
    const btnAdd = document.getElementById(`btn-add-${cardIndex}`);

    if (estaAgotado) {
        contQty.style.display = "none";
        btnAdd.disabled = true;
        btnAdd.innerText = "Agotado";
    } else {
        contQty.style.display = "flex";
        inputQty.max = variante.stock;
        inputQty.value = 1;
        btnAdd.disabled = false;
        btnAdd.innerText = "🛒 Agregar al Carrito";
    }

    // Resaltar botón de color activo
    const botonesColor = boton.parentElement.querySelectorAll(".btn-color");
    botonesColor.forEach(b => b.classList.remove("activo"));
    boton.classList.add("activo");
}

// ==========================================
// 4. CONTROL DE CANTIDADES (+ / - / MANUAL)
// ==========================================
function cambiarCantidad(index, delta) {
    const input = document.getElementById(`qty-${index}`);
    const maxStock = seleccionActualPorCard[index].stock;
    let valor = (parseInt(input.value) || 1) + delta;

    if (valor < 1) valor = 1;
    if (valor > maxStock) valor = maxStock;

    input.value = valor;
}

function validarCantidad(index) {
    const input = document.getElementById(`qty-${index}`);
    const maxStock = seleccionActualPorCard[index].stock;
    let valor = parseInt(input.value) || 1;

    if (valor < 1) valor = 1;
    if (valor > maxStock) {
        alert(`Solo hay ${maxStock} unidades disponibles de este color.`);
        valor = maxStock;
    }
    input.value = valor;
}

// ==========================================
// 5. LÓGICA DEL CARRITO DE COMPRAS
// ==========================================
function toggleCarrito() {
    document.getElementById("panel-carrito").classList.toggle("abierto");
    document.getElementById("overlay-carrito").classList.toggle("abierto");
}

function agregarAlCarrito(index) {
    const itemSeleccionado = seleccionActualPorCard[index];
    const cantidadSolicitada = parseInt(document.getElementById(`qty-${index}`).value) || 1;

    // Verificar si ya existe ese mismo ID/color en el carrito
    const existente = carrito.find(item => item.id === itemSeleccionado.id);

    if (existente) {
        const nuevaCantidadTotal = existente.cantidad + cantidadSolicitada;
        if (nuevaCantidadTotal > itemSeleccionado.stock) {
            alert(`No puedes agregar más. El stock máximo disponible es ${itemSeleccionado.stock} y ya tienes ${existente.cantidad} en tu carrito.`);
            return;
        }
        existente.cantidad = nuevaCantidadTotal;
    } else {
        carrito.push({
            id: itemSeleccionado.id,
            modelo: itemSeleccionado.modelo,
            color: itemSeleccionado.nombre,
            precio: itemSeleccionado.precio,
            img: itemSeleccionado.img,
            cantidad: cantidadSolicitada,
            stockMax: itemSeleccionado.stock
        });
    }

    actualizarInterfazCarrito();
    
    // Pequeña confirmación visual en el botón
    const btn = document.getElementById(`btn-add-${index}`);
    const textoOriginal = btn.innerText;
    btn.innerText = "✅ ¡Agregado!";
    btn.style.backgroundColor = "#2a9d8f";
    setTimeout(() => {
        btn.innerText = textoOriginal;
        btn.style.backgroundColor = "";
    }, 900);
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    actualizarInterfazCarrito();
}

function vaciarCarrito() {
    if (carrito.length === 0) return;
    carrito = [];
    actualizarInterfazCarrito();
}

function actualizarInterfazCarrito() {
    const listaCarrito = document.getElementById("lista-carrito");
    const contadorCarrito = document.getElementById("contador-carrito");
    const totalCarrito = document.getElementById("total-carrito");
    const btnWhatsapp = document.getElementById("btn-enviar-whatsapp");

    // Actualizar contador de piezas totales
    const totalPiezas = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    contadorCarrito.innerText = totalPiezas;

    if (carrito.length === 0) {
        listaCarrito.innerHTML = "<p class='carrito-vacio'>Tu carrito está vacío.</p>";
        totalCarrito.innerText = "$0.00";
        btnWhatsapp.disabled = true;
        return;
    }

    btnWhatsapp.disabled = false;
    listaCarrito.innerHTML = "";
    let montoTotal = 0;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        montoTotal += subtotal;

        const div = document.createElement("div");
        div.className = "item-carrito";
        div.innerHTML = `
            <img src="${item.img}" alt="${item.modelo}">
            <div class="item-info">
                <h4>${item.modelo}</h4>
                <p>Color: ${item.color} | Cód: ${item.id}</p>
                <p><strong>${item.cantidad} x $${item.precio.toFixed(2)} = $${subtotal.toFixed(2)}</strong></p>
            </div>
            <button class="btn-eliminar-item" onclick="eliminarDelCarrito('${item.id}')" title="Quitar">&times;</button>
        `;
        listaCarrito.appendChild(div);
    });

    totalCarrito.innerText = `$${montoTotal.toFixed(2)}`;
}

// ==========================================
// 6. ENVÍO DE PEDIDO POR WHATSAPP
// ==========================================
function enviarPedidoWhatsApp() {
    if (carrito.length === 0) return;

    let mensaje = "¡Hola! Me gustaría realizar el siguiente pedido desde el catálogo web:\n\n";
    let total = 0;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        mensaje += `▪️ *${item.cantidad}x* ${item.modelo} (${item.color}) - [Cód: ${item.id}] -> $${subtotal.toFixed(2)}\n`;
    });

    mensaje += `\n*Total estimado: $${total.toFixed(2)}*\n`;
    mensaje += "\nQuedo atento para confirmar disponibilidad y método de pago.";

    const urlWhatsApp = `https://wa.me/${TELEFONO_TIENDA}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, "_blank");
}

// ==========================================
// 7. FILTROS, BUSCADOR Y ZOOM MODAL
// ==========================================
function filtrarPorCategoria(categoria, boton) {
    categoriaActual = categoria;
    document.querySelectorAll(".btn-cat").forEach(b => b.classList.remove("activo"));
    boton.classList.add("activo");
    filtrarProductos();
}

function filtrarProductos() {
    const texto = document.getElementById("buscador").value.toLowerCase().trim();

    listaFiltrada = productos.filter(prod => {
        const coincideCategoria = categoriaActual === "todos" || prod.categoria === categoriaActual;
        const coincideTexto = prod.modelo.toLowerCase().includes(texto) ||
            prod.colores.some(c => c.id.toLowerCase().includes(texto) || c.nombre.toLowerCase().includes(texto));
        return coincideCategoria && coincideTexto;
    });

    renderizarProductos(listaFiltrada);
}

function abrirModal(rutaImg) {
    const modal = document.getElementById("modal-zoom");
    const imgAmpliada = document.getElementById("img-ampliada");
    imgAmpliada.src = rutaImg;
    modal.style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modal-zoom").style.display = "none";
}

// Inicializar catálogo al cargar la página
renderizarProductos(productos);