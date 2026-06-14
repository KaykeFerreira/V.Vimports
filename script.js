let produtos = JSON.parse(localStorage.getItem("produtosVV")) || [];
let carrinho = JSON.parse(localStorage.getItem("carrinhoVV")) || [];

/* =========================
   SALVAR
========================= */
function salvarProdutos(){
  localStorage.setItem("produtosVV", JSON.stringify(produtos));
}

function salvarCarrinho(){
  localStorage.setItem("carrinhoVV", JSON.stringify(carrinho));
}

/* =========================
   FORMATAR PREÇO
========================= */
function formatarPreco(v){
  return Number(v).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
}

/* =========================
   TOAST
========================= */
function toast(msg){
  const t = document.getElementById("toast");
  if(!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2000);
}

/* =========================
   CARRINHO
========================= */
function atualizarBadge(){
  const total = carrinho.reduce((a,i)=>a+i.quantidade,0);
  document.querySelectorAll(".cart-badge").forEach(b=>b.textContent=total);
}

function adicionarCarrinho(id,e){
  if(e) e.stopPropagation();

  const p = produtos.find(x=>x.id==id);
  if(!p) return;

  const item = carrinho.find(x=>x.id==id);

  if(item) item.quantidade++;
  else carrinho.push({...p,quantidade:1});

  salvarCarrinho();
  atualizarBadge();
  toast("Adicionado!");
}

/* =========================
   MODAL
========================= */
function abrirProduto(id,e){
  if(e) e.stopPropagation();

  const p = produtos.find(x=>x.id==id);
  if(!p) return;

  document.getElementById("modalContent").innerHTML = `
    <div class="modal-layout">
      <div class="modal-img-wrap">
        <img src="${p.imagem}" class="modal-image">
      </div>

      <div class="modal-details">
        <h2>${p.nome}</h2>
        <p>${p.descricao||""}</p>

        <div class="modal-price">${formatarPreco(p.preco)}</div>

        <button class="btn-buy" onclick="adicionarCarrinho(${p.id},event)">
          COMPRAR
        </button>
      </div>
    </div>
  `;

  document.getElementById("modalOverlay").classList.add("active");
}

/* =========================
   CARD
========================= */
function card(p,admin=false){
  return `
    <div class="product-card" onclick="abrirProduto(${p.id},event)">

      ${p.destaque ? `<div class="product-badge">⭐ Destaque</div>` : ""}

      <div class="product-img-wrap">
        <img src="${p.imagem}">
      </div>

      <div class="product-info">
        <h3>${p.nome}</h3>
        <p>${p.descricao||""}</p>

        <div class="product-price">${formatarPreco(p.preco)}</div>

        <div class="product-buttons">
          <button class="btn-details" onclick="abrirProduto(${p.id},event)">Ver</button>

          ${
            admin
            ? `<button class="btn-delete" onclick="excluirProduto(${p.id},event)">Excluir</button>`
            : `<button class="btn-buy" onclick="adicionarCarrinho(${p.id},event)">Comprar</button>`
          }
        </div>
      </div>

    </div>
  `;
}

/* =========================
   DESTAQUES HOME
========================= */
function renderHome(){
  const c = document.getElementById("homeProducts");
  if(!c) return;

  const d = produtos.filter(p=>p.destaque);

  c.innerHTML = d.length
    ? d.map(card).join("")
    : "<p>Nenhum destaque</p>";
}

/* =========================
   ADMIN
========================= */
function renderAdmin(){
  const c = document.getElementById("adminProducts");
  if(!c) return;

  c.innerHTML = produtos.length
    ? produtos.map(p=>card(p,true)).join("")
    : "<p>Nenhum produto</p>";
}

function excluirProduto(id,e){
  if(e) e.stopPropagation();
  produtos = produtos.filter(p=>p.id!=id);
  salvarProdutos();
  renderAdmin();
}

/* =========================
   CADASTRO PRODUTO
========================= */
const form = document.getElementById("productForm");

if(form){
  form.addEventListener("submit",e=>{
    e.preventDefault();

    const file = document.getElementById("productImage").files[0];
    const destaque = document.getElementById("productDestaque").checked;

    const reader = new FileReader();

    reader.onload = () => {
      produtos.push({
        id:Date.now(),
        imagem:reader.result,
        nome:document.getElementById("productName").value,
        marca:document.getElementById("productBrand").value,
        categoria:document.getElementById("productCategory").value,
        descricao:document.getElementById("productDescription").value,
        preco:document.getElementById("productPrice").value,
        promo:document.getElementById("productPromo").value,
        destaque
      });

      salvarProdutos();
      renderAdmin();
      form.reset();
      toast("Produto salvo!");
    };

    reader.readAsDataURL(file);
  });
}

/* =========================
   LOGIN ADMIN
========================= */
const loginForm = document.getElementById("adminLoginForm");

if(loginForm){
  loginForm.addEventListener("submit",e=>{
    e.preventDefault();

    const u = adminUser.value;
    const p = adminPass.value;

    if(u==="admin" && p==="vvimports2025"){
      sessionStorage.setItem("adminLogado","true");
      location.href="admin.html";
    }else{
      document.getElementById("loginError").style.display="block";
    }
  });
}

function checkAdmin(){
  if(!sessionStorage.getItem("adminLogado")){
    location.href="adminlogin.html";
  }
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded",()=>{

  if(document.getElementById("homeProducts")) renderHome();
  if(document.getElementById("adminProducts")){
    checkAdmin();
    renderAdmin();
  }

  atualizarBadge();
});
