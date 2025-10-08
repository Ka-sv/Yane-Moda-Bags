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
  