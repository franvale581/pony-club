// main.js
console.log("main.js cargado correctamente");

function iniciarApp() {
  // Referencias DOM
  const menuToggle = document.getElementById('menuToggle');
  const barsMenu = document.getElementById('navMenu');
  const cartIcon = document.querySelector('.cart-icon');
  const cartMenu = document.querySelector('.cart');
  const overlay = document.getElementById('overlay');
  const navbarLinks = document.querySelectorAll('.navbar-link');
  const productsCart = document.querySelector('.cart-container');
  const total = document.querySelector('.total');
  const buyBtn = document.querySelector('.btn-buy');
  const deleteBtn = document.querySelector('.btn-delete');
  const cartBubble = document.querySelector('.cart-bubble');
  const closeCartBtn = document.querySelector('.cart-close-btn');
  const closeMenuBtn = document.querySelector('.menu-close-btn');
  const productsContainer = document.querySelector(".products-container");
  const clientForm = document.getElementById('orderForm');
  const paypalContainer = document.getElementById('paypal-button-container');
  const completeSection = document.querySelector('.complete-buy-section');
  const addModal = document.querySelector('.add-modal'); // modal de producto añadido

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // ----------- MENÚ Y CARRITO -----------

  // abrir/cerrar menú
  const toggleMenu = () => {
    if (barsMenu) barsMenu.classList.toggle("open");
    if (cartMenu && cartMenu.classList.contains("open-cart")) {
      cartMenu.classList.remove("open-cart");
      if (overlay) overlay.classList.remove("show-overlay");
      return;
    }
    if (overlay) overlay.classList.toggle("show-overlay");
  };

  // abrir/cerrar carrito
  const toggleCart = () => {
    if (cartMenu) cartMenu.classList.toggle("open-cart");
    if (barsMenu && barsMenu.classList.contains("open")) {
      barsMenu.classList.remove("open");
      if (overlay) overlay.classList.remove("show-overlay");
      return;
    }
    if (overlay) overlay.classList.toggle("show-overlay");
  };

  // cerrar menú al hacer click en link
  const closeOnClick = (e) => {
    if (!e.target.classList.contains("navbar-link")) return;
    if (barsMenu) barsMenu.classList.remove("open");
    if (overlay) overlay.classList.remove("show-overlay");
  };

  // cerrar menú o carrito al clickear overlay
  const closeOnOverlayClick = () => {
    if (barsMenu) barsMenu.classList.remove("open");
    if (cartMenu) cartMenu.classList.remove("open-cart");
    if (overlay) overlay.classList.remove("show-overlay");
  };

  // ----------- RENDERIZADO DE PRODUCTOS -----------

  const renderProducts = () => {
    if (!productsContainer || typeof gorras === "undefined") return;
    productsContainer.innerHTML = gorras.map(({ id, name, brand, price, img }) => `
      <div class="product">
        <img src="${img}" alt="product" class="product-img">
        <div class="product-text-container">
          <h3 class="product-name">${name}</h3>
          <h2 class="created-by-product">${brand}</h2>
          <p class="product-price">$${price.toFixed(2)}</p>
        </div>
        <div class="btn-product-container">
          <button class="btn-add" data-id="${id}">Add</button>
          <button class="btn-info" data-id="${id}">INFO</button>
        </div>
      </div>
    `).join("");
  };

  // ----------- CARRITO -----------

  const saveCart = () => localStorage.setItem("cart", JSON.stringify(cart)); // guardar carrito en localStorage

  // renderizado de carrito
  const renderCart = () => {
    if (!productsCart) return;
    if (!cart.length) {
      productsCart.innerHTML = `<p class="empty-msg">There are no products in the cart.</p>`;
      return;
    }
    productsCart.innerHTML = cart.map(({ id, name, price, img, quantity }) => `
      <div class="cart-item">
        <img src="${img}" alt="producto" />
        <div class="item-info">
          <h3 class="item-title">${name}</h3>
          <p class="item-bid">Price</p>
          <span class="item-price">$ ${price}</span>
        </div>
        <div class="item-handler">
          <span class="quantity-handler down" data-id="${id}">-</span>
          <span class="item-quantity">${quantity}</span>
          <span class="quantity-handler up" data-id="${id}">+</span>
        </div>
      </div>
    `).join("");
  };

  // calcular total del carrito
  const getCartTotal = () => cart.reduce((acc, cur) => cur.price * cur.quantity + acc, 0);

  // mostrar total en pantalla
  const showCartTotal = () => { if (total) total.innerHTML = `$ ${getCartTotal().toFixed(2)}`; };

  // actualizar burbuja de carrito
  const updateCartBubble = () => {
    if (!cartBubble) return;
    const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartBubble.textContent = totalQuantity > 0 ? totalQuantity : "0";
  };

  // actualizar estado de carrito completo
  const updateCartState = () => {
    saveCart();
    renderCart();
    showCartTotal();
    updateCartBubble();
  };

  // ----------- MODAL DE PRODUCTO AÑADIDO -----------

  const showAddModal = () => {
    if (!addModal) return;
    addModal.classList.add("active-modal");
    setTimeout(() => {
      addModal.classList.remove("active-modal");
    }, 2000);
  };

  // ----------- MANEJO DE PRODUCTOS -----------

  const handleProductClick = (e) => {
    if (!gorras) return;
    if (e.target.classList.contains("btn-info")) {
      const id = Number(e.target.dataset.id);
      localStorage.setItem("selectedProductId", id);
      window.location.href = "info-section.html";
    }
    if (e.target.classList.contains("btn-add")) {
      const id = Number(e.target.dataset.id);
      const product = gorras.find(p => p.id === id);
      if (product) addProduct(product);
    }
  };

  // añadir producto al carrito
  const addProduct = (product) => {
    const existing = cart.find(p => p.id === product.id);
    if (existing) existing.quantity++;
    else cart.push({ ...product, quantity: 1 });
    updateCartState();
    showAddModal(); // mostrar modal cuando se añade
  };

  // aumentar/disminuir cantidad en carrito
  const handleQuantity = (e) => {
    const id = e.target.dataset.id;
    const product = cart.find(p => p.id.toString() === id);
    if (!product) return;

    if (e.target.classList.contains("down")) {
      if (product.quantity === 1) {
        if (confirm("¿Eliminar producto del carrito?")) cart = cart.filter(p => p.id !== product.id);
      } else product.quantity--;
    } else if (e.target.classList.contains("up")) product.quantity++;
    updateCartState();
  };

  // ----------- PAYPAL -----------

  // renderizar botón de PayPal
  const renderPayPalButton = (cart) => {
    if (!window.paypal || !paypalContainer) return;
    paypalContainer.innerHTML = "";
    if (!cart.length) return;

    const total = getCartTotal();

    paypal.Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{ amount: { value: total.toFixed(2) } }]
        });
      },
      onApprove: (data, actions) => {
        return actions.order.capture().then(() => {
          // enviar email con order
          emailjs.sendForm('service_4hsq0la', 'template_1sgzyxq', clientForm)
            .then(() => {
              // limpiar carrito
              localStorage.removeItem("cart");
              cart = [];
              updateCartState();
              paypalContainer.innerHTML = "";

              // mensaje de compra completa
              if (completeSection) {
                const resumen = cart.map(p => `${p.quantity}x ${p.name} - $${(p.quantity * p.price).toFixed(2)}`).join('<br>');
                completeSection.innerHTML = `
                <div class="complete-buy-message">
                  <h2>Thank you for your purchase!</h2>
                  <p>You are now part of the Pony Club family. You will receive an email shortly with your order confirmation and tracking number.</p>
                  <div class="order-summary">
                    ${resumen}
                  </div>
                  <button id="backToShop">Back to Shop</button>
                </div>
                `;
                const backBtn = document.getElementById('backToShop');
                if (backBtn) backBtn.addEventListener('click', () => {
                  window.location.href = "shop-now.html";
                });
              }
            })
            .catch(err => console.error("Error al enviar email:", err));
        });
      },
      onError: (err) => {
        console.error("Error PayPal:", err);
      }
    }).render("#paypal-button-container");
  };

  // ----------- FORMULARIO -----------

  if (clientForm) {
    clientForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // generar resumen de carrito
      const resumen = cart.map(p => `${p.quantity}x ${p.name} - $${(p.quantity * p.price).toFixed(2)}`).join('\n');
      document.getElementById("orderSummary").value = resumen;

      // guardar cliente
      const cliente = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        country: document.getElementById("country").value,
        state: document.getElementById("state").value,
        city: document.getElementById("city").value,
        zip: document.getElementById("zip").value
      };
      sessionStorage.setItem('clienteData', JSON.stringify(cliente));

      // ocultar form y mostrar PayPal
      clientForm.style.display = 'none';
      if (paypalContainer) paypalContainer.style.display = 'block';
      renderPayPalButton(cart);
    });
  }

  // ----------- EVENTOS -----------

  if (buyBtn) buyBtn.addEventListener("click", () => {
    localStorage.setItem("cart", JSON.stringify(cart));
    window.location.href = "complete-buy.html";
  });

  if (deleteBtn) deleteBtn.addEventListener("click", () => { cart = []; updateCartState(); });

  if (closeCartBtn) closeCartBtn.addEventListener("click", () => {
    if (cartMenu) cartMenu.classList.remove("open-cart");
    if (overlay) overlay.classList.remove("show-overlay");
  });

  if (closeMenuBtn) closeMenuBtn.addEventListener("click", () => {
    if (barsMenu) barsMenu.classList.remove("open");
    if (overlay) overlay.classList.remove("show-overlay");
  });

  if (menuToggle) menuToggle.addEventListener("click", toggleMenu);
  if (cartIcon) cartIcon.addEventListener("click", toggleCart);
  if (navbarLinks) navbarLinks.forEach(link => link.addEventListener("click", closeOnClick));
  if (overlay) overlay.addEventListener("click", closeOnOverlayClick);
  if (productsContainer) productsContainer.addEventListener("click", handleProductClick);
  if (productsCart) productsCart.addEventListener("click", handleQuantity);

  // ----------- RENDER INICIAL -----------

  renderProducts();
  updateCartState();
}

// Inicializar app al cargar DOM
document.addEventListener("DOMContentLoaded", () => {
  iniciarApp();
});
