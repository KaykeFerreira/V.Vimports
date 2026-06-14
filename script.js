/* =========================
   VV IMPORTS — SCRIPT.JS
   VERSÃO FINAL LIMPA E ORGANIZADA
========================= */

/* =========================
   ESTADO
========================= */

let produtos = JSON.parse(localStorage.getItem("produtosVV")) || [];
let carrinho = JSON.parse(localStorage.getItem("carrinhoVV")) || [];

/* =========================
   PERSISTÊNCIA
========================= */

function salvarProdutos() {
  localStorage.setItem("produtosVV", JSON.stringify(produtos));
}

function salvarCarrinho() {
  localStorage.setItem("carrinhoVV", JSON.stringify(carrinho));
}

/* =========================
   UTILITÁRIOS
========================= */

function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function mostrarToast(texto) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = texto;
  toast.classList.add("show");

  setTimeout(() => toast.classList.remove("show"), 2500);
}

/* =========================
   CARRINHO
========================= */

function atualizarBadge() {
  const total = carrinho.reduce((acc, i) => acc + i.quantidade, 0);

  document.querySelectorAll(".cart-badge").forEach(badge => {
    badge.textContent = total;
  });
}

function adicionarCarrinho(id, e) {
  if (e) e.stopPropagation();

  const produto = produtos.find(p => p.id == id);
  if (!produto) return;

  const item = carrinho.find(i => i.id == id);

  if (item) {
    item.quantidade++;
  } else {
    carrinho.push({ ...produto, quantidade: 1 });
  }

  salvarCarrinho();
  atualizarBadge();
  mostrarToast("Produto adicionado ao carrinho!");
}

function removerCarrinho(id) {
  const item = carrinho.find(p => p.id == id);
  if (!item) return;

  if (item.quantidade > 1) {
    item.quantidade--;
  } else {
    carrinho = carrinho.filter(p => p.id != id);
  }

  salvarCarrinho();
  atualizarBadge();
  renderizarCarrinho();
}

/* =========================
   RENDER CARRINHO
========================= */

function renderizarCarrinho() {
  const container = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  if (!container) return;

  if (carrinho.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <span>🛒</span>
        <p>Seu carrinho está vazio.</p>
      </div>
    `;
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
        <div class="cart-item-info">
          <div class="cart-item-name">${item.nome}</div>
          <div class="cart-item-price">${formatarPreco(item.preco)}</div>

          <div class="cart-qty">
            <button class="qty-btn" onclick="removerCarrinho(${item.id})">−</button>
            <span>${item.quantidade}</span>
            <button class="qty-btn" onclick="adicionarCarrinho(${item.id}, event)">+</button>
          </div>
        </div>
      </div>
    `;
  });

  if (totalEl) totalEl.textContent = formatarPreco(total);
}

/* =========================
   DRAWER CARRINHO
========================= */

function abrirCarrinho() {
  document.getElementById("cartDrawer")?.classList.add("active");
  document.getElementById("cartOverlay")?.classList.add("active");
  renderizarCarrinho();
}

function fecharCarrinho() {
  document.getElementById("cartDrawer")?.classList.remove("active");
  document.getElementById("cartOverlay")?.classList.remove("active");
}

function finalizarCompra() {
  if (carrinho.length === 0) {
    mostrarToast("Seu carrinho está vazio!");
    return;
  }

  alert("Pedido realizado com sucesso!");

  carrinho = [];
  salvarCarrinho();
  atualizarBadge();
  renderizarCarrinho();
  fecharCarrinho();
}

/* =========================
   MODAL
========================= */

function abrirProduto(id, e) {
  if (e) e.stopPropagation();

  const produto = produtos.find(p => p.id == id);
  if (!produto) return;

  const overlay = document.getElementById("modalOverlay");
  const content = document.getElementById("modalContent");
  const box = document.getElementById("modalBox");

  content.innerHTML = `
    <div class="modal-layout">
      <div class="modal-img-wrap">
        <img src="${produto.imagem}" class="modal-image">
      </div>

      <div class="modal-details">
        <h2 class="modal-title">${produto.nome}</h2>
        <p class="modal-desc">${produto.descricao || ""}</p>

        <div class="modal-price">${formatarPreco(produto.preco)}</div>

        <button class="btn-buy" onclick="adicionarCarrinho(${produto.id}, event)">
          ADICIONAR AO CARRINHO
        </button>
      </div>
    </div>
  `;

  overlay.classList.add("active");
  box.classList.add("active");
}

function fecharModal() {
  document.getElementById("modalOverlay")?.classList.remove("active");
  document.getElementById("modalBox")?.classList.remove("active");
}

/* =========================
   CARD PRODUTO
========================= */

function gerarCardProduto(produto, admin = false) {
  return `
    <div class="product-card" onclick="abrirProduto(${produto.id}, event)">

      ${produto.destaque ? `<div class="product-badge">Destaque</div>` : ""}

      <div class="product-img-wrap">
        <img src="${produto.imagem}">
      </div>

      <div class="product-info">
        <h3 class="product-name">${produto.nome}</h3>
        <p class="product-description">${produto.descricao || ""}</p>

        <div class="product-price">${formatarPreco(produto.preco)}</div>

        <div class="product-buttons">
          <button class="btn-details" onclick="abrirProduto(${produto.id}, event)">
            VER MAIS
          </button>

          ${
            admin
              ? `<button class="btn-delete" onclick="excluirProduto(${produto.id}, event)">EXCLUIR</button>`
              : `<button class="btn-buy" onclick="adicionarCarrinho(${produto.id}, event)">COMPRAR</button>`
          }
        </div>
      </div>
    </div>
  `;
}

/* =========================
   HOME (DESTAQUES REAIS)
========================= */

function renderizarHome() {
  const container = document.getElementById("homeProducts");
  if (!container) return;

  const destaques = produtos.filter(p => p.destaque === true);

  container.innerHTML = "";

  if (destaques.length === 0) {
    container.innerHTML = `<p class="empty-msg">Nenhum destaque disponível.</p>`;
    return;
  }

  destaques.forEach(p => {
    container.innerHTML += gerarCardProduto(p);
  });
}

/* =========================
   LOJA
========================= */

function renderizarProdutos(lista) {
  const container = document.getElementById("productsContainer");
  if (!container) return;

  const dados = lista || produtos;

  container.innerHTML = "";

  if (dados.length === 0) {
    container.innerHTML = `<p class="empty-msg">Nenhum produto encontrado.</p>`;
    return;
  }

  dados.forEach(p => {
    container.innerHTML += gerarCardProduto(p);
  });
}

/* =========================
   BUSCA
========================= */

function iniciarBusca() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  input.addEventListener("input", () => {
    const texto = input.value.toLowerCase();

    const filtrados = produtos.filter(p =>
      p.nome.toLowerCase().includes(texto) ||
      (p.marca && p.marca.toLowerCase().includes(texto)) ||
      (p.categoria && p.categoria.toLowerCase().includes(texto))
    );

    renderizarProdutos(filtrados);
  });
}

/* =========================
   ADMIN
========================= */

function renderizarAdmin() {
  const container = document.getElementById("adminProducts");
  if (!container) return;

  container.innerHTML = "";

  if (produtos.length === 0) {
    container.innerHTML = `<p class="empty-msg">Nenhum produto cadastrado.</p>`;
    return;
  }

  produtos.forEach(p => {
    container.innerHTML += gerarCardProduto(p, true);
  });
}

function excluirProduto(id, e) {
  if (e) e.stopPropagation();

  if (!confirm("Deseja excluir este produto?")) return;

  produtos = produtos.filter(p => p.id != id);
  salvarProdutos();
  renderizarAdmin();

  mostrarToast("Produto removido!");
}

/* =========================
   LOGIN ADMIN
========================= */

const ADMIN_USER = "admin";
const ADMIN_PASS = "vvimports2025";

const loginForm = document.getElementById("adminLoginForm");

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const user = document.getElementById("adminUser").value;
    const pass = document.getElementById("adminPass").value;

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
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

function logoutAdmin() {
  sessionStorage.removeItem("adminLogado");
  window.location.href = "adminlogin.html";
}

/* =========================
   MENU MOBILE
========================= */

document.getElementById("hamburger")?.addEventListener("click", () => {
  document.querySelector(".nav")?.classList.toggle("open");
});

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("cartBtn")?.addEventListener("click", abrirCarrinho);
  document.getElementById("cartClose")?.addEventListener("click", fecharCarrinho);
  document.getElementById("cartOverlay")?.addEventListener("click", fecharCarrinho);
  document.querySelector(".btn-checkout")?.addEventListener("click", finalizarCompra);

  document.getElementById("modalClose")?.addEventListener("click", fecharModal);
  document.getElementById("modalOverlay")?.addEventListener("click", fecharModal);

  if (document.getElementById("homeProducts")) renderizarHome();
  if (document.getElementById("productsContainer")) {
    renderizarProdutos();
    iniciarBusca();
  }

  if (document.getElementById("adminProducts")) {
    verificarLoginAdmin();
    renderizarAdmin();
  }

  atualizarBadge();
});
