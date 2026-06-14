let produtos = JSON.parse(localStorage.getItem("produtosVV")) || [];
let carrinho = JSON.parse(localStorage.getItem("carrinhoVV")) || [];

/* =========================
   SALVAR
========================= */

function salvarProdutos() {
  localStorage.setItem("produtosVV", JSON.stringify(produtos));
}

/* =========================
   FORMATAÇÃO
========================= */

function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

/* =========================
   ATUALIZA HOME AUTOMATICAMENTE
========================= */

function atualizarTelas() {
  renderizarHome();
  renderizarProdutos();
  renderizarAdmin();
}

/* =========================
   CARRINHO
========================= */

function atualizarBadge() {
  const total = carrinho.reduce((acc, i) => acc + i.quantidade, 0);
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

  localStorage.setItem("carrinhoVV", JSON.stringify(carrinho));
  atualizarBadge();
  mostrarToast("Produto adicionado!");
}

/* =========================
   RENDER HOME (DESTAQUES)
========================= */

function renderizarHome() {
  const el = document.getElementById("homeProducts");
  if (!el) return;

  const destaques = produtos.filter(p => p.destaque === true);

  el.innerHTML = "";

  if (destaques.length === 0) {
    el.innerHTML = `<p class="empty-msg">Nenhum destaque ainda.</p>`;
    return;
  }

  destaques.forEach(p => {
    el.innerHTML += gerarCardProduto(p);
  });
}

/* =========================
   CARD (AGORA COM IMAGEM CORRIGIDA)
========================= */

function gerarCardProduto(p, admin = false) {
  return `
    <div class="product-card" onclick="abrirProduto(${p.id}, event)">

      ${p.destaque ? `<div class="product-badge">DESTAQUE</div>` : ""}

      <div class="product-img-wrap">
        <img src="${p.imagem}" alt="${p.nome}">
      </div>

      <div class="product-info">

        <h3>${p.nome}</h3>

        <p>${p.descricao || ""}</p>

        <div class="product-price">
          ${formatarPreco(p.preco)}
        </div>

        <div class="product-buttons">

          <button onclick="adicionarCarrinho(${p.id}, event)">
            COMPRAR
          </button>

          ${
            admin
              ? `<button onclick="excluirProduto(${p.id}, event)">EXCLUIR</button>`
              : ""
          }

        </div>
      </div>
    </div>
  `;
}

/* =========================
   RENDER LOJA
========================= */

function renderizarProdutos(lista) {
  const el = document.getElementById("productsContainer");
  if (!el) return;

  const dados = lista || produtos;

  el.innerHTML = "";

  dados.forEach(p => {
    el.innerHTML += gerarCardProduto(p);
  });
}

/* =========================
   ADMIN RENDER
========================= */

function renderizarAdmin() {
  const el = document.getElementById("adminProducts");
  if (!el) return;

  el.innerHTML = "";

  produtos.forEach(p => {
    el.innerHTML += gerarCardProduto(p, true);
  });
}

/* =========================
   SALVAR PRODUTO (CORRIGIDO)
========================= */

const form = document.getElementById("productForm");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const file = document.getElementById("productImage").files[0];

    if (!file) {
      alert("Selecione uma imagem");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {

      const novoProduto = {
        id: Date.now(),
        imagem: reader.result, // ✅ agora sempre funciona
        nome: document.getElementById("productName").value,
        marca: document.getElementById("productBrand").value,
        categoria: document.getElementById("productCategory").value,
        descricao: document.getElementById("productDescription").value,
        preco: Number(document.getElementById("productPrice").value), // ✅ corrigido
        promo: document.getElementById("productPromo").value,
        destaque: document.getElementById("productDestaque")?.checked || false
      };

      produtos.push(novoProduto);

      salvarProdutos();

      // 🔥 ISSO AQUI RESOLVE SEU PROBLEMA
      atualizarTelas();

      form.reset();

      alert("Produto salvo com sucesso!");
    };

    reader.readAsDataURL(file);
  });
}

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  atualizarTelas();
  atualizarBadge();
});
