// ------------------- Config -------------------
let carrinho = [];
// const API_BASE_URL = window.location.hostname.includes("localhost")
//   ? "http://localhost:5000"
//   : "https://yane-moda-bags.onrender.com";
  const API_BASE_URL =
  window.location.hostname.includes("localhost") ||
  window.location.hostname.includes("127.0.0.1")
    ? "http://localhost:5000"
    : "https://yane-moda-bags.onrender.com";

let produtosCarregados = [];

// ------------------- DOMContentLoaded -------------------
document.addEventListener("DOMContentLoaded", () => {
  initCarrinho();
  carregarProdutos();
});

// ------------------- Produtos -------------------
const inputBusca = document.getElementById("busca-produtos");

async function carregarProdutos() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/produtos`);
    if (!response.ok) throw new Error("Erro ao carregar produtos");

    produtosCarregados = await response.json();
    mostrarProdutos(produtosCarregados);
  } catch (e) {
    console.error("Erro ao carregar produtos:", e);
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

  produtos.forEach(p => {
    // aceita tanto o campo novo (imagens: [String]) quanto o antigo (imagem: String)
    let imagens = [];

    // Sempre transforma em array
    if (Array.isArray(p.imagens) && p.imagens.length > 0) {
      imagens = p.imagens;
    } else if (p.imagem) {
      imagens = [p.imagem]; // converte string única em array
    }
    
    // Se não tiver nenhuma imagem válida, usa placeholder
    if (!imagens.length) {
      imagens = ["https://via.placeholder.com/300x300?text=Sem+imagem"];
    }
    


    // card
    const card = document.createElement("div");
    card.className = "card produto-card";

    // container da imagem principal + miniaturas (lado a lado)
    const container = document.createElement("div");
    container.className = "produto-container";

    const mainImg = document.createElement("img");
    mainImg.className = "produto-principal";
    mainImg.src = imagens[0];
    mainImg.alt = p.nome || "";

    const thumbsWrapper = document.createElement("div");
    thumbsWrapper.className = "miniaturas";

    // se houver >1 imagens, cria miniaturas com as imagens *exceto* a principal
    if (imagens.length > 1) {
      imagens.slice(1).forEach(src => {
        const t = document.createElement("img");
        t.className = "miniatura";
        t.src = src;
        t.alt = `Variação ${p.nome || ""}`;

        // ao clicar: swap entre thumb e imagem principal
        t.addEventListener("click", () => {
          const tmp = mainImg.src;
          mainImg.src = t.src;
          t.src = tmp;
        });

        thumbsWrapper.appendChild(t);
      });
    }

    container.appendChild(mainImg);
    container.appendChild(thumbsWrapper);

    // infos do produto
    const info = document.createElement("div");
    info.className = "produto-info";
    info.innerHTML = `
      <h3>${p.nome || ""}</h3>
      <p>${p.descricao || ""}</p>
      <strong>R$ ${Number(p.preco || 0).toFixed(2)}</strong>
    `;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "Adicionar ao carrinho";
    btn.addEventListener("click", () =>
      adicionarAoCarrinho(p._id, p.nome, Number(p.preco || 0))
    );

    info.appendChild(btn);

    card.appendChild(container);
    card.appendChild(info);

    lista.appendChild(card);
  });
}



// Busca dinâmica
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

// ------------------- Carrinho -------------------
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

function initCarrinho() {
  const { modal, lista, total, limparBtn, finalizarBtn, openCart, closeCart } = ensureCartDOM();
  if (!modal || !lista || !total) return;

  if (openCart) openCart.addEventListener("click", e => {
    e.preventDefault();
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
  });

  if (closeCart) closeCart.addEventListener("click", () => {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  });

  window.addEventListener("click", e => {
    if (e.target === modal) {
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
    }
  });

  if (limparBtn) limparBtn.addEventListener("click", limparCarrinho);
  if (finalizarBtn) finalizarBtn.addEventListener("click", finalizarCompra);

  lista.addEventListener("click", e => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const action = btn.getAttribute("data-action");
    if (action === "inc") aumentarQuantidade(id);
    if (action === "dec") diminuirQuantidade(id);
  });
}

function adicionarAoCarrinho(id, nome, preco) {
  const item = carrinho.find(i => i.id === id);
  if (item) item.quantidade++;
  else carrinho.push({ id, nome, preco: Number(preco || 0), quantidade: 1 });
  atualizarCarrinho();
}

function aumentarQuantidade(id) {
  const item = carrinho.find(i => i.id === id);
  if (item) item.quantidade++;
  atualizarCarrinho();
}

function diminuirQuantidade(id) {
  const item = carrinho.find(i => i.id === id);
  if (!item) return;
  item.quantidade--;
  if (item.quantidade <= 0) carrinho = carrinho.filter(i => i.id !== id);
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
    total.textContent = "Total: R$ 0,00";
    return;
  }

  carrinho.forEach(item => {
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
// ------------------- Função calcularFrete -------------------
// ------------------- Função calcularFrete -------------------
async function calcularFrete() {
  const cepInput = document.querySelector("#checkout-cep");
  const cepDestino = cepInput ? cepInput.value.trim() : "";

  const tipoEntregaInput = document.querySelector("input[name=metodoEntrega]:checked");
  const tipoEntrega = tipoEntregaInput ? tipoEntregaInput.value : "delivery";

  try {
    if (tipoEntrega === "retirada") {
      const totalProdutos = carrinho.reduce(
        (acc, item) => acc + item.preco * item.quantidade,
        0
      );

      const resumoTotal = document.querySelector("#resumo-total");
      if (resumoTotal) {
        resumoTotal.innerHTML = `
          <p>Produtos: <strong>R$ ${totalProdutos.toFixed(2)}</strong></p>
          <p>Frete: <strong>R$ 0,00</strong></p>
          <hr>
          <p>Total: <strong>R$ ${totalProdutos.toFixed(2)}</strong></p>
        `;
      }

      return { frete: 0, prazo: 0, totalGeral: totalProdutos };
    }

    if (tipoEntrega === "delivery" && (!cepDestino || cepDestino.length < 8)) {
      console.warn("CEP não informado ou inválido, aguardando usuário digitar...");
      return;
    }

    let pesoTotal = 0;
    carrinho.forEach(item => {
      const produto = produtosCarregados.find(p => p._id === item.id);
      const peso = produto?.peso || 0.5;
      pesoTotal += peso * item.quantidade;
    });

    const response = await fetch(`${API_BASE_URL}/api/frete/correios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cepDestino, peso: pesoTotal.toFixed(2) }),
    });

    if (!response.ok) throw new Error("Falha ao buscar frete");

    const { frete, prazo } = await response.json();
    const totalProdutos = carrinho.reduce(
      (acc, item) => acc + item.preco * item.quantidade,
      0
    );
    const totalGeral = totalProdutos + frete;

    const resumoTotal = document.querySelector("#resumo-total");
    if (resumoTotal) {
      resumoTotal.innerHTML = `
        <p>Produtos: <strong>R$ ${totalProdutos.toFixed(2)}</strong></p>
        <p>Frete: <strong>R$ ${frete.toFixed(2)}</strong> ${prazo > 0 ? `(Prazo: ${prazo} dias)` : ""}</p>
        <hr>
        <p>Total: <strong>R$ ${totalGeral.toFixed(2)}</strong></p>
      `;
    }

    return { frete, prazo, totalGeral };

  } catch (error) {
    console.error("Erro ao calcular frete:", error);
    const resumoTotal = document.querySelector("#resumo-total");
    if (resumoTotal) {
      resumoTotal.innerHTML =
        "<p style='color:red'>Erro ao calcular frete, verifique o CEP.</p>";
    }
  }
}




document.querySelectorAll("input[name='metodoEntrega']").forEach((input) => {
  input.addEventListener("change", calcularFrete);
});


document.querySelector("#checkout-cep").addEventListener("blur", calcularFrete);

// ------------------- Finalizar Compra -------------------
async function finalizarCompra() {
  try {
    // 1. Calcula frete
    const resumoFrete = await calcularFrete();
    if (!resumoFrete) {
      document.querySelector("#resumo-total").innerHTML =
        "<p style='color:red'>Não foi possível calcular o frete. Verifique os dados e tente novamente.</p>";
      return;
    }

    const { frete, prazo, totalGeral } = resumoFrete;
    const metodoEntrega = document.querySelector("input[name=metodoEntrega]:checked").value;

    // 2. Monta endereço apenas se for delivery
    let endereco = null;
    if (metodoEntrega === "delivery") {
      endereco = {
        cep: document.querySelector("#checkout-cep").value,
        rua: document.querySelector("#checkout-rua").value,
        numero: document.querySelector("#checkout-numero").value,
        bairro: document.querySelector("#checkout-bairro").value,
        cidade: document.querySelector("#checkout-cidade").value,
        estado: document.querySelector("#checkout-estado").value,
        complemento: document.querySelector("#checkout-complemento").value,
      };
    }

    // 3. Monta o payload completo
    const payload = {
      itens: carrinho,
      email: document.querySelector("#checkout-email").value,
      firstName: document.querySelector("#checkout-nome").value,
      lastName: document.querySelector("#checkout-sobrenome").value,
      frete,
      prazo,
      total: totalGeral,
      metodoEntrega,
      endereco,
    };

    // 4. Envia para o backend gerar Pix
    const response = await fetch(`${API_BASE_URL}/api/checkout/pix`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Falha ao iniciar checkout.");
    }

    const data = await response.json();

    // 5. Exibe QR Code Pix no modal
    abrirPixModal(data);

  } catch (error) {
    console.error("Erro ao finalizar compra:", error);
    document.querySelector("#resumo-total").innerHTML =
      "<p style='color:red'>Erro ao finalizar compra. Tente novamente.</p>";
  }
}



// async function finalizarCompra() {
//   try {
//     // 1. Calcula frete antes de tudo
//     const { frete, prazo, totalGeral } = await calcularFrete();

//     console.log("Resumo do pedido:");
//     console.log("Itens:", carrinho);
//     console.log("Frete:", frete);
//     console.log("Prazo:", prazo);
//     console.log("Total geral:", totalGeral);

//     // 2. Monta o payload para o backend
//     const payload = {
//       itens: carrinho,
//       email: document.querySelector("#checkout-email").value,
//       firstName: document.querySelector("#checkout-nome").value,
//       lastName: document.querySelector("#checkout-sobrenome").value,
//       frete,
//       prazo,
//       total: totalGeral,
//     };
//     // 3. Envia para o backend gerar o Pix
//     const response = await fetch(`${API_BASE_URL}/api/checkout/pix`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//       throw new Error("Falha ao iniciar checkout.");
//     }

//     const data = await response.json();

//     // 4. Exibe QR Code / instruções Pix
//     console.log("Resposta Pix:", data);
//     alert("Pedido gerado com sucesso! Abra o Pix e finalize o pagamento.");
//     // Aqui você pode atualizar seu modal com o QR Code vindo do backend

//   } catch (error) {
//     console.error("Erro ao finalizar compra:", error);
//     alert("Erro ao finalizar compra, tente novamente.");
//   }
// }



// ------------------- Modal Pix -------------------
function abrirPixModal(data) {
  const modal = document.getElementById("pix-modal");
  if (!modal) return;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");

  const amount = data.transaction_amount || 0;
  const qrBase64 = data.pix_qr_base64 || "";
  const qrCode = data.pix_copia_cola || "";

  const totalEl = document.getElementById("pix-total");
  if (totalEl) totalEl.textContent = `Total: R$ ${Number(amount).toFixed(2)}`;

  const qrEl = document.getElementById("pix-qr");
  if (qrEl) {
    if (qrBase64) qrEl.src = `data:image/png;base64,${qrBase64}`;
    else qrEl.alt = "Erro ao gerar QR Code";
  }

  const copiaEl = document.getElementById("pix-copia-cola");
  if (copiaEl) copiaEl.value = qrCode;

  const copyBtn = document.getElementById("copy-pix");
  if (copyBtn) {
    copyBtn.onclick = async () => {
      if (copiaEl.value) {
        await navigator.clipboard.writeText(copiaEl.value);
        const statusEl = document.getElementById("pix-status");
        if (statusEl) statusEl.textContent = "Código Pix copiado!";
      }
    };
  }

  const closeBtn = document.getElementById("close-pix");
  if (closeBtn) closeBtn.onclick = () => fecharPixModal();

  iniciarTimer(15 * 60);
  if (data.id) iniciarPollingStatus(data.id);
}

function fecharPixModal() {
  const modal = document.getElementById("pix-modal");
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

// ------------------- Polling e Timer -------------------
let pollingInterval = null;
function iniciarPollingStatus(paymentId) {
  const statusEl = document.getElementById("pix-status");
  if (pollingInterval) clearInterval(pollingInterval);

  pollingInterval = setInterval(async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/api/checkout/status/${paymentId}`);
      const { status } = await r.json();

      console.log("Status do pagamento recebido:", status);

      // Atualiza status no modal
      statusEl.textContent =
        status === "pending"  ? "Aguardando pagamento..." :
        status === "approved" || status === "pago" ? "Pagamento confirmado! 🎉" :
        status === "expired"  ? "Pagamento expirado." :
        status === "rejected" ? "Pagamento rejeitado." :
                                `Status: ${status}`;

      // Quando a transação tem resposta final
      if (status === "approved" || status === "pago" || status === "expired" || status === "rejected") {
        clearInterval(pollingInterval);

        const modal = document.getElementById("pix-modal");
        const content = modal.querySelector(".modal-content");

        if (status === "approved" || status === "pago") {
          limparCarrinho();
          content.innerHTML = `
            <h2>🎉 Obrigado pela sua compra!</h2>
            <p>Seu pagamento foi confirmado com sucesso.</p>
            <p>Enviaremos os detalhes do seu pedido para o seu e-mail.</p>
            <p class="fechamento-automatico">
              Esta janela será fechada automaticamente em <span id="fechar-contador">30</span>s.
            </p>
            <a href="index.html" class="btn btn-primary">Voltar para a loja</a>
            <button class="btn btn-secondary" onclick="fecharPixModal()">Fechar agora</button>
          `;

          // contador regressivo
          let segundosRestantes = 30;
          const contadorEl = document.getElementById("fechar-contador");
          const intervalId = setInterval(() => {
            segundosRestantes--;
            if (contadorEl) contadorEl.textContent = segundosRestantes;
            if (segundosRestantes <= 0) {
              clearInterval(intervalId);
              fecharPixModal();
            }
          }, 1000);
        }

        if (status === "expired") {
          content.innerHTML = `
            <h2>⏳ Pagamento expirado</h2>
            <p>O prazo para pagamento via Pix terminou.</p>
            <p>Por favor, tente refazer sua compra.</p>
            <a href="index.html" class="btn btn-primary">Voltar para a loja</a>
            <button class="btn btn-secondary" onclick="fecharPixModal()">Fechar</button>
          `;
        }

        if (status === "rejected") {
          content.innerHTML = `
            <h2>❌ Pagamento rejeitado</h2>
            <p>O pagamento não foi autorizado ou foi cancelado.</p>
            <p>Você pode tentar novamente ou escolher outro método de pagamento.</p>
            <a href="index.html" class="btn btn-primary">Voltar para a loja</a>
            <button class="btn btn-secondary" onclick="fecharPixModal()">Fechar</button>
          `;
        }
      }
    } catch (err) {
      console.error("Erro ao verificar status Pix:", err);
    }
  }, 4000);
}


async function verificarPagamento(pedidoId) {
  try {
    const res = await fetch(`/api/pedidos/${pedidoId}/status`);
    const data = await res.json();
    
    if (data.status === "pago") {
      // Fecha a modal do Pix
      const modalPix = document.getElementById("pix-modal");
      if (modalPix) modalPix.style.display = "none";

      // Para o timer
      clearInterval(window.pixTimerId);

      // Notifica o usuário
      alert("Pagamento confirmado! 🎉");
    } else {
      // Continua verificando a cada 5 segundos
      setTimeout(() => verificarPagamento(pedidoId), 5000);
    }
  } catch (err) {
    console.error("Erro ao verificar pagamento", err);
  }
}


function iniciarTimer(totalSegundos) {
  const el = document.getElementById("pix-timer");
  let s = totalSegundos;

  // guarda no escopo global
  window.pixTimerId = setInterval(() => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");

    el.textContent = `${m}:${ss}`;
    if (s-- <= 0) {
      clearInterval(window.pixTimerId);
    }
  }, 1000);
}


// ------------------- Mostrar/ocultar endereço conforme método -------------------
document.querySelectorAll("input[name='metodoEntrega']").forEach((input) => {
  input.addEventListener("change", (e) => {
    const isDelivery = e.target.value === "delivery";
    const enderecoDiv = document.getElementById("endereco-entrega");
    const infoRetirada = document.getElementById("info-retirada");

    enderecoDiv.style.display = isDelivery ? "block" : "none";
    infoRetirada.style.display = isDelivery ? "none" : "block";
  });
});

