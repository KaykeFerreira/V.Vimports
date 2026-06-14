/* =========================
   VV IMPORTS — SCRIPT.JS (FIX FINAL)
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

function formatarPreco(v) {
  return Number(v).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function mostrarToast(txt) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = txt;
  toast.classList.add("show");

  setTimeout(() => toast.classList.remove("show"), 2500);
}

/* =========================
   CARRINHO
========================= */

function atualizarBadge() {
  const total = carrinho.reduce((a, b) => a + b.quantidade, 0);
  document.querySelectorAll(".cart-badge").forEach(b => {
    b.textContent = total;
  });
}

function adicionarCarrinho(id, e) {
  if (e) e.stopPropagation();

  const produto = produtos.find(p => p.id == id);
  if (!produto) return;

  const item = carrinho.find(i => i.id == id);

  if (item) item.quantidade++;
  else carrinho.push({ ...produto, quantidade: 1 });

  salvarCarrinho();
  atualizarBadge();
  mostrarToast("Produto adicionado!");
}

function removerCarrinho(id) {
  const item = carrinho.find(p => p.id == id);
  if (!item) return;

  if (item.quantidade > 1) item.quantidade--;
  else carrinho = carrinho.filter(p => p.id != id);

  salvarCarrinho();
  atualizarBadge();
  renderizarCarrinho();
}

/* =========================
   CARRINHO RENDER
========================= */

function renderizarCarrinho() {
  const container = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  if (!container) return;

  if (carrinho.length === 0) {
    container.innerHTML = `<div class="cart-empty"><p>Carrinho vazio</p></div>`;
    if (totalEl) totalEl.textContent = formatarPreco(0);
    return;
  }

  let total = 0;
  container.innerHTML = "";

  carrinho.forEach(item => {
    total += item.preco * item.quantidade;

    container.innerHTML += `
      <div class="cart-item">
        <img src="${item.imagem}" alt="${item.nome}">
        <div>
          <strong>${item.nome}</strong>
          <p>${formatarPreco(item.preco)}</p>

          <button onclick="removerCarrinho(${item.id})">-</button>
          <span>${item.quantidade}</span>
          <button onclick="adicionarCarrinho(${item.id}, event)">+</button>
        </div>
      </div>
    `;
  });

  if (totalEl) totalEl.textContent = formatarPreco(total);
}

/* =========================
   MODAL
========================= */

function abrirProduto(id, e) {
  if (e) e.stopPropagation();

  const produto = produtos.find(p => p.id == id);
  if (!produto) return;

  document.getElementById("modalContent").innerHTML = `
    <img src="${produto.imagem}" style="width:100%;border-radius:10px;">
    <h2>${produto.nome}</h2>
    <p>${produto.descricao || ""}</p>
    <h3>${formatarPreco(produto.preco)}</h3>

    <button onclick="adicionarCarrinho(${produto.id}, event)">
      Comprar
    </button>
  `;

  document.getElementById("modalOverlay")?.classList.add("active");
}

/* =========================
   CARD
========================= */

function gerarCardProduto(p, admin = false) {
  return `
    <div class="product-card" onclick="abrirProduto(${p.id}, event)">
      
      ${p.destaque ? `<div class="product-badge">DESTAQUE</div>` : ""}

      <img src="${p.imagem}" class="product-img">

      <h3>${p.nome}</h3>
      <p>${p.descricao || ""}</p>
      <strong>${formatarPreco(p.preco)}</strong>

      <button onclick="adicionarCarrinho(${p.id}, event)">Comprar</button>

      ${
        admin
          ? `<button onclick="excluirProduto(${p.id}, event)">Excluir</button>`
          : ""
      }
    </div>
  `;
}

/* =========================
   HOME (DESTAQUES)
========================= */

function renderizarHome() {
  const el = document.getElementById("homeProducts");
  if (!el) return;

  const destaques = produtos.filter(p => p.destaque === true);

  el.innerHTML =
    destaques.length > 0
      ? destaques.map(gerarCardProduto).join("")
      : "<p>Sem destaques</p>";
}

/* =========================
   LOJA
========================= */

function renderizarProdutos(lista) {
  const el = document.getElementById("productsContainer");
  if (!el) return;

  const data = lista || produtos;

  el.innerHTML = data.map(p => gerarCardProduto(p)).join("");
}

/* =========================
   ADMIN
========================= */

function renderizarAdmin() {
  const el = document.getElementById("adminProducts");
  if (!el) return;

  el.innerHTML = produtos.map(p => gerarCardProduto(p, true)).join("");
}

function excluirProduto(id, e) {
  if (e) e.stopPropagation();

  produtos = produtos.filter(p => p.id != id);
  salvarProdutos();
  renderizarAdmin();
}

/* =========================
   LOGIN
========================= */

const loginForm = document.getElementById("adminLoginForm");

if (loginForm) {
  loginForm.addEventListener("submit", e => {
    e.preventDefault();

    const u = document.getElementById("adminUser").value;
    const s = document.getElementById("adminPass").value;

    if (u === "admin" && s === "vvimports2025") {
      sessionStorage.setItem("adminLogado", "true");
      window.location.href = "admin.html";
    } else {
      document.getElementById("loginError").style.display = "block";
    }
  });
}

function verificarLoginAdmin() {
  if (!sessionStorage.getItem("adminLogado")) {
    window.location.href = "adminlogin.html";
  }
}

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  atualizarBadge();

  if (document.getElementById("homeProducts")) renderizarHome();
  if (document.getElementById("productsContainer")) renderizarProdutos();
  if (document.getElementById("adminProducts")) {
    verificarLoginAdmin();
    renderizarAdmin();
  }
});
