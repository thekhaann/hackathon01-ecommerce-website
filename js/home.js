// js/home.js
const API = 'https://fakestoreapi.com/products';
let PRODUCTS = [];
let CART = JSON.parse(localStorage.getItem('cart')||'[]');

const el = {
  productList: document.getElementById('productList'),
  priceRange: document.getElementById('priceRange'),
  priceValue: document.getElementById('priceValue'),
  cartCount: document.getElementById('cart-count'),
  loading: document.getElementById('loadingSpinner'),
  categorySelect: document.getElementById('categorySelect'),
  searchInput: document.getElementById('searchInput'),
};

// show/hide spinner
function setLoading(on){
  el.loading.classList.toggle('d-none', !on);
}

// cart count
function updateCartCount(){
  el.cartCount.textContent = CART.reduce((s,i)=> s + (i.qty||0), 0);
}

// save cart
function saveCart(){ localStorage.setItem('cart', JSON.stringify(CART)); updateCartCount(); }

// fetch products
async function loadProducts(){
  try{
    setLoading(true);
    const res = await fetch(API);
    const data = await res.json();
    PRODUCTS = data;
    populateCategories(data);
    renderProducts(data);
  }catch(e){
    console.error('Failed to fetch', e);
    el.productList.innerHTML = `<div class="col-12 alert alert-danger">Could not load products. Try again later.</div>`;
  }finally{
    setLoading(false);
  }
}

// render grid
function renderProducts(list){
  if(!list.length){
    el.productList.innerHTML = `<div class="col-12 text-center text-muted">No products found.</div>`;
    return;
  }

  el.productList.innerHTML = list.map(p => 
    `<div class="col-6 col-md-4 col-lg-3">
      <div class="card product-card h-100 p-2">
        <div class="text-end pe-2"><span class="badge-cat">${p.category}</span></div>
        <img src="${p.image}" class="product-image" alt="${escapeHtml(p.title)}">
        <div class="card-body d-flex flex-column">
          <div class="product-title">${escapeHtml(p.title)}</div>
          <div class="mt-2 d-flex justify-content-between align-items-center">
            <div class="product-price">$${p.price.toFixed(2)}</div>
            <div>
              <button class="btn btn-sm btn-outline-primary me-1" onclick="openModal(${p.id})">View</button>
              <button class="btn btn-sm btn-primary" onclick="addToCart(${p.id})">Add</button>
            </div>
          </div>
        </div>
      </div>
    </div>`
  ).join('');
}

// helpers
function escapeHtml(s){ return (''+s).replace(/[&<>"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

// add to cart
function addToCart(id, qty=1){
  const prod = PRODUCTS.find(p=>p.id===id);
  if(!prod) return;
  const idx = CART.findIndex(c=>c.id===id);
  if(idx===-1) CART.push({...prod, qty});
  else CART[idx].qty += qty;
  saveCart();
  // brief UI feedback
  const original = document.querySelector(`[onclick="addToCart(${id})"]`);
  if(original){ original.textContent = 'Added'; setTimeout(()=> original.textContent = 'Add', 800); }
}

// product modal (bootstrap)
const bsModal = new bootstrap.Modal(document.getElementById('productModal'), {});
let currentModalProduct = null;

function openModal(id){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  currentModalProduct = p;
  document.getElementById('modalImage').src = p.image;
  document.getElementById('modalTitle').textContent = p.title;
  document.getElementById('modalCategory').textContent = p.category;
  document.getElementById('modalPrice').textContent = `$${p.price.toFixed(2)}`;
  document.getElementById('modalDesc').textContent = p.description;
  document.getElementById('qtyInput').value = 1;
  bsModal.show();
}

// modal qty and add
document.getElementById('qtyMinus').addEventListener('click', ()=> {
  const q = document.getElementById('qtyInput');
  q.value = Math.max(1, Number(q.value)-1);
});
document.getElementById('qtyPlus').addEventListener('click', ()=> {
  const q = document.getElementById('qtyInput');
  q.value = Number(q.value)+1;
});
document.getElementById('modalAddBtn').addEventListener('click', ()=> {
  const qty = Number(document.getElementById('qtyInput').value) || 1;
  if(currentModalProduct) addToCart(currentModalProduct.id, qty);
  bsModal.hide();
});

// price filter
el.priceRange.addEventListener('input', (e) => {
  el.priceValue.textContent = e.target.value;
  applyFilters();
});

// category
function populateCategories(list){
  const cats = Array.from(new Set(list.map(p=>p.category)));
  const html = ['<option value="all">All Categories</option>', ...cats.map(c=>`<option value="${c}">${c}</option>`)];
  el.categorySelect.innerHTML = html.join('');
  el.categorySelect.addEventListener('change', ()=> applyFilters());
}

// search
el.searchInput.addEventListener('input', ()=> applyFilters());

// apply all filters
function applyFilters(){
  const maxPrice = Number(el.priceRange.value);
  const cat = el.categorySelect.value;
  const q = el.searchInput.value.trim().toLowerCase();

  let filtered = PRODUCTS.filter(p => p.price <= maxPrice);
  if(cat !== 'all') filtered = filtered.filter(p => p.category === cat);
  if(q) filtered = filtered.filter(p => p.title.toLowerCase().includes(q));
  renderProducts(filtered);
}

// init
updateCartCount();
loadProducts();