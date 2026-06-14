/* =========================
   VV IMPORTS — script.js
   Versão corrigida e completa
========================= */

/* ─────────────────────────
   FIREBASE (futuro)
   Para ativar o Firebase, descomente
   o bloco abaixo e siga o guia em
   LEIA-ME-FIREBASE.md
───────────────────────── */
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-app.js";
// import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc }
//   from "https://www.gstatic.com/firebasejs/10.x.x/firebase-firestore.js";
// import { getStorage, ref, uploadBytes, getDownloadURL }
//   from "https://www.gstatic.com/firebasejs/10.x.x/firebase-storage.js";
//
// const firebaseConfig = {
//   apiKey: "SUA_API_KEY",
//   authDomain: "SEU_PROJETO.firebaseapp.com",
//   projectId: "SEU_PROJETO",
//   storageBucket: "SEU_PROJETO.appspot.com",
//   messagingSenderId: "XXXXX",
//   appId: "XXXXX"
// };
// const app = initializeApp(firebaseConfig);
// const db  = getFirestore(app);
// const storage = getStorage(app);


/* ─────────────────────────
   ESTADO
───────────────────────── */

let produtos  = JSON.parse(localStorage.getItem("produtosVV"))  || [];
let carrinho  = JSON.parse(localStorage.getItem("carrinhoVV"))  || [];

/* ─────────────────────────
   PERSISTÊNCIA LOCAL
───────────────────────── */

function salvarProdutos(){
  localStorage.setItem("produtosVV", JSON.stringify(produtos));
}

function salvarCarrinho(){
  localStorage.setItem("carrinhoVV", JSON.stringify(carrinho));
}

/* ─────────────────────────
   UTILITÁRIOS
───────────────────────── */

function formatarPreco(valor){
  return Number(valor).toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
}

function mostrarToast(texto){
  const toast = document.getElementById("toast");
  if(!toast) return;
  toast.textContent = texto;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

/* ─────────────────────────
   BADGE DO CARRINHO
───────────────────────── */

function atualizarBadge(){
  document.querySelectorAll(".cart-badge").forEach(badge => {
    const total = carrinho.reduce((acc, i) => acc + i.quantidade, 0);
    badge.textContent = total;
  });
}

/* ─────────────────────────
   CARRINHO — ADICIONAR
───────────────────────── */

function adicionarCarrinho(produto, e){
  if(e){ e.stopPropagation(); }

  const item = carrinho.find(i => i.id === produto.id);
  if(item){ item.quantidade++; }
  else { carrinho.push({ ...produto, quantidade:1 }); }

  salvarCarrinho();
  atualizarBadge();
  mostrarToast("✅ Produto adicionado ao carrinho!");
}

function comprarProduto(id, e){
  if(e){ e.stopPropagation(); }
  const produto = produtos.find(p => p.id == id);
  if(produto) adicionarCarrinho(produto, e);
}

/* ─────────────────────────
   CARRINHO — REMOVER
───────────────────────── */

function removerCarrinho(id){
  const item = carrinho.find(p => p.id == id);
  if(!item) return;
  if(item.quantidade > 1){ item.quantidade--; }
  else { carrinho = carrinho.filter(p => p.id != id); }
  salvarCarrinho();
  atualizarBadge();
  renderizarCarrinho();
}

/* ─────────────────────────
   CARRINHO — RENDERIZAR
───────────────────────── */

function renderizarCarrinho(){
  const container = document.getElementById("cartItems");
  const totalEl   = document.getElementById("cartTotal");
  if(!container) return;

  if(carrinho.length === 0){
    container.innerHTML = `
      <div class="cart-empty">
        <span>🛒</span>
        <p>Seu carrinho está vazio.</p>
      </div>`;
    if(totalEl) totalEl.textContent = formatarPreco(0);
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
            <button class="qty-btn" onclick="removerCarrinho('${item.id}')">−</button>
            <span>${item.quantidade}</span>
            <button class="qty-btn" onclick="comprarProduto('${item.id}', event)">+</button>
          </div>
        </div>
      </div>`;
  });

  if(totalEl) totalEl.textContent = formatarPreco(total);
}

/* ─────────────────────────
   CARRINHO — DRAWER
───────────────────────── */

function abrirCarrinho(){
  document.getElementById("cartDrawer")?.classList.add("active");
  document.getElementById("cartOverlay")?.classList.add("active");
  renderizarCarrinho();
}

function fecharCarrinho(){
  document.getElementById("cartDrawer")?.classList.remove("active");
  document.getElementById("cartOverlay")?.classList.remove("active");
}

/* ─────────────────────────
   CARRINHO — FINALIZAR
───────────────────────── */

function finalizarCompra(){
  if(carrinho.length === 0){
    mostrarToast("⚠️ Seu carrinho está vazio!");
    return;
  }
  // Aqui você pode integrar com pagamento (ex: Mercado Pago, Stripe)
  alert("✅ Pedido recebido! Entraremos em contato para confirmar.");
  carrinho = [];
  salvarCarrinho();
  atualizarBadge();
  renderizarCarrinho();
  fecharCarrinho();
}

/* ─────────────────────────
   MODAL DE PRODUTO
───────────────────────── */

function abrirProduto(id, e){
  if(e){ e.stopPropagation(); }

  const produto = produtos.find(p => p.id == id);
  if(!produto) return;

  const overlay = document.getElementById("modalOverlay");
  const content = document.getElementById("modalContent");
  const box     = document.getElementById("modalBox");
  if(!overlay || !content) return;

  content.innerHTML = `
    <div class="modal-layout">
      <div class="modal-img-wrap">
        <img src="${produto.imagem}" alt="${produto.nome}" class="modal-image">
        ${produto.promo ? `<div class="product-badge">${produto.promo}</div>` : ""}
      </div>
      <div class="modal-details">
        ${produto.marca ? `<span class="modal-brand">${produto.marca}</span>` : ""}
        ${produto.categoria ? `<span class="modal-category">${produto.categoria}</span>` : ""}
        <h2 class="modal-title">${produto.nome}</h2>
        <p class="modal-desc">${produto.descricao || ""}</p>
        <div class="modal-price">${formatarPreco(produto.preco)}</div>
        <button class="btn-buy" onclick="adicionarCarrinho(produtos.find(p=>p.id==${id}), event); fecharModal()">
          🛒 ADICIONAR AO CARRINHO
        </button>
      </div>
    </div>`;

  overlay.classList.add("active");
  box?.classList.add("active");
}

function fecharModal(){
  document.getElementById("modalOverlay")?.classList.remove("active");
  document.getElementById("modalBox")?.classList.remove("active");
}

/* ─────────────────────────
   CARDS DE PRODUTO (reutilizável)
───────────────────────── */

function gerarCardProduto(produto, showDelete = false){
  return `
    <div class="product-card" onclick="abrirProduto('${produto.id}')">
      ${produto.promo ? `<div class="product-badge">${produto.promo}</div>` : ""}
      <div class="product-img-wrap">
        <img src="${produto.imagem}" alt="${produto.nome}" loading="lazy">
      </div>
      <div class="product-info">
        ${produto.marca ? `<span class="product-brand">${produto.marca}</span>` : ""}
        <h3 class="product-name">${produto.nome}</h3>
        <p class="product-description">${produto.descricao || ""}</p>
        <div class="product-price">${formatarPreco(produto.preco)}</div>
        <div class="product-buttons">
          <button class="btn-details" onclick="abrirProduto('${produto.id}', event)">VER MAIS</button>
          ${showDelete
            ? `<button class="btn-delete" onclick="excluirProduto('${produto.id}', event)">🗑️ EXCLUIR</button>`
            : `<button class="btn-buy" onclick="comprarProduto('${produto.id}', event)">COMPRAR</button>`
          }
        </div>
      </div>
    </div>`;
}

/* ─────────────────────────
   RENDERIZAR HOME (destaques)
───────────────────────── */

function renderizarHome(){
  const container = document.getElementById("homeProducts");
  if(!container) return;
  container.innerHTML = "";
  const destaque = produtos.slice(0, 4);
  if(destaque.length === 0){
    container.innerHTML = `<p class="empty-msg">Nenhum produto cadastrado ainda.</p>`;
    return;
  }
  destaque.forEach(p => container.innerHTML += gerarCardProduto(p));
}

/* ─────────────────────────
   RENDERIZAR LOJA (todos)
───────────────────────── */

function renderizarProdutos(lista){
  const container = document.getElementById("productsContainer");
  if(!container) return;
  container.innerHTML = "";
  const itens = lista || produtos;
  if(itens.length === 0){
    container.innerHTML = `<p class="empty-msg">Nenhum produto encontrado.</p>`;
    return;
  }
  itens.forEach(p => container.innerHTML += gerarCardProduto(p));
}

/* ─────────────────────────
   BUSCA
───────────────────────── */

function iniciarBusca(){
  const input = document.getElementById("searchInput");
  if(!input) return;
  input.addEventListener("input", function(){
    const texto = this.value.toLowerCase().trim();
    const filtrados = texto
      ? produtos.filter(p =>
          p.nome.toLowerCase().includes(texto) ||
          (p.marca && p.marca.toLowerCase().includes(texto)) ||
          (p.categoria && p.categoria.toLowerCase().includes(texto))
        )
      : produtos;
    renderizarProdutos(filtrados);
  });
}

/* ─────────────────────────
   ADMIN — RENDERIZAR
───────────────────────── */

function renderizarAdmin(){
  const container = document.getElementById("adminProducts");
  if(!container) return;
  container.innerHTML = "";
  if(produtos.length === 0){
    container.innerHTML = `<p class="empty-msg">Nenhum produto cadastrado.</p>`;
    return;
  }
  produtos.forEach(p => container.innerHTML += gerarCardProduto(p, true));
}

/* ─────────────────────────
   ADMIN — EXCLUIR
───────────────────────── */

function excluirProduto(id, e){
  if(e){ e.stopPropagation(); }
  if(!confirm("Tem certeza que deseja excluir este produto?")) return;
  produtos = produtos.filter(p => p.id != id);
  salvarProdutos();
  renderizarAdmin();
  mostrarToast("🗑️ Produto removido!");
}

/* ─────────────────────────
   ADMIN — CADASTRAR PRODUTO
───────────────────────── */

const productForm = document.getElementById("productForm");
if(productForm){
  productForm.addEventListener("submit", function(e){
    e.preventDefault();

    const imageFile = document.getElementById("productImage").files[0];
    const nome      = document.getElementById("productName").value.trim();
    const marca     = document.getElementById("productBrand").value.trim();
    const categoria = document.getElementById("productCategory").value.trim();
    const descricao = document.getElementById("productDescription").value.trim();
    const preco     = parseFloat(document.getElementById("productPrice").value);
    const promo     = document.getElementById("productPromo").value.trim();

    if(!imageFile){
      mostrarToast("⚠️ Selecione uma imagem!");
      return;
    }

    const leitor = new FileReader();
    leitor.onload = function(){
      const produto = {
        id: Date.now(),
        imagem: leitor.result,
        nome, marca, categoria, descricao, preco, promo
      };

      // ── Firebase (futuro): substitua as 3 linhas abaixo por addDoc(collection(db,"produtos"), produto)
      produtos.push(produto);
      salvarProdutos();
      renderizarAdmin();
      // ── fim bloco local

      productForm.reset();
      
      const preview = document.getElementById("imagePreview");
      if(preview){
        preview.style.display = "none";
      }
    
      mostrarToast("✅ Produto cadastrado com sucesso!");
    };
    leitor.readAsDataURL(imageFile);
  });

  // Preview da imagem
  const imageInput = document.getElementById("productImage");
  if(imageInput){
    imageInput.addEventListener("change", function(){
      const preview = document.getElementById("imagePreview");
      if(!preview) return;
      const file = this.files[0];
      if(file){
        const reader = new FileReader();
        reader.onload = e => {
          preview.src = e.target.result;
          preview.style.display = "block";
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

/* ─────────────────────────
   LOGIN DO ADMIN
───────────────────────── */

// Credenciais salvas no localStorage (para uso local sem backend)
// Para produção: use Firebase Auth ou similar
const ADMIN_USER = "admin";
const ADMIN_PASS = "vvimports2025";

function verificarLoginAdmin(){
  const logado = sessionStorage.getItem("adminLogado");

  if(!logado){
    window.location.href = "adminlogin.html";
  }
}

const loginForm = document.getElementById("adminForm");
if(loginForm){
  loginForm.addEventListener("submit", function(e){
    e.preventDefault();
    const user = document.getElementById("adminUser").value;
    const pass = document.getElementById("adminPass").value;
    if(user === ADMIN_USER && pass === ADMIN_PASS){
      sessionStorage.setItem("adminLogado", "true");
      window.location.href = "admin.html";
    } else {
      document.getElementById("loginError").style.display = "block";
    }
  });
}

function logoutAdmin(){
  sessionStorage.removeItem("adminLogado");
  window.location.href = "adminlogin.html";
}

/* ─────────────────────────
   MENU MOBILE
───────────────────────── */

const hamburger = document.getElementById("hamburger");
const nav = document.querySelector(".nav");
if(hamburger && nav){
  hamburger.onclick = () => nav.classList.toggle("open");
}

/* ─────────────────────────
   EVENTOS GLOBAIS
───────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  // Carrinho
  document.getElementById("cartBtn")?.addEventListener("click", abrirCarrinho);
  document.getElementById("cartClose")?.addEventListener("click", fecharCarrinho);
  document.getElementById("cartOverlay")?.addEventListener("click", fecharCarrinho);
  document.querySelector(".btn-checkout")?.addEventListener("click", finalizarCompra);

  // Modal
  document.getElementById("modalClose")?.addEventListener("click", fecharModal);
  document.getElementById("modalOverlay")?.addEventListener("click", e => {
    if(e.target === document.getElementById("modalOverlay")) fecharModal();
  });

  // Páginas específicas
  if(document.getElementById("homeProducts"))    renderizarHome();
  if(document.getElementById("productsContainer")){ renderizarProdutos(); iniciarBusca(); }
  if(document.getElementById("adminProducts")){
    verificarLoginAdmin();
    renderizarAdmin();
  }

  atualizarBadge();
});
