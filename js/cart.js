// js/cart.js
let CART = JSON.parse(localStorage.getItem('cart') || '[]');

const cartContainer = document.getElementById('cartContainer');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const clearBtn = document.getElementById('clearCartBtn');

function renderCart(){
  if(!CART.length){
    cartContainer.innerHTML = `<div class="alert alert-info">Your cart is empty. <a href="index.html">Shop now</a></div>`;
    cartTotalEl.textContent = '0.00';
    checkoutBtn.classList.add('disabled');
    return;
  }

  checkoutBtn.classList.remove('disabled');

  cartContainer.innerHTML = CART.map((item, idx) => 
    `<div class="card mb-3">
      <div class="row g-0 align-items-center">
        <div class="col-3 col-md-2 text-center p-2">
          <img src="${item.image}" style="max-width:100%; max-height:90px; object-fit:contain;">
        </div>
        <div class="col-5 col-md-7">
          <div class="card-body py-2">
            <h6 class="card-title mb-1">${escapeHtml(item.title)}</h6>
            <p class="text-muted small mb-0">${item.category}</p>
            <div class="mt-2"><strong>$${item.price.toFixed(2)}</strong></div>
          </div>
        </div>
        <div class="col-4 col-md-3 text-end pe-3">
          <div class="d-flex justify-content-end align-items-center gap-2">
            <button class="btn btn-sm btn-outline-secondary" onclick="changeQty(${idx}, -1)">-</button>
            <div>${item.qty}</div>
            <button class="btn btn-sm btn-outline-secondary" onclick="changeQty(${idx}, 1)">+</button>
            <button class="btn btn-sm btn-danger" onclick="removeItem(${idx})">Remove</button>
          </div>
          <div class="text-muted small mt-2">Subtotal: $${(item.price*item.qty).toFixed(2)}</div>
        </div>
      </div>
    </div>`
  ).join('');
  updateTotal();
}

function updateTotal(){
  const total = CART.reduce((s,i)=> s + i.price * i.qty, 0);
  cartTotalEl.textContent = total.toFixed(2);
  localStorage.setItem('cart', JSON.stringify(CART));
  // also update navbar cart count on home (if open)
  try { window.parent?.postMessage?.({type:'updateCart'}, '*'); } catch(e){}
}

function changeQty(i, delta){
  CART[i].qty = Math.max(1, CART[i].qty + delta);
  updateTotal();
  renderCart();
}

function removeItem(i){
  CART.splice(i,1);
  renderCart();
}

function clearCart(){
  if(!confirm('Clear entire cart?')) return;
  CART = [];
  localStorage.removeItem('cart');
  renderCart();
}

function escapeHtml(s){ return (''+s).replace(/[&<>"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

clearBtn.addEventListener('click', clearCart);
renderCart();