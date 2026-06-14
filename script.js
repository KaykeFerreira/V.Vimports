let produtos = JSON.parse(localStorage.getItem("produtosVV")) || [];
let carrinho = JSON.parse(localStorage.getItem("carrinhoVV")) || [];

/* SALVAR */
function salvarProdutos(){
  localStorage.setItem("produtosVV", JSON.stringify(produtos));
}

function salvarCarrinho(){
  localStorage.setItem("carrinhoVV", JSON.stringify(carrinho));
}

/* UTIL */
function formatarPreco(v){
  return Number(v).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
}

function toast(msg){
  const t = document.getElementById("toast");
  if(!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2000);
}

/* CARRINHO */
function atualizarBadge(){
  const total = carrinho.reduce((a,b)=>a+b.quantidade,0);
  document.querySelectorAll(".cart-badge").forEach(e=>e.textContent=total);
}

function adicionarCarrinho(id,e){
  if(e) e.stopPropagation();
  const p = produtos.find(x=>x.id==id);
  if(!p) return;

  const item = carrinho.find(i=>i.id==id);
  if(item) item.quantidade++;
  else carrinho.push({...p,quantidade:1});

  salvarCarrinho();
  atualizarBadge();
  toast("Adicionado!");
}

function removerCarrinho(id){
  const i = carrinho.find(x=>x.id==id);
  if(!i) return;

  if(i.quantidade>1) i.quantidade--;
  else carrinho = carrinho.filter(x=>x.id!=id);

  salvarCarrinho();
  atualizarBadge();
  renderizarCarrinho();
}

/* HOME */
function renderizarHome(){
  const box = document.getElementById("homeProducts");
  if(!box) return;

  const destaques = produtos.filter(p=>p.destaque);

  box.innerHTML = destaques.length
    ? destaques.map(card).join("")
    : "<p>Sem destaques</p>";
}

/* LOJA */
function renderizarProdutos(){
  const box = document.getElementById("productsContainer");
  if(!box) return;

  box.innerHTML = produtos.map(card).join("");
}

/* ADMIN */
function renderizarAdmin(){
  const box = document.getElementById("adminProducts");
  if(!box) return;

  box.innerHTML = produtos.map(p=>card(p,true)).join("");
}

function excluirProduto(id){
  produtos = produtos.filter(p=>p.id!=id);
  salvarProdutos();
  renderizarAdmin();
}

/* CARD */
function card(p,admin=false){
  return `
  <div class="product-card" onclick="abrirProduto(${p.id},event)">
    ${p.destaque?'<div class="product-badge">🔥</div>':''}

    <div class="product-img-wrap">
      <img src="${p.imagem}">
    </div>

    <div class="product-info">
      <h3 class="product-name">${p.nome}</h3>
      <div class="product-price">${formatarPreco(p.preco)}</div>

      <button onclick="adicionarCarrinho(${p.id},event)">Comprar</button>

      ${admin?`<button onclick="excluirProduto(${p.id})">Excluir</button>`:''}
    </div>
  </div>`;
}

/* INIT */
document.addEventListener("DOMContentLoaded",()=>{
  atualizarBadge();

  if(document.getElementById("homeProducts")) renderizarHome();
  if(document.getElementById("productsContainer")) renderizarProdutos();
  if(document.getElementById("adminProducts")) renderizarAdmin();
});
