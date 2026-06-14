/* =========================
   VV IMPORTS — SCRIPT FINAL LIMPO
========================= */

let produtos = JSON.parse(localStorage.getItem("produtosVV")) || [];
let carrinho = JSON.parse(localStorage.getItem("carrinhoVV")) || [];

/* =========================
   SALVAR
========================= */

function salvarProdutos() {
  localStorage.setItem("produtosVV", JSON.stringify(produtos));
}

function salvarCarrinho() {
  localStorage.setItem("carrinhoVV", JSON.stringify(carrinho));
}

/* =========================
   UTIL
========================= */

function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function toast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2500);
}

/* =========================
   CARRINHO
========================= */

function atualizarBadge() {
  const total = carrinho.reduce((a, i) => a + i.quantidade, 0);
  document.querySelectorAll(".cart-badge").forEach(b => b.textContent = total);
}

function adicionarCarrinho(id, e) {
  if (e) e.stopPropagation();

  const p = produtos.find(x => x.id == id);
  if (!p) return;

  const item = carrinho.find(i => i.id == id);

  if (item) item.quantidade++;
  else carrinho.push({ ...p, quantidade: 1 });

  salvarCarrinho();
  atualizarBadge();
  toast("Produto adicionado!");
}

function removerCarrinho(id) {
  const item = carrinho.find(i => i.id == id);
  if (!item) return;

  if (item.quantidade > 1) item.quantidade--;
  else carrinho = carrinho.filter(i => i.id != id);

  salvarCarrinho();
  atualizarBadge();
  renderizarCarrinho();
}

/* =========================
   CARRINHO RENDER
========================= */

function renderizarCarrinho() {
  const box = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  if (!box) return;

  if (carrinho.length === 0) {
    box.innerHTML = `<div class="cart-empty">🛒<p>Carrinho vazio</p></div>`;
    totalEl.textContent = formatarPreco(0);
    return;
  }

  let total = 0;
  box.innerHTML = "";

  carrinho.forEach(i => {
    total += i.preco * i.quantidade;

    box.innerHTML += `
      <div class="cart-item">
        <img src="${i.imagem}">
        <div class="cart-item-info">
          <div class="cart-item-name">${i.nome}</div>
          <div class="cart-item-price">${formatarPreco(i.preco)}</div>

          <div class="cart-qty">
            <button onclick="removerCarrinho(${i.id})">−</button>
            <span>${i.quantidade}</span>
            <button onclick="adicionarCarrinho(${i.id}, event)">+</button>
          </div>
        </div>
      </div>
    `;
  });

  totalEl.textContent = formatarPreco(total);
}

/* =========================
   MODAL
========================= */

function abrirProduto(id, e) {
  if (e) e.stopPropagation();

  const p = produtos.find(x => x.id == id);
  if (!p) return;

  const modal = document.getElementById("modalOverlay");
  const box = document.getElementById("modalBox");
  const content = document.getElementById("modalContent");

  content.innerHTML = `
    <div class="modal-layout">
      <div class="modal-img-wrap">
        <img src="${p.imagem}" class="modal-image">
        ${p.destaque ? `<div class="product-badge">Destaque</div>` : ""}
      </div>

      <div class="modal-details">
        <h2 class="modal-title">${p.nome}</h2>
        <p class="modal-desc">${p.descricao || ""}</p>

        <div class="modal-price">${formatarPreco(p.preco)}</div>

        <button class="btn-buy" onclick="adicionarCarrinho(${p.id}, event)">
          ADICIONAR AO CARRINHO
        </button>
      </div>
    </div>
  `;

  modal.classList.add("active");
  box.classList.add("active");
}

function fecharModal() {
  document.getElementById("modalOverlay")?.classList.remove("active");
  document.getElementById("modalBox")?.classList.remove("active");
}

/* =========================
   CARD PRODUTO
========================= */

function card(p, admin = false) {
  return `
    <div class="product-card" onclick="abrirProduto(${p.id}, event)">
      
      ${p.destaque ? `<div class="product-badge">🔥 Destaque</div>` : ""}

      <div class="product-img-wrap">
        <img src="${p.imagem}">
      </div>

      <div class="product-info">
        <h3 class="product-name">${p.nome}</h3>
        <p class="product-description">${p.descricao || ""}</p>

        <div class="product-price">${formatarPreco(p.preco)}</div>

        <div class="product-buttons">
          <button class="btn-details" onclick="abrirProduto(${p.id}, event)">
            VER MAIS
          </button>

          ${
            admin
              ? `<button class="btn-delete" onclick="excluirProduto(${p.id}, event)">EXCLUIR</button>`
              : `<button class="btn-buy" onclick="adicionarCarrinho(${p.id}, event)">COMPRAR</button>`
          }
        </div>
      </div>
    </div>
  `;
}

/* =========================
   HOME (DESTAQUES)
========================= */

function renderizarHome() {
  const box = document.getElementById("homeProducts");
  if (!box) return;

  const destaques = produtos.filter(p => p.destaque);

  box.innerHTML = destaques.length
    ? destaques.map(card).join("")
    : `<p class="empty-msg">Sem destaques</p>`;
}

/* =========================
   LOJA
========================= */

function renderizarProdutos(lista) {
  const box = document.getElementById("productsContainer");
  if (!box) return;

  const data = lista || produtos;

  box.innerHTML = data.length
    ? data.map(card).join("")
    : `<p class="empty-msg">Sem produtos</p>`;
}

/* =========================
   ADMIN
========================= */

function renderizarAdmin() {
  const box = document.getElementById("adminProducts");
  if (!box) return;

  box.innerHTML = produtos.length
    ? produtos.map(p => card(p, true)).join("")
    : `<p class="empty-msg">Sem produtos</p>`;
}

function excluirProduto(id, e) {
  if (e) e.stopPropagation();
  if (!confirm("Excluir produto?")) return;

  produtos = produtos.filter(p => p.id != id);
  salvarProdutos();
  renderizarAdmin();
  toast("Produto removido");
}

/* =========================
   CADASTRO ADMIN
========================= */

const form = document.getElementById("productForm");

if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault();

    const file = document.getElementById("productImage").files[0];

    const produto = {
      id: Date.now(),
      nome: productName.value,
      marca: productBrand.value,
      categoria: productCategory.value,
      descricao: productDescription.value,
      preco: Number(productPrice.value),
      promo: productPromo.value,
      destaque: document.getElementById("productDestaque").checked
    };

    const reader = new FileReader();

    reader.onload = () => {
      produto.imagem = reader.result;

      produtos.push(produto);
      salvarProdutos();

      renderizarAdmin();
      renderizarHome();

      form.reset();
      toast("Produto salvo!");
    };

    reader.readAsDataURL(file);
  });
}

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  atualizarBadge();

  if (document.getElementById("homeProducts")) renderizarHome();
  if (document.getElementById("productsContainer")) renderizarProdutos();
  if (document.getElementById("adminProducts")) renderizarAdmin();
});
