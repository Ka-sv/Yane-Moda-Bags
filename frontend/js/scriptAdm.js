// ------------------- AUTENTICAÇÃO SIMPLES -------------------
const API_BASE_URL = "https://yane-moda-bags.onrender.com"; 
(async () => {
  const senhaDigitada = localStorage.getItem("senhaAdmin") || prompt("Digite a senha de administrador:");

  if (!senhaDigitada) {
    alert("Acesso negado. Nenhuma senha informada.");
    window.location.href = "https://yaneloja.com.br";
    return;
  }

  try {
    const resposta = await fetch(`${API_BASE_URL}/api/auth/admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha: senhaDigitada }),
    });

    const data = await resposta.json();

    if (data.ok) {
      localStorage.setItem("senhaAdmin", senhaDigitada);
      console.log("✅ Acesso administrativo liberado");
    } else {
      alert("Senha incorreta! Acesso negado.");
      window.location.href = "https://yaneloja.com.br";
    }
  } catch (error) {
    console.error("Erro ao verificar senha de admin:", error);
    alert("Erro de conexão. Tente novamente mais tarde.");
    window.location.href = "https://yaneloja.com.br";
  }
})();


async function carregarPedidosPagos() {
    try {
      const response = await fetch("https://yane-moda-bags.onrender.com/api/pedidos/pagos");
      if (!response.ok) throw new Error("Erro ao buscar pedidos pagos");
  
      const pedidos = await response.json();
      const tabela = document.getElementById("tabela-pedidos");
      if (!tabela) return;
  
      tabela.innerHTML = "";
  
      pedidos.forEach(p => {
        const tr = document.createElement("tr");
        const itens = (p.itens || [])
          .map(i => `${i.nome} (x${i.quantidade})`)
          .join(", ");
      
        const endereco = p.endereco
          ? `${p.endereco.rua || ""}, ${p.endereco.numero || ""} - ${p.endereco.bairro || ""}, ${p.endereco.cidade || ""} - ${p.endereco.estado || ""} (${p.endereco.cep || ""})`
          : "Retirada na loja";
      
        const metodo = p.metodoEntrega === "delivery" ? "Entrega" : "Retirada";
      
        tr.innerHTML = `
          <td>${p.firstName || ""} ${p.lastName || ""}</td>
          <td>${p.email || ""}</td>
          <td>${itens}</td>
          <td>R$ ${(p.total || 0).toFixed(2)}</td>
          <td>${p.cupom || "—"}</td>
          <td>${metodo}</td>
          <td>${endereco}</td>
          <td>${p.statusEntrega || "Pendente"}</td>
          <td>${new Date(p.createdAt).toLocaleString("pt-BR")}</td>
        `;
      
        tabela.appendChild(tr);
      });      
    } catch (err) {
      console.error("❌ Erro ao carregar pedidos pagos:", err);
    }
  }
  
  // só executa se a tabela existir
  if (document.getElementById("tabela-pedidos")) {
    carregarPedidosPagos();
  }
  
// ------------------- GERENCIAMENTO DE CUPONS -------------------




const tipoSelect = document.getElementById("tipo");
const valorInput = document.getElementById("valor");

tipoSelect.addEventListener("change", () => {
  if (tipoSelect.value === "frete") {
    valorInput.value = "";
    valorInput.disabled = true;
    valorInput.placeholder = "Não aplicável (Frete Grátis)";
  } else {
    valorInput.disabled = false;
    valorInput.placeholder = "Valor";
  }
});

document.getElementById("tab-pedidos").addEventListener("click", () => {
  document.getElementById("secao-pedidos").style.display = "block";
  document.getElementById("secao-cupons").style.display = "none";
});

document.getElementById("tab-cupons").addEventListener("click", () => {
  document.getElementById("secao-pedidos").style.display = "none";
  document.getElementById("secao-cupons").style.display = "block";
  carregarCupons();
});

// Carregar cupons existentes
async function carregarCupons() {
  const tabela = document.getElementById("tabela-cupons");
  tabela.innerHTML = "";

  try {
    const res = await fetch(`${API_BASE_URL}/api/cupons`);
    if (!res.ok) throw new Error("Erro ao carregar cupons");
    const cupons = await res.json();

    cupons.forEach(c => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.codigo}</td>
        <td>${c.tipo}</td>
        <td>${c.valor}${c.tipo === "percentual" ? "%" : ""}</td>
        <td>${c.ativo ? "✅" : "❌"}</td>
        <td>
          ${c.ativo
            ? `<button onclick="desativarCupom('${c._id}')">Desativar</button>`
            : `<span>Inativo</span>`
          }
        </td>
      `;
      tabela.appendChild(tr);
    });
  } catch (err) {
    console.error("❌ Erro ao carregar cupons:", err);
  }
}

// Criar novo cupom
document.getElementById("form-cupom").addEventListener("submit", async (e) => {
  e.preventDefault();

  const tipo = document.getElementById("tipo").value;
  const valorInput = document.getElementById("valor").value;

  const novo = {
    codigo: document.getElementById("codigo").value.toUpperCase(),
    tipo: document.getElementById("tipo").value,
    
    valor: tipo === "frete" ? 0 : (valorInput ? Number(valorInput) : 0),

    valorMinimo: Number(document.getElementById("valorMinimo").value) || 0,
    descricao: document.getElementById("descricao").value
  };
  
  try {
    const res = await fetch(`${API_BASE_URL}/api/cupons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novo),
    });
    if (!res.ok) throw new Error("Erro ao criar cupom");
    alert("Cupom criado com sucesso!");
    e.target.reset();
    carregarCupons();
  } catch (err) {
    alert("Erro ao salvar cupom.");
    console.error(err);
  }
});

// Desativar cupom
async function desativarCupom(id) {
  if (!confirm("Deseja realmente desativar este cupom?")) return;
  try {
    await fetch(`${API_BASE_URL}/api/cupons/${id}/desativar`, { method: "PATCH" });
    carregarCupons();
  } catch (err) {
    alert("Erro ao desativar cupom.");
    console.error(err);
  }
}
