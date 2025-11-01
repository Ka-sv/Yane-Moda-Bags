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
    // 🖼️ Define imagens principais e miniaturas
    let imagens = [];
    if (Array.isArray(p.imagens) && p.imagens.length > 0) {
      imagens = p.imagens;
    } else if (p.imagem) {
      imagens = [p.imagem];
    } else {
      imagens = ["https://via.placeholder.com/300x300?text=Sem+imagem"];
    }

    const card = document.createElement("div");
    card.className = "card produto-card";

    const container = document.createElement("div");
    container.className = "produto-container";

    const mainImg = document.createElement("img");
    mainImg.className = "produto-principal";
    mainImg.src = imagens[0];
    mainImg.alt = p.nome || "";

    const thumbsWrapper = document.createElement("div");
    thumbsWrapper.className = "miniaturas";

    if (imagens.length > 1) {
      imagens.slice(1).forEach(src => {
        const t = document.createElement("img");
        t.className = "miniatura";
        t.src = src;
        t.alt = `Variação ${p.nome || ""}`;
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

    // 🧾 Informações básicas
    const info = document.createElement("div");
    info.className = "produto-info";
    info.innerHTML = `
      <h3>${p.nome || ""}</h3>
      <p>${p.descricao || ""}</p>
      <strong>R$ ${Number(p.preco || 0).toFixed(2)}</strong>
    `;

    // 🎨 VARIAÇÕES (Cores e Tamanhos)
    const variacoesDiv = document.createElement("div");
    variacoesDiv.className = "produto-variacoes";

    const coresDisponiveis = [...new Set((p.variantes || []).map(v => v.cor).filter(Boolean))];
    const tamanhosDisponiveis = [...new Set((p.variantes || []).map(v => v.numero).filter(Boolean))];

    // 🔹 Cores
    if (coresDisponiveis.length) {
      const corContainer = document.createElement("div");
      corContainer.className = "variacao-container";
      const corLabel = document.createElement("p");
      corLabel.textContent = "Cores:";
      corContainer.appendChild(corLabel);

      const corBtns = document.createElement("div");
      corBtns.className = "grupo-variante";
      coresDisponiveis.forEach(cor => {
        const btn = document.createElement("button");
        btn.textContent = cor;
        btn.className = "btn-variante-card";
        corBtns.appendChild(btn);
      });
      corContainer.appendChild(corBtns);
      variacoesDiv.appendChild(corContainer);
    }

    // 🔹 Tamanhos
    if (tamanhosDisponiveis.length) {
      const tamContainer = document.createElement("div");
      tamContainer.className = "variacao-container";
      const tamLabel = document.createElement("p");
      tamLabel.textContent = "Tamanhos:";
      tamContainer.appendChild(tamLabel);

      const tamBtns = document.createElement("div");
      tamBtns.className = "grupo-variante";
      tamanhosDisponiveis.forEach(tam => {
        const btn = document.createElement("button");
        btn.textContent = tam;
        btn.className = "btn-variante-card";
        tamBtns.appendChild(btn);
      });
      tamContainer.appendChild(tamBtns);
      variacoesDiv.appendChild(tamContainer);
    }

    info.appendChild(variacoesDiv);

    // 🛒 Botão "Ver detalhes"
    const btnDetalhes = document.createElement("a");
    btnDetalhes.href = `?produto=${p.slug || p._id}`;
    btnDetalhes.textContent = "Ver detalhes";
    btnDetalhes.className = "btn-detalhes";
    btnDetalhes.addEventListener("click", (e) => {
      e.preventDefault();
      history.pushState(null, "", btnDetalhes.href);
      abrirModalProduto(p);
    });

    // 🛍️ Botão "Adicionar ao carrinho"
    const btnCarrinho = document.createElement("button");
    btnCarrinho.type = "button";
    btnCarrinho.textContent = "Adicionar ao carrinho";
    btnCarrinho.className = "btn-adicionar";
    btnCarrinho.addEventListener("click", () =>
      adicionarAoCarrinho(p._id, p.nome, Number(p.preco || 0))
    );

    info.appendChild(btnDetalhes);
    info.appendChild(btnCarrinho);

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

function adicionarAoCarrinho(id, nome, preco, selecionado) {
  carrinho.push({
    id,
    nome,
    preco,
    selecionado
  });
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

// ------------------- CUPOM DE DESCONTO -------------------
let cupomAtivo = null;
let descontoAplicado = 0;
let freteGratisAtivo = false;
let cupomDados = null;


document.getElementById("aplicar-cupom").addEventListener("click", aplicarCupom);
async function aplicarCupom() {
  const input = document.getElementById("cupom-input");
  const feedback = document.getElementById("cupom-feedback");
  const codigo = input.value.trim().toUpperCase();

  if (!codigo) {
    feedback.textContent = "Digite um código de cupom válido.";
    feedback.style.color = "orange";
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/cupons/${codigo}`);
    if (!response.ok) {
      const err = await response.json();
      feedback.textContent = err.error || "Cupom inválido.";
      feedback.style.color = "red";
      return;
    }

    const cupom = await response.json();
    cupomAtivo = cupom.codigo;
    cupomDados = cupom; 


    freteGratisAtivo = false;
    descontoAplicado = 0;

    if (cupom.tipo === "frete") {
      freteGratisAtivo = true;
      feedback.textContent = "✅ Frete grátis aplicado!";
    } 
    else if (cupom.tipo === "percentual") {
      descontoAplicado = cupom.valor;
      feedback.textContent = `✅ ${cupom.valor}% de desconto aplicado!`;
    } 
    else if (cupom.tipo === "fixo") {
      descontoAplicado = cupom.valor;
      feedback.textContent = `✅ R$ ${cupom.valor.toFixed(2)} de desconto aplicado!`;
    }

    feedback.style.color = "limegreen";
    calcularFrete(); // Atualiza o total
  } catch (err) {
    console.error("Erro ao validar o cupom:", err);
    feedback.textContent = "Erro ao validar o cupom. Tente novamente.";
    feedback.style.color = "red";
  }
}



  // 🔹 Aqui você define os cupons disponíveis
  
// ------------------- Função calcularFrete -------------------
// ------------------- Função calcularFrete -------------------
// ------------------- Função calcularFrete (atualizada com cupom) -------------------
// ------------------- Função calcularFrete (corrigida) -------------------
async function calcularFrete() {
  const feedback = document.getElementById("cupom-feedback");
  const cepInput = document.querySelector("#checkout-cep");
  const cepDestino = cepInput ? cepInput.value.trim() : "";

  const tipoEntregaInput = document.querySelector("input[name=metodoEntrega]:checked");
  const tipoEntrega = tipoEntregaInput ? tipoEntregaInput.value : "delivery";

  console.log("🧾 Método de entrega selecionado:", tipoEntrega);

  try {
    // 🏬 Caso: Retirada no local (sem frete nem CEP)
    if (tipoEntrega === "retirada") {
      const totalProdutos = carrinho.reduce(
        (acc, item) => acc + item.preco * item.quantidade,
        0
      );

      let totalComCupom = totalProdutos;

      // aplica cupom se houver
      if (cupomAtivo && descontoAplicado > 0) {
        let valorDesconto = 0;

        if (cupomDados?.tipo === "percentual") {
          valorDesconto = (totalProdutos * descontoAplicado) / 100;
        } else if (cupomDados?.tipo === "fixo") {
          valorDesconto = descontoAplicado;
        }

        totalComCupom -= valorDesconto;
      }

      // Atualiza o resumo visual
      const resumoTotal = document.querySelector("#resumo-total");
      if (resumoTotal) {
        const linhas = [];

        linhas.push(`<p>Produtos: <strong>R$ ${totalProdutos.toFixed(2)}</strong></p>`);
        linhas.push(`<p>Frete: <strong>R$ 0,00</strong></p>`);

        if (cupomDados?.tipo === "percentual" && descontoAplicado > 0) {
          const valorDesconto = (totalProdutos * descontoAplicado) / 100;
          linhas.push(
            `<p>Desconto (${descontoAplicado}%): <strong>−R$ ${valorDesconto.toFixed(2)}</strong></p>`
          );
        } else if (cupomDados?.tipo === "fixo" && descontoAplicado > 0) {
          linhas.push(`<p>Desconto: <strong>−R$ ${descontoAplicado.toFixed(2)}</strong></p>`);
        }

        linhas.push("<hr>");
        linhas.push(`<p>Total: <strong>R$ ${totalComCupom.toFixed(2)}</strong></p>`);
        resumoTotal.innerHTML = linhas.join("");
      }

      // retorna dados simulando frete zerado
      return { frete: 0, prazo: 0, totalGeral: totalComCupom };
    }

    // 🚚 Caso: Entrega — precisa de CEP válido
    if (tipoEntrega === "delivery" && (!cepDestino || cepDestino.length < 8)) {
      console.warn("CEP não informado ou inválido, aguardando usuário digitar...");
      return;
    }

    // Calcula peso total dos produtos
    let pesoTotal = 0;
    carrinho.forEach(item => {
      const produto = produtosCarregados.find(p => p._id === item.id);
      const peso = produto?.peso || 0.5;
      pesoTotal += peso * item.quantidade;
    });

    // Consulta API de frete
    const response = await fetch(`${API_BASE_URL}/api/frete/correios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cepDestino, peso: pesoTotal.toFixed(2) }),
    });

    if (!response.ok) throw new Error("Falha ao buscar frete");

    const { frete: freteOriginal, prazo } = await response.json();
    const totalProdutos = carrinho.reduce(
      (acc, item) => acc + item.preco * item.quantidade,
      0
    );

    let frete = freteOriginal;
    let totalComCupom = totalProdutos + frete;

    // Aplica cupom de frete grátis
    if (freteGratisAtivo) {
      frete = 0;
      totalComCupom = totalProdutos;
    }

    // Aplica cupom de desconto (fixo ou percentual)
    if (cupomAtivo && descontoAplicado > 0) {
      let valorDesconto = 0;

      if (cupomDados?.tipo === "percentual") {
        valorDesconto = (totalProdutos * descontoAplicado) / 100;
      } else if (cupomDados?.tipo === "fixo") {
        valorDesconto = descontoAplicado;
      }

      // Se houver valor mínimo e não for frete grátis
      if (
        cupomDados?.tipo !== "frete" &&
        cupomDados?.valorMinimo &&
        totalProdutos < cupomDados.valorMinimo
      ) {
        feedback.textContent = `Valor mínimo de R$ ${cupomDados.valorMinimo.toFixed(
          2
        )} para usar este cupom.`;
        feedback.style.color = "orange";
        return;
      }

      totalComCupom -= valorDesconto;
    }

    // Atualiza resumo visual
    const resumoTotal = document.querySelector("#resumo-total");
    if (resumoTotal) {
      const linhas = [];
      linhas.push(`<p>Produtos: <strong>R$ ${totalProdutos.toFixed(2)}</strong></p>`);

      if (freteGratisAtivo) {
        linhas.push(`<p>Frete: <strong>R$ 0,00</strong> (Frete grátis aplicado)</p>`);
      } else {
        linhas.push(
          `<p>Frete: <strong>R$ ${frete.toFixed(2)}</strong> ${
            prazo > 0 ? `(Prazo: ${prazo} dias)` : ""
          }</p>`
        );
      }

      if (cupomDados?.tipo === "fixo" && descontoAplicado > 0) {
        linhas.push(`<p>Desconto: <strong>−R$ ${descontoAplicado.toFixed(2)}</strong></p>`);
      } else if (cupomDados?.tipo === "percentual" && descontoAplicado > 0) {
        const valorPercentual = (totalProdutos * descontoAplicado) / 100;
        linhas.push(
          `<p>Desconto (${descontoAplicado}%): <strong>−R$ ${valorPercentual.toFixed(2)}</strong></p>`
        );
      }

      linhas.push("<hr>");
      linhas.push(`<p>Total: <strong>R$ ${totalComCupom.toFixed(2)}</strong></p>`);
      resumoTotal.innerHTML = linhas.join("");
    }

    return { frete, prazo, totalGeral: totalComCupom };
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


// document.querySelector("#checkout-cep").addEventListener("blur", calcularFrete);


// ------------------- CEP Automático + Cálculo de Frete -------------------
const cepInput = document.querySelector("#checkout-cep");
if (cepInput) {
  cepInput.addEventListener("blur", async () => {
    const cep = cepInput.value.replace(/\D/g, ""); // remove tudo que não é número
    if (cep.length !== 8) return;

    try {
      // 🔹 Busca dados no ViaCEP
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();

      if (data.erro) {
        alert("CEP não encontrado. Verifique e tente novamente.");
        return;
      }

      // 🔹 Preenche os campos automaticamente
      document.querySelector("#checkout-rua").value = data.logradouro || "";
      document.querySelector("#checkout-bairro").value = data.bairro || "";
      document.querySelector("#checkout-cidade").value = data.localidade || "";
      document.querySelector("#checkout-estado").value = data.uf || "";

      // 🔹 Chama cálculo do frete automaticamente após preencher
      await calcularFrete();
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
    }
  });
}


// async function finalizarCompra() {
//   try {
//     // 1. Calcula frete
//     const resumoFrete = await calcularFrete();
//     if (!resumoFrete) {
//       document.querySelector("#resumo-total").innerHTML =
//         "<p style='color:red'>Não foi possível calcular o frete. Verifique os dados e tente novamente.</p>";
//       return;
//     }

//     const { frete, prazo, totalGeral } = resumoFrete;
//     const metodoEntrega = document.querySelector("input[name=metodoEntrega]:checked").value;

//     // 2. Monta endereço apenas se for delivery
//     let endereco = null;
//     if (metodoEntrega === "delivery") {
//       endereco = {
//         cep: document.querySelector("#checkout-cep").value,
//         rua: document.querySelector("#checkout-rua").value,
//         numero: document.querySelector("#checkout-numero").value,
//         bairro: document.querySelector("#checkout-bairro").value,
//         cidade: document.querySelector("#checkout-cidade").value,
//         estado: document.querySelector("#checkout-estado").value,
//         complemento: document.querySelector("#checkout-complemento").value,
//       };
//     }

//     // 3. Monta o payload completo
//     const payload = {
//       itens: carrinho,
//       email: document.querySelector("#checkout-email").value,
//       firstName: document.querySelector("#checkout-nome").value,
//       lastName: document.querySelector("#checkout-sobrenome").value,
//       frete,
//       prazo,
//       total: totalGeral,
//       metodoEntrega,
//       endereco,
//       cupom: cupomAtivo || null,
//     };

//     // 4. Envia para o backend gerar Pix
//     const response = await fetch(`${API_BASE_URL}/api/checkout/pix`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//       throw new Error("Falha ao iniciar checkout.");
//     }

//     const data = await response.json();

//     // 5. Exibe QR Code Pix no modal
//     abrirPixModal(data);

//   } catch (error) {
//     console.error("Erro ao finalizar compra:", error);
//     document.querySelector("#resumo-total").innerHTML =
//       "<p style='color:red'>Erro ao finalizar compra. Tente novamente.</p>";
//   }
// }



async function finalizarCompra() {
  try {
    // 1. Calcula frete
    const resumoFrete = await calcularFrete();
    if (!resumoFrete) {
      const resumoTotalEl = document.querySelector("#resumo-total");
      if (resumoTotalEl) {
        resumoTotalEl.innerHTML =
          "<p style='color:red'>Não foi possível calcular o frete. Verifique os dados e tente novamente.</p>";
      }
      return;
    }

    const { frete, prazo, totalGeral } = resumoFrete;

    // protege caso não haja seleção (por segurança)
    const metodoSelecionadoEl = document.querySelector("input[name=metodoEntrega]:checked");
    const metodoEntrega = metodoSelecionadoEl ? metodoSelecionadoEl.value : "delivery";

    // 2. Monta endereço apenas se for delivery
    let endereco = null;
    if (metodoEntrega === "delivery") {
      endereco = {
        cep: document.querySelector("#checkout-cep")?.value || "",
        rua: document.querySelector("#checkout-rua")?.value || "",
        numero: document.querySelector("#checkout-numero")?.value || "",
        bairro: document.querySelector("#checkout-bairro")?.value || "",
        cidade: document.querySelector("#checkout-cidade")?.value || "",
        estado: document.querySelector("#checkout-estado")?.value || "",
        complemento: document.querySelector("#checkout-complemento")?.value || "",
      };
    }

    // 3. Normaliza itens do carrinho para enviar ao backend
    // garante quantidade, assegura preco numérico e inclui 'descricaoVariação' a partir de selecionado
    const itensPayload = (carrinho || []).map(i => {
      const quantidade = Number(i.quantidade || 1);
      const preco = Number(i.preco || 0);
      const selecionado = i.selecionado || null;

      // monta uma string legível para o painel, ex: "Cor: Preto | Nº 38"
      const partes = [];
      if (selecionado?.cor) partes.push(`Cor: ${selecionado.cor}`);
      if (selecionado?.numero) partes.push(`Nº ${selecionado.numero}`);
      const descricaoVariação = partes.length ? partes.join(" | ") : "";

      return {
        id: i.id || i._id || null,
        nome: i.nome || "",
        preco,
        quantidade,
        selecionado,
        descricaoVariação,
      };
    });

    // 4. Monta o payload completo (mantendo campos já existentes)
    const payload = {
      itens: itensPayload,
      email: document.querySelector("#checkout-email")?.value || "",
      firstName: document.querySelector("#checkout-nome")?.value || "",
      lastName: document.querySelector("#checkout-sobrenome")?.value || "",
      frete,
      prazo,
      total: totalGeral,
      metodoEntrega,
      endereco,
      cupom: cupomAtivo || null,
    };

    // 5. Envia para o backend gerar Pix (mesma rota que já usava)
    const response = await fetch(`${API_BASE_URL}/api/checkout/pix`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // tenta ler corpo de erro para debug
      let errText = "Falha ao iniciar checkout.";
      try {
        const errJson = await response.json();
        if (errJson?.error) errText = errJson.error;
      } catch (e) { /* ignora parse */ }
      throw new Error(errText);
    }

    const data = await response.json();

    // 6. Exibe QR Code Pix no modal (mesmo comportamento anterior)
    abrirPixModal(data);
  } catch (error) {
    console.error("Erro ao finalizar compra:", error);
    const resumoTotalEl = document.querySelector("#resumo-total");
    if (resumoTotalEl) {
      resumoTotalEl.innerHTML =
        "<p style='color:red'>Erro ao finalizar compra. Tente novamente.</p>";
    }
  }
}




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

// Garante que a mensagem correta apareça no carregamento
window.addEventListener("DOMContentLoaded", () => {
  const selecionado = document.querySelector("input[name='metodoEntrega']:checked");
  if (selecionado) {
    const isDelivery = selecionado.value === "delivery";
    const enderecoDiv = document.getElementById("endereco-entrega");
    const infoRetirada = document.getElementById("info-retirada");

    enderecoDiv.style.display = isDelivery ? "block" : "none";
    infoRetirada.style.display = isDelivery ? "none" : "block";
  }
});


function abrirModalProduto(produto) {
  const modal = document.getElementById("produto-modal");
  const conteudo = document.getElementById("produto-detalhe-conteudo");

  conteudo.innerHTML = `
    <div class="produto-detalhe-container">
      <img src="${produto.imagens[0]}" class="produto-detalhe-img">
      <div class="produto-detalhe-info">
        <h2>${produto.nome}</h2>
        <p>${produto.descricao || ""}</p>
        <strong>R$ ${produto.preco.toFixed(2)}</strong>

        <div id="opcoes-variante"></div>

        <button id="btn-adicionar" class="btn-adicionar">Adicionar ao carrinho</button>
      </div>
    </div>
  `;

  const opcoesDiv = document.getElementById("opcoes-variante");
  const cores = [...new Set(produto.variantes?.map(v => v.cor).filter(Boolean))];
  const numeros = [...new Set(produto.variantes?.map(v => v.numero).filter(Boolean))];

  let selecionado = { cor: null, numero: null };

  // 🔹 Botões de cor
  if (cores.length) {
    const corContainer = document.createElement("div");
    corContainer.className = "opcao-cor";
    corContainer.innerHTML = `<p><strong>Cor:</strong></p>`;
    cores.forEach(c => {
      const btn = document.createElement("button");
      btn.textContent = c;
      btn.className = "btn-variante";
      btn.addEventListener("click", () => {
        selecionado.cor = c;
        document.querySelectorAll(".opcao-cor .btn-variante").forEach(b => b.classList.remove("ativo"));
        btn.classList.add("ativo");
      });
      corContainer.appendChild(btn);
    });
    opcoesDiv.appendChild(corContainer);
  }

  // 🔹 Botões de numeração
  if (numeros.length) {
    const numContainer = document.createElement("div");
    numContainer.className = "opcao-numero";
    numContainer.innerHTML = `<p><strong>Número:</strong></p>`;
    numeros.forEach(n => {
      const btn = document.createElement("button");
      btn.textContent = n;
      btn.className = "btn-variante";
      btn.addEventListener("click", () => {
        selecionado.numero = n;
        document.querySelectorAll(".opcao-numero .btn-variante").forEach(b => b.classList.remove("ativo"));
        btn.classList.add("ativo");
      });
      numContainer.appendChild(btn);
    });
    opcoesDiv.appendChild(numContainer);
  }

  // 🔹 Adicionar ao carrinho
  document.getElementById("btn-adicionar").addEventListener("click", () => {
    if (cores.length && !selecionado.cor) {
      alert("Escolha uma cor antes de adicionar ao carrinho.");
      return;
    }
    if (numeros.length && !selecionado.numero) {
      alert("Escolha uma numeração antes de adicionar ao carrinho.");
      return;
    }
    adicionarAoCarrinho(produto._id, produto.nome, produto.preco, selecionado);
    fecharProdutoModal();
  });

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");

  document.getElementById("close-produto-modal").addEventListener("click", fecharProdutoModal);
}

function fecharProdutoModal() {
  const modal = document.getElementById("produto-modal");
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}



function fecharModalProduto() {
  const modal = document.getElementById("produto-modal");
  if (modal) {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  // espera os produtos carregarem primeiro
  await carregarProdutos();

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("produto");
  if (slug) {
    // tenta achar o produto correspondente
    const produto = produtosCarregados.find(p => p.slug === slug || p._id === slug);
    if (produto) abrirModalProduto(produto);
  }
});

// fecha modal e remove parâmetro da URL
function fecharModalProduto() {
  const modal = document.getElementById("produto-modal");
  if (modal) {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  }

  // limpa o parâmetro da URL
  const url = new URL(window.location);
  url.searchParams.delete("produto");
  history.replaceState(null, "", url);
}
