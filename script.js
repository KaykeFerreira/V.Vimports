/* =========================
   VV IMPORTS — SCRIPT FINAL ESTÁVEL
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

function toast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2000);
}

/* =========================
   CARRINHO
========================= */

function atualizarBadge() {
  const total = carrinho.reduce((a, i) => a + i.quantidade, 0);
  document.querySelectorAll(".cart-badge").forEach(b => {
    b.textContent = total;
  });
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
  toast("Adicionado ao carrinho");
}

function removerCarrinho(id) {
  const item = carrinho.find(i => i.id == id);
  if (!item) return;

  if (item.quantidade > 1) item.quantidade--;
  else carrinho = carrinho.filter(i => i.id != id);

  salvarCarrinho();
  renderizarCarrinho();
  atualizarBadge();
}

/* =========================
   RENDER CARRINHO
========================= */

function renderizarCarrinho() {
  const box = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  if (!box) return;

  let total = 0;
  box.innerHTML = "";

  if (carrinho.length === 0) {
    box.innerHTML = `<p class="empty-msg">Carrinho vazio</p>`;
    if (totalEl) totalEl.textContent = formatarPreco(0);
    return;
  }

  carrinho.forEach(i => {
    total += i.preco * i.quantidade;

    box.innerHTML += `
      <div class="cart-item">
        <img src="${i.imagem}">
        <div>
          <p>${i.nome}</p>
          <strong>${formatarPreco(i.preco)}</strong>

          <div>
            <button onclick="removerCarrinho(${i.id})">-</button>
            ${i.quantidade}
            <button onclick="adicionarCarrinho(${i.id}, event)">+</button>
          </div>
        </div>
      </div>
    `;
  });

  if (totalEl) totalEl.textContent = formatarPreco(total);
}

/* =========================
   DRAWER
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

/* =========================
   MODAL
========================= */

function abrirProduto(id, e) {
  if (e) e.stopPropagation();

  const p = produtos.find(x => x.id == id);
  if (!p) return;

  const o = document.getElementById("modalOverlay");
  const c = document.getElementById("modalContent");

  c.innerHTML = `
    <div class="modal-layout">
      <img src="${p.imagem}">
      <div>
        <h2>${p.nome}</h2>
        <p>${p.descricao || ""}</p>
        <strong>${formatarPreco(p.preco)}</strong>

        <button onclick="adicionarCarrinho(${p.id}, event)">
          ADICIONAR
        </button>
      </div>
    </div>
  `;

  o.classList.add("active");
}

function fecharModal() {
  document.getElementById("modalOverlay")?.classList.remove("active");
}

/* =========================
   CARD
========================= */

function gerarCard(p, admin = false) {
  return `
    <div class="product-card" onclick="abrirProduto(${p.id}, event)">

      ${p.destaque ? `<div class="product-badge">DESTAQUE</div>` : ""}

      <img src="${p.imagem}">

      <h3>${p.nome}</h3>
      <p>${p.descricao || ""}</p>

      <strong>${formatarPreco(p.preco)}</strong>

      <div class="product-buttons">

        <button onclick="abrirProduto(${p.id}, event)">
          VER MAIS
        </button>

        ${
          admin
            ? `<button onclick="excluirProduto(${p.id}, event)">EXCLUIR</button>`
            : `<button onclick="adicionarCarrinho(${p.id}, event)">COMPRAR</button>`
        }

      </div>
    </div>
  `;
}

/* =========================
   HOME (DESTAQUES CORRETO)
========================= */

function renderizarHome() {
  const box = document.getElementById("homeProducts");
  if (!box) return;

  const destaques = produtos.filter(p => p.destaque === true);

  box.innerHTML = "";

  if (destaques.length === 0) {
    box.innerHTML = `<p>Nenhum destaque ainda</p>`;
    return;
  }

  destaques.forEach(p => {
    box.innerHTML += gerarCard(p);
  });
}

/* =========================
   LOJA
========================= */

function renderizarProdutos(lista) {
  const box = document.getElementById("productsContainer");
  if (!box) return;

  const data = lista || produtos;

  box.innerHTML = "";

  data.forEach(p => {
    box.innerHTML += gerarCard(p);
  });
}

/* =========================
   ADMIN
========================= */

function renderizarAdmin() {
  const box = document.getElementById("adminProducts");
  if (!box) return;

  box.innerHTML = "";

  produtos.forEach(p => {
    box.innerHTML += gerarCard(p, true);
  });
}

function excluirProduto(id, e) {
  if (e) e.stopPropagation();

  produtos = produtos.filter(p => p.id != id);
  salvarProdutos();
  renderizarAdmin();
  renderizarHome();
  toast("Produto removido");
}

/* =========================
   LOGIN
========================= */

const ADMIN_USER = "admin";
const ADMIN_PASS = "vvimports2025";

const login = document.getElementById("adminLoginForm");

if (login) {
  login.addEventListener("submit", e => {
    e.preventDefault();

    const u = document.getElementById("adminUser").value;
    const p = document.getElementById("adminPass").value;

    if (u === ADMIN_USER && p === ADMIN_PASS) {
      sessionStorage.setItem("adminLogado", "true");
      window.location.href = "admin.html";
    } else {
      document.getElementById("loginError").style.display = "block";
    }
  });
}

/* =========================
   CHECK ADMIN
========================= */

function verificarLoginAdmin() {
  if (!sessionStorage.getItem("adminLogado")) {
    window.location.href = "adminlogin.html";
  }
}

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("cartBtn")?.addEventListener("click", abrirCarrinho);
  document.getElementById("cartClose")?.addEventListener("click", fecharCarrinho);
  document.getElementById("cartOverlay")?.addEventListener("click", fecharCarrinho);

  document.getElementById("modalOverlay")?.addEventListener("click", fecharModal);

  if (document.getElementById("homeProducts")) renderizarHome();

  if (document.getElementById("productsContainer")) renderizarProdutos();

  if (document.getElementById("adminProducts")) {
    verificarLoginAdmin();
    renderizarAdmin();
  }

  atualizarBadge();
});
