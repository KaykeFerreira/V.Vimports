/* =========================
   VV IMPORTS — SCRIPT.JS FINAL FIX
========================= */

/* =========================
   ESTADO
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

function mostrarToast(texto) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = texto;
  toast.classList.add("show");

  setTimeout(() => toast.classList.remove("show"), 2500);
}

/* =========================
   BADGE CARRINHO
========================= */

function atualizarBadge() {
  const total = carrinho.reduce((acc, i) => acc + i.quantidade, 0);

  document.querySelectorAll(".cart-badge").forEach(b => {
    b.textContent = total;
  });
}

/* =========================
   CARRINHO
========================= */

function adicionarCarrinho(id, e) {
  if (e) e.stopPropagation();

  const produto = produtos.find(p => p.id == id);
  if (!produto) return;

  const item = carrinho.find(i => i.id == id);

  if (item) item.quantidade++;
  else carrinho.push({ ...produto, quantidade: 1 });

  salvarCarrinho();
  atualizarBadge();
  mostrarToast("Produto adicionado ao carrinho!");
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
        <img src="${item.imagem}">
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

  const p = produtos.find(x => x.id == id);
  if (!p) return;

  document.getElementById("modalContent").innerHTML = `
    <img src="${p.imagem}" style="width:100%;border-radius:10px;">
    <h2>${p.nome}</h2>
    <p>${p.descricao || ""}</p>
    <h3>${formatarPreco(p.preco)}</h3>

    <button onclick="adicionarCarrinho(${p.id}, event)">
      Comprar
    </button>
  `;

  document.getElementById("modalOverlay")?.classList.add("active");
}

function fecharModal() {
  document.getElementById("modalOverlay")?.classList.remove("active");
}

/* =========================
   CARD PRODUTO
========================= */

function gerarCardProduto(p, admin = false) {
  return `
    <div class="product-card" onclick="abrirProduto(${p.id}, event)">

      ${p.destaque ? `<div class="product-badge">DESTAQUE</div>` : ""}

      <img src="${p.imagem}" class="product-img">

      <h3>${p.nome}</h3>
      <p>${p.descricao || ""}</p>

      <strong>${formatarPreco(p.preco)}</strong>

      <button onclick="adicionarCarrinho(${p.id}, event)">
        Comprar
      </button>

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

  el.innerHTML = data.map(gerarCardProduto).join("");
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
  renderizarHome();
  renderizarProdutos();
}

/* =========================
   CADASTRO PRODUTO (FIX PRINCIPAL)
========================= */

const productForm = document.getElementById("productForm");

if (productForm) {
  productForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const file = document.getElementById("productImage").files[0];

    const nome = document.getElementById("productName").value;
    const marca = document.getElementById("productBrand").value;
    const categoria = document.getElementById("productCategory").value;
    const descricao = document.getElementById("productDescription").value;
    const preco = parseFloat(document.getElementById("productPrice").value);
    const promo = document.getElementById("productPromo").value;
    const destaque = document.getElementById("productDestaque")?.checked || false;

    if (!file) {
      alert("Selecione uma imagem!");
      return;
    }

    const reader = new FileReader();

    reader.onload = function () {

      const produto = {
        id: Date.now(),
        imagem: reader.result,
        nome,
        marca,
        categoria,
        descricao,
        preco,
        promo,
        destaque
      };

      produtos.push(produto);
      salvarProdutos();

      renderizarAdmin();
      renderizarHome();
      renderizarProdutos();

      productForm.reset();

      const preview = document.getElementById("imagePreview");
      if (preview) {
        preview.src = "";
        preview.style.display = "none";
      }

      mostrarToast("Produto salvo com sucesso!");
    };

    reader.readAsDataURL(file);
  });
}

/* =========================
   LOGIN
========================= */

const loginForm = document.getElementById("adminLoginForm");

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
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

const imageInput = document.getElementById("productImage");

if (imageInput) {
  imageInput.addEventListener("change", function () {
    const file = this.files[0];
    const preview = document.getElementById("imagePreview");

    if (!file || !preview) return;

    const reader = new FileReader();

    reader.onload = function (e) {
      preview.src = e.target.result;   // 👈 imagem real
      preview.style.display = "block"; // 👈 mostra ela
    };

    reader.readAsDataURL(file);
  });
}
