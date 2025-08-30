let carrinho = [];

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
  // Ligações de UI do carrinho
  const { modal, lista, total, limparBtn, finalizarBtn, openCart, closeCart } = ensureCartDOM();

  // Evita erros se o HTML do carrinho não foi inserido
  if (!modal || !lista || !total) {
    console.warn("Estrutura do carrinho não encontrada. Verifique o HTML da modal do carrinho.");
  } else {
    // Abrir / fechar modal
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

    // Botões limpar / finalizar
    if (limparBtn) limparBtn.addEventListener("click", limparCarrinho);
    if (finalizarBtn) finalizarBtn.addEventListener("click", finalizarCompra);

    // Delegação para +/− dentro da lista
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

async function carregarProdutos() {
  try {
    const resposta = await fetch("/api/produtos");

    if (!resposta.ok) throw new Error("Erro ao carregar os produtos.");

    const produtos = await resposta.json();
    const lista = document.getElementById("lista-produtos");
    if (!lista) {
      console.error("Elemento 'lista-produtos' não encontrado.");
      return;
    }

    lista.innerHTML = "";

    if (!Array.isArray(produtos) || produtos.length === 0) {
      lista.innerHTML = "<p>Nenhum produto disponível.</p>";
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
  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);
  }
}

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
  if (!lista || !total) return; // evita erro se HTML não existir

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

function finalizarCompra() {
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }
  // Aqui você pode integrar com checkout, WhatsApp, etc.
  // Exemplo simples:
  const resumo = carrinho.map(i => `${i.nome} x${i.quantidade} = R$ ${(i.preco * i.quantidade).toFixed(2)}`).join("\n");
  alert("Resumo do pedido:\n\n" + resumo);
}
