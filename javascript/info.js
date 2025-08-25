// tomar id guardado
const selectedId = Number(localStorage.getItem("selectedProductId"));
const product = gorras.find(p => p.id === selectedId);

// inyectar info
if (product) {
  // imágenes swiper
  const imgContainer = document.getElementById("product-images");
  imgContainer.innerHTML = product.imagenesInfo.map(src => `
    <div class="swiper-slide">
      <img src="${src}" alt="${product.name}">
    </div>
  `).join("");

  // datos
  document.getElementById("product-name").textContent = product.name;
  document.getElementById("product-brand").textContent = product.brand;
  document.getElementById("product-description").textContent = product.descripcion;

// inicializar swiper
new Swiper(".product-swiper", {
  loop: true,
  autoplay: {
    delay: 3000,        // tiempo entre slides
    disableOnInteraction: false // sigue en loop 
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  }
});
}
