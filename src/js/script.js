// ==================== UTILITÁRIOS ====================
function formatarData(data) {
  if (!data) return "-";
  const dataObj = new Date(data);
  dataObj.setMinutes(dataObj.getMinutes() + dataObj.getTimezoneOffset());
  return dataObj.toLocaleDateString("pt-BR");
}

function formatarDataHora(data) {
  if (!data) return "-";
  return new Date(data).toLocaleString("pt-BR");
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function formatarKM(valor) {
  if (!valor && valor !== 0) return "";
  return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function getStatusConta(vencimento, pago) {
  if (pago) return "pago";
  const hoje = new Date().toISOString().split("T")[0];
  if (vencimento < hoje) return "vencido";
  if (vencimento === hoje) return "hoje";
  return "futuro";
}

function getBadgeStatus(status) {
  const badges = {
    vencido: '<span class="badge badge-vencido">Vencido</span>',
    hoje: '<span class="badge badge-hoje">Vence Hoje</span>',
    futuro: '<span class="badge badge-futuro">A Vencer</span>',
    pago: '<span class="badge badge-pago">Pago</span>',
    aberto: '<span class="badge badge-futuro">Em Aberto</span>',
  };
  return badges[status] || "";
}

function atualizarDataHora() {
  const agora = new Date();
  const opcoes = {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  };
  document.getElementById("data-atual").innerHTML =
    '<i class="far fa-calendar-alt"></i> ' +
    agora.toLocaleDateString("pt-BR", opcoes);
}

// ==================== MASKS DE INPUT ====================

function mascaraMoeda(input) {
  let value = input.value.replace(/\D/g, "");
  value = (Number(value) / 100).toFixed(2).toString();
  value = value.replace(".", ",");
  value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  input.value = "R$ " + value;
}

function mascaraKM(input) {
  let value = input.value.replace(/\D/g, "");
  value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  input.value = value;
}

function limparValorMoeda(valorStr) {
  if (!valorStr) return 0;
  // Remove tudo que não for dígito ou vírgula, troca vírgula por ponto
  return parseFloat(
    valorStr
      .toString()
      .replace(/[^\d,]/g, "")
      .replace(",", ".")
  );
}

function limparValorKM(kmStr) {
  if (!kmStr) return 0;
  // Retira tudo que não for número
  return parseInt(kmStr.toString().replace(/\D/g, ""));
}

// ==================== NAVEGAÇÃO ====================
function mostrarTela(tela) {
  document
    .querySelectorAll(".menu-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document.querySelector(`[data-tela="${tela}"]`)?.classList.add("active");

  const titulos = {
    dashboard: "Visão Geral",
    receber: "Contas a Receber",
    pagar: "Contas a Pagar",
    clientes: "Gestão de Clientes",
    veiculos: "Estoque de Veículos",
    financeiro: "Fluxo de Caixa",
  };
  document.getElementById("titulo-pagina").innerText =
    titulos[tela] || "R1 Motos";

  switch (tela) {
    case "dashboard":
      mostrarDashboard();
      break;
    case "receber":
      mostrarContasReceber();
      break;
    case "pagar":
      mostrarContasPagar();
      break;
    case "clientes":
      mostrarClientes();
      break;
    case "veiculos":
      mostrarVeiculos();
      break;
    case "financeiro":
      mostrarFinanceiro();
      break;
  }
}

// ==================== DASHBOARD ====================
function mostrarDashboard() {
  const totalReceber = DB.getTotalReceber();
  const contasVencidas = DB.getContasVencidas();
  const saldo = DB.getSaldo();
  const totalVencido = contasVencidas.reduce((t, c) => t + c.valor, 0);
  const veiculos = DB.getVeiculosDisponiveis();

  // ALERTA CASO HOUVER CONTA A PAGAR
  const pendencias = DB.getContasPagarPendentes();
  if (pendencias.length > 0) {
    const corpoAlerta = document.getElementById("corpo-alerta");
    corpoAlerta.innerHTML = `
        <p style="font-size:16px; margin-bottom:10px;">Você tem <strong>${
          pendencias.length
        } conta(s)</strong> a pagar vencendo hoje ou já vencidas!</p>
        <ul style="list-style:none; padding:0;">
            ${pendencias
              .slice(0, 3)
              .map(
                (c) =>
                  `<li style="padding:5px; border-bottom:1px solid #eee;">📌 <strong>${
                    c.descricao
                  }</strong> - ${formatarMoeda(c.valor)}</li>`
              )
              .join("")}
            ${
              pendencias.length > 3
                ? `<li>...e mais ${pendencias.length - 3}</li>`
                : ""
            }
        </ul>
      `;
    document.getElementById("modal-alerta").style.display = "block";
  }

  let html = `
        <div class="grid-cards">
            <div class="card card-metrica">
                <h3>Contas a Receber</h3>
                <div class="valor valor-positivo">${formatarMoeda(
                  totalReceber
                )}</div>
                <small>${
                  DB.getContasReceber().filter((c) => !c.pago).length
                } contas pendentes</small>
            </div>
            
            <div class="card card-vermelho">
                <h3>Vencidas (Risco)</h3>
                <div class="valor valor-negativo">${formatarMoeda(
                  totalVencido
                )}</div>
                <small style="color:var(--r1-red); font-weight:bold">${
                  contasVencidas.length
                } contratos em atraso</small>
            </div>
            
            <div class="card card-metrica">
                <h3>Veículos em Estoque</h3>
                <div class="valor">${veiculos.length}</div>
                <small>Total: ${formatarMoeda(
                  DB.getValorTotalEstoque()
                )}</small>
            </div>
            
            <div class="card card-metrica">
                <h3>Saldo em Caixa</h3>
                <div class="valor ${
                  saldo >= 0 ? "valor-positivo" : "valor-negativo"
                }">${formatarMoeda(saldo)}</div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px;">
            <div class="card">
                <h3 style="color:var(--r1-red)"><i class="fas fa-exclamation-triangle"></i> Pendências Urgentes (Receber)</h3>
                ${
                  contasVencidas.length > 0
                    ? `
                    <table class="tabela">
                        <thead><tr><th>Cliente</th><th>Vencimento</th><th>Valor</th><th>Ação</th></tr></thead>
                        <tbody>
                            ${contasVencidas
                              .slice(0, 5)
                              .map(
                                (c) => `
                                <tr>
                                    <td>${
                                      DB.getCliente(c.clienteId)?.nome || "ND"
                                    }</td>
                                    <td style="color:var(--r1-red); font-weight:bold">${formatarData(
                                      c.vencimento
                                    )}</td>
                                    <td>${formatarMoeda(c.valor)}</td>
                                    <td><button class="botao botao-pequeno" onclick="abrirModalBaixaConta(${
                                      c.id
                                    }, 'receber')">Baixar</button></td>
                                </tr>`
                              )
                              .join("")}
                        </tbody>
                    </table>`
                    : '<p style="padding:20px; text-align:center; color:#888">Nenhuma pendência vencida.</p>'
                }
            </div>
            
            <div class="card">
                <h3><i class="fas fa-motorcycle"></i> Últimos Veículos</h3>
                ${
                  veiculos.length > 0
                    ? `
                    <div style="display:flex; flex-direction:column; gap:10px; margin-top:10px">
                        ${veiculos
                          .slice(0, 4)
                          .map((v) => {
                            const capa =
                              v.imagens && v.imagens.length > 0
                                ? v.imagens[0]
                                : null;
                            return `
                            <div style="padding:10px; border-left:4px solid var(--r1-red); background:#f9f9f9; display:flex; align-items:center; gap:10px;">
                                ${
                                  capa
                                    ? `<img src="${capa}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;">`
                                    : '<div style="width:50px; height:50px; background:#ddd; display:flex; align-items:center; justify-content:center; border-radius:4px;"><i class="fas fa-motorcycle"></i></div>'
                                }
                                <div>
                                    <strong>${v.marca} ${v.modelo}</strong> <br>
                                    <small>${formatarMoeda(v.valor)}</small>
                                </div>
                            </div>
                        `;
                          })
                          .join("")}
                    </div>`
                    : '<p style="padding:20px;">Estoque vazio.</p>'
                }
            </div>
        </div>`;
  document.getElementById("conteudo-principal").innerHTML = html;
}

// ==================== CLIENTES ====================
function mostrarClientes() {
  const clientes = DB.getClientes();

  let html = `
        <div class="filtros">
            <div class="input-icon">
                <i class="fas fa-search"></i>
                <input type="text" id="busca-cliente" placeholder="Buscar por nome ou telefone..." onkeyup="filtrarClientesTabela()">
            </div>
            <button class="botao" onclick="abrirFormCliente()">
                <i class="fas fa-user-plus"></i> Novo Cliente
            </button>
        </div>
        
        <div class="card">
            ${
              clientes.length > 0
                ? `
                <table class="tabela" id="tabela-clientes">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Telefone</th>
                            <th>Total Devendo</th>
                            <th>Observações</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${clientes
                          .map((cliente) => {
                            const totalDevendo = DB.getTotalDevidoPorCliente(
                              cliente.id
                            );
                            return `
                                <tr>
                                    <td><strong>${cliente.nome}</strong></td>
                                    <td>${cliente.telefone || "-"}</td>
                                    <td><strong style="color: ${
                                      totalDevendo > 0 ? "#dc2626" : "#059669"
                                    };">${formatarMoeda(
                              totalDevendo
                            )}</strong></td>
                                    <td>${cliente.observacoes || "-"}</td>
                                    <td>
                                        <div class="tabela-acoes" style="display:flex; gap: 5px;">
                                            <button class="botao botao-pequeno botao-secundario" onclick="abrirFormEditarCliente(${
                                              cliente.id
                                            })"><i class="fas fa-edit"></i></button>
                                            <button class="botao botao-pequeno botao-perigo" onclick="confirmarExclusao(${
                                              cliente.id
                                            }, 'cliente')"><i class="fas fa-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                          })
                          .join("")}
                    </tbody>
                </table>
            `
                : '<div class="lista-vazia"><p>Nenhum cliente cadastrado</p></div>'
            }
        </div>
    `;

  document.getElementById("conteudo-principal").innerHTML = html;
}

function filtrarClientesTabela() {
  const termo = document.getElementById("busca-cliente").value.toLowerCase();
  const linhas = document.querySelectorAll("#tabela-clientes tbody tr");

  linhas.forEach((linha) => {
    const nome = linha.cells[0].innerText.toLowerCase();
    const telefone = linha.cells[1].innerText.toLowerCase();
    if (nome.includes(termo) || telefone.includes(termo)) {
      linha.style.display = "";
    } else {
      linha.style.display = "none";
    }
  });
}

// ==================== VEÍCULOS (MÚLTIPLAS IMAGENS + MASKS) ====================
function mostrarVeiculos() {
  const veiculos = DB.getVeiculos();
  const disponiveis = veiculos.filter((v) => !v.vendido);

  let html = `
        <div class="filtros">
            <strong style="font-size:18px; color:var(--dark-facade)">Total em Estoque: ${formatarMoeda(
              DB.getValorTotalEstoque()
            )}</strong>
            <button class="botao" onclick="abrirFormVeiculo()" style="margin-left:auto"><i class="fas fa-motorcycle"></i> Cadastrar Veículo</button>
        </div>
        
        <div class="grid-cards">
            ${disponiveis
              .map((v) => {
                const capa =
                  v.imagens && v.imagens.length > 0 ? v.imagens[0] : null;
                const qtdFotos = v.imagens ? v.imagens.length : 0;

                return `
                <div class="card card-veiculo" style="border-top: 4px solid var(--r1-red);">
                    <div class="veiculo-img-wrapper">
                        ${
                          capa
                            ? `<img src="${capa}" class="veiculo-img" alt="Foto Moto">`
                            : '<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#ccc; font-size:40px;"><i class="fas fa-camera"></i></div>'
                        }
                        <div style="position:absolute; top:10px; right:10px;">
                            <span class="badge badge-hoje">${v.ano}</span>
                        </div>
                        ${
                          qtdFotos > 1
                            ? `<div style="position:absolute; bottom:10px; right:10px; background:rgba(0,0,0,0.7); color:#fff; padding:2px 8px; border-radius:10px; font-size:11px;">+${
                                qtdFotos - 1
                              } fotos</div>`
                            : ""
                        }
                    </div>
                    <div class="veiculo-info">
                        <h3 style="color:#333; font-size:16px; margin:0; margin-bottom: 5px;">${
                          v.marca
                        } ${v.modelo}</h3>
                        <div style="font-size:24px; font-weight:800; color:var(--r1-red); margin:10px 0">${formatarMoeda(
                          v.valor
                        )}</div>
                        <p style="color:#666; font-size:13px; margin-bottom:5px"><i class="fas fa-palette"></i> ${
                          v.cor
                        } | ${formatarKM(v.km)} km</p>
                        <p style="color:#666; font-size:13px; margin-bottom:15px"><i class="fas fa-tag"></i> ${
                          v.placa
                        }</p>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px">
                            <button class="botao" onclick="confirmarVenda(${
                              v.id
                            })">Vender</button>
                            <button class="botao botao-secundario" onclick="abrirFormEditarVeiculo(${
                              v.id
                            })">Editar</button>
                        </div>
                    </div>
                </div>`;
              })
              .join("")}
        </div>
        ${
          disponiveis.length === 0
            ? '<div style="text-align:center; padding:50px; color:#999">Nenhuma moto em estoque.</div>'
            : ""
        }
    `;
  document.getElementById("conteudo-principal").innerHTML = html;
}

// ==================== CONTAS A RECEBER ====================
function mostrarContasReceber() {
  const contas = DB.getContasReceber();
  let html = `
        <div class="filtros">
            <div style="display:flex; align-items:center; gap: 10px; flex-wrap:wrap;">
                <i class="fas fa-filter"></i>
                <select id="filtro-status" onchange="aplicarFiltroLinhas('conta-row', this.value)">
                    <option value="todos">Status: Todos</option>
                    <option value="aberto">Em Aberto</option>
                    <option value="vencido">Vencidos</option>
                    <option value="pago">Pagos</option>
                </select>
            </div>
            <button class="botao" onclick="abrirFormContaReceber()" style="margin-left:auto"><i class="fas fa-plus"></i> Nova Conta</button>
        </div>
        <div class="card">
            ${
              contas.length > 0
                ? `
                <table class="tabela">
                    <thead><tr><th>Cliente</th><th>Valor</th><th>Vencimento</th><th>Status</th><th>Ações</th></tr></thead>
                    <tbody>
                        ${contas
                          .sort(
                            (a, b) =>
                              new Date(a.vencimento) - new Date(b.vencimento)
                          )
                          .map((conta) => {
                            const cliente = DB.getCliente(conta.clienteId);
                            const status = getStatusConta(
                              conta.vencimento,
                              conta.pago
                            );
                            const filtroStatus =
                              status === "pago"
                                ? "pago"
                                : status === "vencido"
                                ? "vencido"
                                : "aberto";

                            let statusHtml = getBadgeStatus(status);
                            if (conta.pago && conta.formaPagamento) {
                              statusHtml += `<br><small style="color:#666; font-weight:600;">via ${conta.formaPagamento}</small>`;
                            }

                            return `
                                <tr class="conta-row" data-status="${filtroStatus}">
                                    <td><strong>${
                                      cliente?.nome || "ND"
                                    }</strong></td>
                                    <td>${formatarMoeda(conta.valor)}</td>
                                    <td>${formatarData(conta.vencimento)}</td>
                                    <td>${statusHtml}</td>
                                    <td>
                                        <div style="display:flex; gap:5px">
                                            ${
                                              !conta.pago
                                                ? `<button class="botao botao-pequeno" onclick="abrirModalBaixaConta(${conta.id}, 'receber')" title="Baixar"><i class="fas fa-check"></i></button>`
                                                : ""
                                            }
                                            <button class="botao botao-pequeno botao-perigo" onclick="confirmarExclusao(${
                                              conta.id
                                            }, 'contaReceber')"><i class="fas fa-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>`;
                          })
                          .join("")}
                    </tbody>
                </table>`
                : '<div style="padding:40px; text-align:center; color:#999"><p>Nenhum registro encontrado.</p></div>'
            }
        </div>`;
  document.getElementById("conteudo-principal").innerHTML = html;
}

// ==================== CONTAS A PAGAR ====================
function mostrarContasPagar() {
  const contas = DB.getContasPagar();
  let html = `
        <div class="filtros">
            <div style="display:flex; align-items:center; gap: 10px;">
                <i class="fas fa-filter"></i>
                <select id="filtro-status-pagar" onchange="aplicarFiltrosPagar()">
                    <option value="todos">Status: Todos</option>
                    <option value="aberto">Em Aberto</option>
                    <option value="pago">Pagos</option>
                </select>
            </div>
            <button class="botao" onclick="abrirFormContaPagar()" style="margin-left:auto"><i class="fas fa-plus"></i> Nova Despesa</button>
        </div>
        <div class="card">
            ${
              contas.length > 0
                ? `
            <table class="tabela">
                <thead><tr><th>Descrição</th><th>Valor</th><th>Vencimento</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>
                    ${contas
                      .map((c) => {
                        const status = getStatusConta(c.vencimento, c.pago);
                        const statusFiltro = c.pago ? "pago" : "aberto";

                        let statusHtml = getBadgeStatus(status);
                        if (c.pago && c.formaPagamento) {
                          statusHtml += `<br><small style="color:#666; font-weight:600;">via ${c.formaPagamento}</small>`;
                        }

                        return `
                        <tr class="conta-pagar-row" data-status="${statusFiltro}">
                            <td>${c.descricao}</td>
                            <td>${formatarMoeda(c.valor)}</td>
                            <td>${formatarData(c.vencimento)}</td>
                            <td>${statusHtml}</td>
                            <td>
                                <div style="display:flex; gap:5px;">
                                ${
                                  !c.pago
                                    ? `<button class="botao botao-pequeno" onclick="abrirModalBaixaConta(${c.id}, 'pagar')">Pagar</button>`
                                    : ""
                                }
                                <button class="botao botao-pequeno botao-perigo" onclick="confirmarExclusao(${
                                  c.id
                                }, 'contaPagar')"><i class="fas fa-trash"></i></button>
                                </div>
                            </td>
                        </tr>`;
                      })
                      .join("")}
                </tbody>
            </table>`
                : '<p style="padding:20px; text-align:center">Nenhuma conta a pagar.</p>'
            }
        </div>`;
  document.getElementById("conteudo-principal").innerHTML = html;
}

function aplicarFiltrosPagar() {
  const filtro = document.getElementById("filtro-status-pagar").value;
  const linhas = document.querySelectorAll(".conta-pagar-row");
  linhas.forEach((linha) => {
    const status = linha.getAttribute("data-status");
    if (filtro === "todos") linha.style.display = "";
    else if (filtro === "aberto")
      linha.style.display = status !== "pago" ? "" : "none";
    else if (filtro === "pago")
      linha.style.display = status === "pago" ? "" : "none";
  });
}

function mostrarFinanceiro() {
  const movs = DB.getMovimentacoes().reverse();
  let html = `
        <div class="card">
            <h3><i class="fas fa-exchange-alt"></i> Histórico de Movimentações</h3>
            <table class="tabela">
                <thead><tr><th>Data</th><th>Tipo</th><th>Descrição</th><th>Valor</th></tr></thead>
                <tbody>
                    ${movs
                      .slice(0, 50)
                      .map(
                        (m) => `
                        <tr>
                            <td>${formatarDataHora(m.data)}</td>
                            <td>${
                              m.tipo === "entrada"
                                ? '<span class="badge badge-pago">Entrada</span>'
                                : '<span class="badge badge-vencido">Saída</span>'
                            }</td>
                            <td>${m.descricao}</td>
                            <td style="font-weight:bold; color:${
                              m.tipo === "entrada"
                                ? "var(--success)"
                                : "var(--r1-red)"
                            }">${formatarMoeda(m.valor)}</td>
                        </tr>`
                      )
                      .join("")}
                </tbody>
            </table>
        </div>`;
  document.getElementById("conteudo-principal").innerHTML = html;
}

function aplicarFiltroLinhas(classeLinha, valorFiltro) {
  document.querySelectorAll("." + classeLinha).forEach((linha) => {
    const status = linha.getAttribute("data-status");
    if (valorFiltro === "todos") linha.style.display = "";
    else if (valorFiltro === "aberto")
      linha.style.display = status !== "pago" ? "" : "none";
    else linha.style.display = status === valorFiltro ? "" : "none";
  });
}

// ==================== MODAIS GERAIS ====================
function abrirModal(html) {
  document.getElementById("modal-body").innerHTML = html;
  document.getElementById("modal").style.display = "block";
}
function fecharModal() {
  document.getElementById("modal").style.display = "none";
}
function abrirConfirmacao(titulo, msg, callback) {
  document.getElementById("confirmacao-titulo").innerText = titulo;
  document.getElementById("confirmacao-mensagem").innerHTML = msg;
  document.getElementById("btn-confirmar").onclick = callback;
  document.getElementById("modal-confirmacao").style.display = "block";
}
function fecharConfirmacao() {
  document.getElementById("modal-confirmacao").style.display = "none";
}

// ==================== MODAL DE BAIXA COM FORMA DE PAGAMENTO ====================
function abrirModalBaixaConta(id, tipo) {
  const conta =
    tipo === "receber"
      ? DB.getContasReceber().find((c) => c.id === id)
      : DB.getContasPagar().find((c) => c.id === id);

  const html = `
        <h3>Baixar Conta</h3>
        <div style="background:#e3f2fd; color:#0d47a1; padding:10px; border-radius:5px; margin-bottom:15px;">
            Confirmar ${
              tipo === "receber" ? "recebimento" : "pagamento"
            } de <strong>${formatarMoeda(conta.valor)}</strong>?
        </div>
        <form onsubmit="confirmarBaixa(event, ${id}, '${tipo}')">
            <div class="form-group">
                <label>Forma de Pagamento *</label>
                <select id="forma-pagamento" required style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px;">
                    <option value="PIX">PIX</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão Crédito">Cartão de Crédito</option>
                    <option value="Cartão Débo">Cartão de Débito</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Transferência">Transferência</option>
                </select>
            </div>
            <div class="modal-footer" style="padding:0; padding-top:15px;">
                <button type="button" class="botao botao-secundario" onclick="fecharModal()">Cancelar</button>
                <button type="submit" class="botao" style="background:var(--success); border-color:var(--success);">Confirmar</button>
            </div>
        </form>
    `;
  abrirModal(html);
}

function confirmarBaixa(e, id, tipo) {
  e.preventDefault();
  const forma = document.getElementById("forma-pagamento").value;

  if (tipo === "receber") {
    DB.marcarComoPago(id, forma);
    mostrarContasReceber();
  } else {
    DB.marcarPagoContaPagar(id, forma);
    mostrarContasPagar();
  }
  fecharModal();
}

// ==================== FORMULÁRIOS COM MÁSCARAS ====================

// --- VEÍCULOS (Múltiplas Fotos + Máscaras) ---
function abrirFormVeiculo(editando = false, id = null) {
  let v = editando ? DB.getVeiculos().find((x) => x.id === id) : null;
  let previewImagensHTML = "";
  if (v && v.imagens && v.imagens.length > 0) {
    v.imagens.forEach((img) => {
      previewImagensHTML += `<img src="${img}" class="thumb-preview">`;
    });
  }

  abrirModal(`
        <h3>${editando ? "Editar" : "Cadastrar"}</h3>
        <form onsubmit="salvarVeiculo(event, ${editando}, ${id})">
            <div class="form-group" style="text-align:center;">
                <label style="cursor:pointer; background:#eee; padding:20px; display:block; border-radius:8px; border:2px dashed #ccc;">
                    <i class="fas fa-camera fa-2x"></i><br>
                    Clique para selecionar fotos
                    <input type="file" multiple accept="image/*" id="input-foto-veiculo" style="display:none;">
                </label>
                <div id="preview-galeria" class="preview-galeria">
                    ${previewImagensHTML}
                </div>
                <small style="color:#666;">Selecione até 3 fotos por vez.</small>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Marca</label><input required value="${
                  v ? v.marca : ""
                }"></div>
                <div class="form-group"><label>Modelo</label><input required value="${
                  v ? v.modelo : ""
                }"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Ano</label><input required value="${
                  v ? v.ano : ""
                }"></div>
                <div class="form-group"><label>Placa</label><input required value="${
                  v ? v.placa : ""
                }"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Cor</label><input required value="${
                  v ? v.cor : ""
                }"></div>
                
                <div class="form-group">
                    <label>KM</label>
                    <input type="text" oninput="mascaraKM(this)" placeholder="Ex: 10.000" value="${
                      v
                        ? v.km.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                        : ""
                    }">
                </div>
            </div>
            
            <div class="form-group">
                <label>Valor Venda (R$)</label>
                <input type="text" oninput="mascaraMoeda(this)" required placeholder="R$ 0,00" value="${
                  v ? formatarMoeda(v.valor) : ""
                }">
            </div>
            
            <div class="modal-footer">
                <button type="button" class="botao botao-secundario" onclick="fecharModal()">Cancelar</button>
                <button type="submit" class="botao">Salvar</button>
            </div>
        </form>
    `);

  document.getElementById("input-foto-veiculo").onchange = function (evt) {
    const files = evt.target.files;
    const galeria = document.getElementById("preview-galeria");
    galeria.innerHTML = "";
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = function (e) {
          galeria.innerHTML += `<img src="${e.target.result}" class="thumb-preview">`;
        };
        reader.readAsDataURL(file);
      });
    }
  };
}

function abrirFormEditarVeiculo(id) {
  abrirFormVeiculo(true, id);
}

function salvarVeiculo(e, edit, id) {
  e.preventDefault();
  const inputs = e.target.querySelectorAll("input:not([type='file'])");
  const fileInput = document.getElementById("input-foto-veiculo");

  const finalizarSalvamento = (imagensArray) => {
    // Limpa os valores formatados antes de salvar
    const kmLimpo = limparValorKM(inputs[5].value);
    const valorLimpo = limparValorMoeda(inputs[6].value);

    const dados = {
      marca: inputs[0].value,
      modelo: inputs[1].value,
      ano: inputs[2].value,
      placa: inputs[3].value,
      cor: inputs[4].value,
      km: kmLimpo,
      valor: valorLimpo,
      imagens: imagensArray,
    };

    if (edit)
      DB.editarVeiculo(
        id,
        dados.marca,
        dados.modelo,
        dados.ano,
        dados.placa,
        dados.valor,
        dados.cor,
        dados.km,
        dados.imagens,
        ""
      );
    else
      DB.adicionarVeiculo(
        dados.marca,
        dados.modelo,
        dados.ano,
        dados.placa,
        dados.valor,
        dados.cor,
        dados.km,
        dados.imagens,
        ""
      );

    fecharModal();
    mostrarVeiculos();
  };

  if (fileInput.files && fileInput.files.length > 0) {
    const files = Array.from(fileInput.files);
    const filesToProcess = files.slice(0, 3);
    const promises = filesToProcess.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(promises).then((base64Images) => {
      finalizarSalvamento(base64Images);
    });
  } else {
    finalizarSalvamento(null);
  }
}

function confirmarVenda(id) {
  abrirConfirmacao(
    "Vender Moto",
    "Confirmar venda? O valor entrará no caixa.",
    () => {
      DB.marcarVeiculoComoVendido(id);
      fecharConfirmacao();
      mostrarVeiculos();
    }
  );
}

// --- CLIENTES ---
function abrirFormCliente(edit = false, id = null) {
  let c = edit ? DB.getCliente(id) : null;
  abrirModal(`
        <h3>Cliente</h3>
        <form onsubmit="salvarCliente(event, ${edit}, ${id})">
            <div class="form-group"><label>Nome</label><input required value="${
              c ? c.nome : ""
            }"></div>
            <div class="form-row">
                <div class="form-group"><label>Telefone</label><input value="${
                  c ? c.telefone : ""
                }"></div>
                <div class="form-group"><label>Endereço</label><input value="${
                  c ? c.endereco : ""
                }" placeholder="Rua, Número, Bairro..."></div>
            </div>
            <div class="form-group"><label>Obs</label><input value="${
              c ? c.observacoes : ""
            }"></div>
            <div class="modal-footer"><button class="botao">Salvar</button></div>
        </form>`);
}

function abrirFormEditarCliente(id) {
  abrirFormCliente(true, id);
}

function salvarCliente(e, edit, id) {
  e.preventDefault();
  const inputs = e.target.querySelectorAll("input");
  if (edit)
    DB.editarCliente(
      id,
      inputs[0].value,
      inputs[1].value,
      inputs[2].value,
      inputs[3].value
    );
  else
    DB.adicionarCliente(
      inputs[0].value,
      inputs[1].value,
      inputs[2].value,
      inputs[3].value
    );
  fecharModal();
  mostrarClientes();
}

// --- CONTAS A PAGAR (Com Mask) ---
function abrirFormContaPagar(edit = false, id = null) {
  let c = edit ? DB.getContasPagar().find((x) => x.id === id) : null;
  abrirModal(`
        <h3>Conta a Pagar</h3>
        <form onsubmit="salvarContaPagar(event, ${edit}, ${id})">
            <div class="form-group"><label>Descrição</label><input required value="${
              c ? c.descricao : ""
            }"></div>
            <div class="form-row">
                <div class="form-group">
                    <label>Valor</label>
                    <input type="text" oninput="mascaraMoeda(this)" required placeholder="R$ 0,00" value="${
                      c ? formatarMoeda(c.valor) : ""
                    }">
                </div>
                <div class="form-group"><label>Vencimento</label><input type="date" required value="${
                  c ? c.vencimento : ""
                }"></div>
            </div>
            <div class="modal-footer"><button class="botao">Salvar</button></div>
        </form>`);
}

function salvarContaPagar(e, edit, id) {
  e.preventDefault();
  const inputs = e.target.querySelectorAll("input");
  const valorLimpo = limparValorMoeda(inputs[1].value);

  if (edit)
    DB.editarContaPagar(id, inputs[0].value, valorLimpo, inputs[2].value, "");
  else DB.adicionarContaPagar(inputs[0].value, valorLimpo, inputs[2].value, "");
  fecharModal();
  mostrarContasPagar();
}

// --- CONTAS A RECEBER (Com Mask) ---
function abrirFormContaReceber(editando = false, id = null) {
  const clientes = DB.getClientes();
  if (clientes.length === 0) {
    alert("Cadastre um cliente primeiro!");
    return;
  }
  let conta =
    editando && id ? DB.getContasReceber().find((c) => c.id === id) : null;
  abrirModal(`
        <h3>${editando ? "Editar" : "Nova"} Conta a Receber</h3>
        <form onsubmit="salvarContaReceber(event, ${editando}, ${id})">
            <div class="form-group">
                <label>Cliente</label>
                <select required class="form-control">
                    ${clientes
                      .map(
                        (c) =>
                          `<option value="${c.id}" ${
                            conta && conta.clienteId == c.id ? "selected" : ""
                          }>${c.nome}</option>`
                      )
                      .join("")}
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Valor (R$)</label>
                    <input type="text" oninput="mascaraMoeda(this)" required placeholder="R$ 0,00" value="${
                      conta ? formatarMoeda(conta.valor) : ""
                    }">
                </div>
                <div class="form-group"><label>Vencimento</label><input type="date" required value="${
                  conta ? conta.vencimento : ""
                }"></div>
            </div>
            <div class="form-group"><label>Obs</label><input type="text" value="${
              conta ? conta.observacoes : ""
            }"></div>
            <div class="modal-footer"><button type="submit" class="botao">Salvar</button></div>
        </form>`);
}

function salvarContaReceber(e, edit, id) {
  e.preventDefault();
  const f = e.target;
  const clienteId = f.querySelector("select").value;
  const inputs = f.querySelectorAll("input");
  const valorLimpo = limparValorMoeda(inputs[0].value);

  if (edit)
    DB.editarContaReceber(
      id,
      clienteId,
      valorLimpo,
      inputs[1].value,
      inputs[2].value
    );
  else
    DB.adicionarContaReceber(
      clienteId,
      valorLimpo,
      inputs[1].value,
      inputs[2].value
    );
  fecharModal();
  mostrarContasReceber();
}

function confirmarExclusao(id, tipo) {
  abrirConfirmacao("Excluir", "Tem certeza? Esta ação é irreversível.", () => {
    if (tipo === "contaReceber") {
      DB.excluirContaReceber(id);
      mostrarContasReceber();
    }
    if (tipo === "cliente") {
      DB.excluirCliente(id);
      mostrarClientes();
    }
    if (tipo === "contaPagar") {
      DB.excluirContaPagar(id);
      mostrarContasPagar();
    }
    if (tipo === "veiculo") {
      DB.excluirVeiculo(id);
      mostrarVeiculos();
    }
    fecharConfirmacao();
  });
}

function fazerBackup() {
  const backup = DB.exportarBackup();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" })
  );
  a.download = `backup_r1_${new Date().toISOString().split("T")[0]}.json`;
  a.click();
}

function mostrarImportarBackup() {
  abrirModal(
    `<h3>Importar Backup</h3><p>Cuidado: Isso apagará os dados atuais.</p><form onsubmit="importarBackup(event)"><input type="file" required accept=".json"><div class="modal-footer"><button class="botao botao-perigo">Importar</button></div></form>`
  );
}

function importarBackup(e) {
  e.preventDefault();
  const file = e.target.querySelector("input").files[0];
  const reader = new FileReader();
  reader.onload = function (ev) {
    try {
      DB.importarBackup(JSON.parse(ev.target.result));
      location.reload();
    } catch (err) {
      alert("Erro no arquivo.");
    }
  };
  reader.readAsText(file);
}

// ==================== INICIALIZAÇÃO ====================
window.onload = function () {
  mostrarDashboard();
  atualizarDataHora();
  setInterval(atualizarDataHora, 60000);
  console.log("✅ Sistema R1 Motos Iniciado");
};
