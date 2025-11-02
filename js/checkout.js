// js/checkout.js
let CART = JSON.parse(localStorage.getItem('cart') || '[]');
const orderSummary = document.getElementById('orderSummary');
const form = document.getElementById('checkoutForm');

function renderSummary(){
  if(!CART.length){
    orderSummary.innerHTML = `<div class="alert alert-info">Your cart is empty. <a href="index.html">Shop</a></div>`;
    return;
  }
  const lines = CART.map(i => `<div class="d-flex justify-content-between"><div>${escapeHtml(i.title)} x ${i.qty}</div><div>$${(i.price*i.qty).toFixed(2)}</div></div>`).join('');
  const total = CART.reduce((s,i)=> s + i.price*i.qty, 0);
  orderSummary.innerHTML = `
    <h5>Order summary</h5>
    <div class="mb-3">${lines}</div>
    <hr>
    <div class="d-flex justify-content-between fw-bold">Total <div>$${total.toFixed(2)}</div></div>
  `;
}

function escapeHtml(s){ return (''+s).replace(/[&<>"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if(!CART.length){ alert('Cart is empty'); return; }
  // simple success flow (in real app you'd POST to backend)
  alert('✅ Order placed successfully! Thank you for your purchase.');
  localStorage.removeItem('cart');
  window.location.href = 'index.html';
});

renderSummary();