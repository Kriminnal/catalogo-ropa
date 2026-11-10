// Base de datos de productos estructurada por categorías
const productos = [
    {
        modelo: "Camisa Básica Algodón",
        categoria: "camisas",
        precio: "$12.00",
        colores: [
            { nombre: "Azul", id: "CAM-BAS-AZU", img: "img/CAM-BAS-AZU.jpg" },
            { nombre: "Rojo", id: "CAM-BAS-ROJ", img: "img/CAM-BAS-ROJ.jpg" },
            { nombre: "Negro", id: "CAM-BAS-NEG", img: "img/CAM-BAS-NEG.jpg" }
        ]
    },
    {
        modelo: "Pantalón Jean Clásico",
        categoria: "pantalones",
        precio: "$25.00",
        colores: [
            { nombre: "Azul Oscuro", id: "PAN-JEA-OSC", img: "img/PAN-JEA-OSC.jpg" },
            { nombre: "Claro", id: "PAN-JEA-CLA", img: "img/PAN-JEA-CLA.jpg" }
        ]
    },
    {
        modelo: "Gorra Deportiva",
        categoria: "accesorios",
        precio: "$8.00",
        colores: [
            { nombre: "Negro", id: "GOR-DEP-NEG", img: "img/GOR-DEP-NEG.jpg" }
        ]
    }
];

const telefonoWhatsApp = "584120000000"; // Reemplaza con tu número real
const contenedor = document.getElementById('catalogo-container');
const inputBuscador = document.getElementById('buscador');
const menuCategorias = document.getElementById('menu-categorias');

let categoriaActual = 'todos';

// Crear modal de imagen dinámico
const modalHTML = `
    <div id="modalZoom" class="modal-imagen" onclick="cerrarModal()">
        <span class="modal-cerrar">&times;</span>
        <img id="imgZoomModal" src="" alt="Vista ampliada">
    </div>
`;
document.body.insertAdjacentHTML('beforeend', modalHTML);

// Inicializar botones de categorías
function renderizarCategorias() {
    // Obtener categorías únicas
    const categorias = ['todos', ...new Set(productos.map(p => p.categoria))];
    
    menuCategorias.innerHTML = categorias.map(cat => `
        <button class="btn-cat ${cat === categoriaActual ? 'activo' : ''}" onclick="filtrarPorCategoria('${cat}')">
            ${cat.toUpperCase()}
        </button>
    `).join('');
}

function renderizarProductos(lista) {
    contenedor.innerHTML = "";

    if (lista.length === 0) {
        contenedor.innerHTML = "<p class='no-encontrado'>No se encontraron productos.</p>";
        return;
    }

    lista.forEach((prod, index) => {
        let colorActual = prod.colores[0];

        const card = document.createElement('div');
        card.className = 'producto-card';
        card.innerHTML = `
            <div class="img-container" onclick="abrirModal('${colorActual.img}')">
                <img id="img-${index}" src="${colorActual.img}" alt="${prod.modelo}" loading="lazy">
            </div>
            <div class="info-card">
                <h3>${prod.modelo}</h3>
                <p class="precio">${prod.precio}</p>
                <p class="id-etiqueta">ID: <strong id="id-txt-${index}">${colorActual.id}</strong></p>
                
                <div class="selector-colores">
                    ${prod.colores.map(c => `
                        <button class="btn-color ${c.id === colorActual.id ? 'activo' : ''}" onclick="cambiarVariante(${index}, '${c.id}', '${c.img}', this)">${c.nombre}</button>
                    `).join('')}
                </div>

                <a id="wa-btn-${index}" href="https://wa.me/${telefonoWhatsApp}?text=Hola,%20quiero%20pedir%20el%20producto%20ID:%20${colorActual.id}" target="_blank" class="btn-whatsapp">
                    Pedir por WhatsApp
                </a>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

function cambiarVariante(index, nuevoId, nuevaImg, boton) {
    const imgElement = document.getElementById(`img-${index}`);
    imgElement.src = nuevaImg;
    imgElement.parentElement.setAttribute('onclick', `abrirModal('${nuevaImg}')`);

    document.getElementById(`id-txt-${index}`).innerText = nuevoId;
    
    const waBtn = document.getElementById(`wa-btn-${index}`);
    waBtn.href = `https://wa.me/${telefonoWhatsApp}?text=Hola,%20quiero%20pedir%20el%20producto%20ID:%20${nuevoId}`;

    const botonesColor = boton.parentElement.querySelectorAll('.btn-color');
    botonesColor.forEach(b => b.classList.remove('activo'));
    boton.classList.add('activo');
}

function filtrarPorCategoria(cat) {
    categoriaActual = cat;
    inputBuscador.value = ''; // Limpiar buscador al cambiar de categoría
    renderizarCategorias();

    if (cat === 'todos') {
        renderizarProductos(productos);
    } else {
        const filtrados = productos.filter(p => p.categoria === cat);
        renderizarProductos(filtrados);
    }
}

// Funciones del Modal
function abrirModal(rutaImg) {
    const modal = document.getElementById('modalZoom');
    document.getElementById('imgZoomModal').src = rutaImg;
    modal.style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modalZoom').style.display = 'none';
}

// Buscador en tiempo real
inputBuscador.addEventListener('input', (e) => {
    const texto = e.target.value.toLowerCase();
    
    // Si escribe en el buscador, filtra globalmente
    const filtrados = productos.filter(p => 
        p.modelo.toLowerCase().includes(texto) || 
        p.colores.some(c => c.id.toLowerCase().includes(texto))
    );
    renderizarProductos(filtrados);
});

// Carga inicial
renderizarCategorias();
renderizarProductos(productos);