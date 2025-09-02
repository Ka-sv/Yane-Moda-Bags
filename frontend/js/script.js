let carrinho = [];

// Detecta se está em localhost ou produção
const API_BASE_URL = window.location.hostname.includes("localhost")
  ? "http://localhost:3000"   // quando rodar local
  : "https://yane-moda-bags.onrender.com/api"; // backend no Render (ajustado com /api)

// garante que o HTML do carrinho existe (para evitar erros de null)
function ensureCartDOM() {
  const modal = document.getElementById("cart-modal");
  const lista = document.getElementById("lista-carrinho");
  const total = document.getElementById("total");
  const limparBtn = document.getElementById("limpar-carrinho");
  const finalizarBtn = document.getElementById("finalizar-compra");
  const openCart = document.getElementById("open-cart");
  const closeCart = document.getElementById("close-cart");

  return { modal, lista, total, limparBtn, finalizarBtn, openCart, closeCart };
}

document.addEventListener("DOMContentLoaded", () => {
  const { modal, lista, total, limparBtn, finalizarBtn, openCart, closeCart } = ensureCartDOM();

  if (!modal || !lista || !total) {
    console.warn("Estrutura do carrinho não encontrada. Verifique o HTML da modal do carrinho.");
  } else {
    if (openCart) {
      openCart.addEventListener("click", (e) => {
        e.preventDefault();
        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");
      });
    }
    if (closeCart) {
      closeCart.addEventListener("click", () => {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
      });
    }
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
      }
    });

    if (limparBtn) limparBtn.addEventListener("click", limparCarrinho);
    if (finalizarBtn) finalizarBtn.addEventListener("click", finalizarCompra);

    lista.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const id = btn.getAttribute("data-id");
      const action = btn.getAttribute("data-action");
      if (action === "inc") aumentarQuantidade(id);
      if (action === "dec") diminuirQuantidade(id);
    });
  }

  // Carregar produtos
  carregarProdutos();
});


function adicionarAoCarrinho(id, nome, preco) {
  const item = carrinho.find((i) => i.id === id);
  if (item) item.quantidade++;
  else carrinho.push({ id, nome, preco: Number(preco || 0), quantidade: 1 });
  atualizarCarrinho();
}

function aumentarQuantidade(id) {
  const item = carrinho.find((i) => i.id === id);
  if (item) item.quantidade++;
  atualizarCarrinho();
}

function diminuirQuantidade(id) {
  const item = carrinho.find((i) => i.id === id);
  if (!item) return;
  item.quantidade--;
  if (item.quantidade <= 0) {
    carrinho = carrinho.filter((i) => i.id !== id);
  }
  atualizarCarrinho();
}

function limparCarrinho() {
  carrinho = [];
  atualizarCarrinho();
}

function atualizarCarrinho() {
  const { lista, total } = ensureCartDOM();
  if (!lista || !total) return;

  lista.innerHTML = "";
  let soma = 0;

  if (carrinho.length === 0) {
    lista.innerHTML = `<li class="cart-item"><span class="item-info">Seu carrinho está vazio.</span></li>`;
    total.textContent = `Total: R$ 0,00`;
    return;
  }

  carrinho.forEach((item) => {
    const subtotal = item.preco * item.quantidade;
    soma += subtotal;

    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <div class="item-info">
        <strong>${item.nome}</strong>
        <span class="item-price">R$ ${item.preco.toFixed(2)}</span>
      </div>
      <div class="qty-controls">
        <button type="button" data-action="dec" data-id="${item.id}">−</button>
        <span>x${item.quantidade}</span>
        <button type="button" data-action="inc" data-id="${item.id}">+</button>
        <span class="item-price">R$ ${subtotal.toFixed(2)}</span>
      </div>
    `;
    lista.appendChild(li);
  });

  total.textContent = `Total: R$ ${soma.toFixed(2)}`;
}



const inputBusca = document.getElementById("busca-produtos");
let produtosCarregados = []; 

async function carregarProdutos() {
  try {
    const response = await fetch(`${API_BASE_URL}/produtos`);
    if (!response.ok) throw new Error("Erro ao carregar os produtos.");
    produtosCarregados = await response.json();
    mostrarProdutos(produtosCarregados);
  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);
  }
}

function mostrarProdutos(produtos) {
  const lista = document.getElementById("lista-produtos");
  if (!lista) return;

  lista.innerHTML = "";
  if (!produtos.length) {
    lista.innerHTML = "<p>Nenhum produto encontrado.</p>";
    return;
  }

  produtos.forEach((p) => {
    const div = document.createElement("div");
    div.classList.add("card");
    div.innerHTML = `
      <img src="${p.imagem || 'https://via.placeholder.com/300x200'}" alt="${p.nome || ''}">
      <h3>${p.nome}</h3>
      <p>${p.descricao || ''}</p>
      <strong>R$ ${Number(p.preco || 0).toFixed(2)}</strong>
      <button type="button"
        onclick="adicionarAoCarrinho('${p._id}', '${(p.nome || '').replace(/'/g, "\\'")}', ${Number(p.preco || 0)})">
        Adicionar ao carrinho
      </button>
    `;
    lista.appendChild(div);
  });
}

// Filtro em tempo real
if (inputBusca) {
  inputBusca.addEventListener("input", () => {
    const termo = inputBusca.value.toLowerCase();
    const filtrados = produtosCarregados.filter(p =>
      (p.nome || "").toLowerCase().includes(termo) ||
      (p.descricao || "").toLowerCase().includes(termo) ||
      (p.categoria || "").toLowerCase().includes(termo)
    );
    mostrarProdutos(filtrados);
  });
}


// AJUSTE NO TOPO DO script.js: nada muda no seu API_BASE_URL

async function finalizarCompra() {
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }

  // monta payload de itens p/ backend
  const itens = carrinho.map(i => ({
    id: i.id, nome: i.nome, quantidade: i.quantidade, preco: i.preco
  }));

  try {
    // 1) cria a cobrança Pix no backend (PSP escolhido)
    const res = await fetch(`${API_BASE_URL}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itens /* + endereco + frete + contato */ })
    });
    if (!res.ok) throw new Error("Falha ao iniciar checkout.");
    const { orderId, amount, pix_qr_base64, pix_copia_cola } = await res.json();

    // 2) abre modal com QR + copia e cola
    abrirPixModal({ orderId, amount, pix_qr_base64, pix_copia_cola });

    // 3) começa polling do status
    iniciarPollingStatus(orderId);
  } catch (e) {
    console.error(e);
    alert("Não foi possível finalizar. Tente novamente.");
  }
}

function abrirPixModal({ orderId, amount, pix_qr_base64, pix_copia_cola }) {
  const modal = document.getElementById("pix-modal");
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");

  document.getElementById("pix-total").textContent = `Total: R$ ${Number(amount).toFixed(2)}`;
  document.getElementById("pix-qr").src = `data:image/png;base64,${pix_qr_base64}`;
  const copia = document.getElementById("pix-copia-cola");
  copia.value = pix_copia_cola;

  document.getElementById("copy-pix").onclick = async () => {
    await navigator.clipboard.writeText(copia.value);
    document.getElementById("pix-status").textContent = "Código Pix copiado!";
  };

  document.getElementById("close-pix").onclick = () => fecharPixModal();
  iniciarTimer(15 * 60); // 15 minutos
}

function fecharPixModal() {
  const modal = document.getElementById("pix-modal");
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

let pollingInterval = null;
function iniciarPollingStatus(orderId) {
  const statusEl = document.getElementById("pix-status");
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/orders/${orderId}/status`);
      const { status } = await r.json(); // "pending" | "paid" | "expired"
      statusEl.textContent = status === "pending" ? "Aguardando pagamento..." :
                             status === "paid" ? "Pagamento confirmado! 🎉" :
                             "Cobrança expirada. Gere outra.";
      if (status === "paid" || status === "expired") {
        clearInterval(pollingInterval);
        if (status === "paid") {
          limparCarrinho();
          // redirecionar para página de obrigado
          window.location.href = "/obrigado.html";
        }
      }
    } catch {}
  }, 4000);
}

function iniciarTimer(totalSegundos) {
  const el = document.getElementById("pix-timer");
  let s = totalSegundos;
  const id = setInterval(() => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    el.textContent = `Expira em ${m}:${ss}`;
    if (--s < 0) clearInterval(id);
  }, 1000);
}
