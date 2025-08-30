let carrinho = [];

document.addEventListener("DOMContentLoaded", function() {
  // Adicionando o evento para limpar o carrinho
  const limparCarrinhoBtn = document.getElementById("limpar-carrinho");
  if (limparCarrinhoBtn) {
    limparCarrinhoBtn.addEventListener("click", limparCarrinho);
  } else {
    console.error("Elemento 'limpar-carrinho' não encontrado.");
  }

  // Carregar os produtos após o DOM estar pronto
  carregarProdutos();
});

async function carregarProdutos() {
  try {
    const resposta = await fetch("http://localhost:5000/api/produtos");
    
    if (!resposta.ok) {
      throw new Error('Erro ao carregar os produtos.');
    }

    const produtos = await resposta.json();

    const lista = document.getElementById("lista-produtos");
    
    if (!lista) {
      console.error("Elemento 'lista-produtos' não encontrado.");
      return;
    }

    lista.innerHTML = "";

    if (produtos.length === 0) {
      lista.innerHTML = "<p>Nenhum produto disponível.</p>";
      return;
    }

    produtos.forEach(p => {
      const div = document.createElement("div");
      div.classList.add("card");
      div.innerHTML = `
        <img src="${p.imagem || 'https://via.placeholder.com/150'}" width="150">
        <h3>${p.nome}</h3>
        <p>${p.descricao || ''}</p>
        <strong>R$ ${p.preco.toFixed(2)}</strong>
        <button onclick="adicionarAoCarrinho('${p._id}', '${p.nome}', ${p.preco})">
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
  const itemExistente = carrinho.find(item => item.id === id);

  if (itemExistente) {
    itemExistente.quantidade++;
  } else {
    carrinho.push({ id, nome, preco, quantidade: 1 });
  }

  atualizarCarrinho();
}

function removerDoCarrinho(id) {
  const item = carrinho.find(item => item.id === id);

  if (item) {
    item.quantidade--;
    if (item.quantidade <= 0) {
      carrinho = carrinho.filter(i => i.id !== id);
    }
  }

  atualizarCarrinho();
}

function limparCarrinho() {
  carrinho = [];
  atualizarCarrinho();
}

function atualizarCarrinho() {
  const listaCarrinho = document.getElementById("lista-carrinho");
  const total = document.getElementById("total");

  listaCarrinho.innerHTML = "";

  let soma = 0;
  carrinho.forEach(item => {
    soma += item.preco * item.quantidade;
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.nome} (x${item.quantidade}) - R$ ${(item.preco * item.quantidade).toFixed(2)}
      <button onclick="removerDoCarrinho('${item.id}')">-</button>
    `;
    listaCarrinho.appendChild(li);
  });

  total.textContent = `Total: R$ ${soma.toFixed(2)}`;
}
