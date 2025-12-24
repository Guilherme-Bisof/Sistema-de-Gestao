// Sistema de Banco de Dados Local (100% Offline)
const DB = {
  // ==================== FUNÇÕES BASE ====================

  salvar(chave, dados) {
    try {
      localStorage.setItem(chave, JSON.stringify(dados));
      return true;
    } catch (e) {
      console.error("Erro ao salvar dados:", e);
      alert("⚠️ Limite de armazenamento cheio! Tente usar menos fotos.");
      return false;
    }
  },

  carregar(chave) {
    try {
      const dados = localStorage.getItem(chave);
      return dados ? JSON.parse(dados) : null;
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
      return null;
    }
  },

  inicializar() {
    if (!this.carregar("clientes")) this.salvar("clientes", []);
    if (!this.carregar("contasReceber")) this.salvar("contasReceber", []);
    if (!this.carregar("contasPagar")) this.salvar("contasPagar", []);
    if (!this.carregar("veiculos")) this.salvar("veiculos", []);
    if (!this.carregar("movimentacoes")) this.salvar("movimentacoes", []);
    console.log("✅ Banco de dados inicializado");
  },

  // ==================== CLIENTES ====================

  adicionarCliente(nome, telefone, endereco, observacoes) {
    const clientes = this.carregar("clientes");
    const novoCliente = {
      id: Date.now(),
      nome: nome.trim(),
      telefone: telefone ? telefone.trim() : "",
      endereco: endereco ? endereco.trim() : "",
      observacoes: observacoes ? observacoes.trim() : "",
      dataCadastro: new Date().toISOString(),
    };
    clientes.push(novoCliente);
    this.salvar("clientes", clientes);
    return novoCliente.id;
  },

  editarCliente(id, nome, telefone, endereco, observacoes) {
    const clientes = this.carregar("clientes");
    const index = clientes.findIndex((c) => c.id === id);
    if (index !== -1) {
      clientes[index] = {
        ...clientes[index],
        nome: nome.trim(),
        telefone: telefone ? telefone.trim() : "",
        endereco: endereco ? endereco.trim() : "",
        observacoes: observacoes ? observacoes.trim() : "",
        dataAtualizacao: new Date().toISOString(),
      };
      this.salvar("clientes", clientes);
      return true;
    }
    return false;
  },

  excluirCliente(id) {
    const clientes = this.carregar("clientes");
    const novosClientes = clientes.filter((c) => c.id !== id);
    this.salvar("clientes", novosClientes);
    return true;
  },

  getCliente(id) {
    const clientes = this.carregar("clientes");
    return clientes.find((c) => c.id === id);
  },

  getClientes() {
    return this.carregar("clientes") || [];
  },

  getTotalDevidoPorCliente(clienteId) {
    const contas = this.carregar("contasReceber");
    return contas
      .filter((c) => c.clienteId === clienteId && !c.pago)
      .reduce((total, c) => total + c.valor, 0);
  },

  // ==================== CONTAS A RECEBER ====================

  adicionarContaReceber(clienteId, valor, vencimento, observacoes) {
    const contas = this.carregar("contasReceber");
    const novaConta = {
      id: Date.now(),
      clienteId: parseInt(clienteId),
      valor: parseFloat(valor),
      vencimento: vencimento,
      observacoes: observacoes ? observacoes.trim() : "",
      pago: false,
      formaPagamento: null, // Novo campo
      dataCadastro: new Date().toISOString(),
      dataPagamento: null,
    };
    contas.push(novaConta);
    this.salvar("contasReceber", contas);
    return novaConta.id;
  },

  editarContaReceber(id, clienteId, valor, vencimento, observacoes) {
    const contas = this.carregar("contasReceber");
    const index = contas.findIndex((c) => c.id === id);
    if (index !== -1) {
      contas[index] = {
        ...contas[index],
        clienteId: parseInt(clienteId),
        valor: parseFloat(valor),
        vencimento: vencimento,
        observacoes: observacoes ? observacoes.trim() : "",
      };
      this.salvar("contasReceber", contas);
      return true;
    }
    return false;
  },

  // ATUALIZADO: Aceita forma de pagamento
  marcarComoPago(id, formaPagamento) {
    const contas = this.carregar("contasReceber");
    const conta = contas.find((c) => c.id === id);
    if (conta) {
      conta.pago = true;
      conta.dataPagamento = new Date().toISOString();
      conta.formaPagamento = formaPagamento; // Salva a forma
      this.salvar("contasReceber", contas);

      const clienteNome = this.getCliente(conta.clienteId)?.nome || "Cliente";

      // Registrar movimentação com o detalhe
      this.adicionarMovimentacao(
        "entrada",
        conta.valor,
        `Recebimento - ${clienteNome} (${formaPagamento})`
      );
      return true;
    }
    return false;
  },

  marcarComoAberto(id) {
    const contas = this.carregar("contasReceber");
    const conta = contas.find((c) => c.id === id);
    if (conta) {
      conta.pago = false;
      conta.dataPagamento = null;
      conta.formaPagamento = null;
      this.salvar("contasReceber", contas);
      return true;
    }
    return false;
  },

  excluirContaReceber(id) {
    const contas = this.carregar("contasReceber");
    this.salvar(
      "contasReceber",
      contas.filter((c) => c.id !== id)
    );
    return true;
  },

  getContasReceber() {
    return this.carregar("contasReceber") || [];
  },

  getContasVencidas() {
    const contas = this.carregar("contasReceber");
    const hoje = new Date().toISOString().split("T")[0];
    return contas.filter((c) => !c.pago && c.vencimento < hoje);
  },

  getContasVencemHoje() {
    const contas = this.carregar("contasReceber");
    const hoje = new Date().toISOString().split("T")[0];
    return contas.filter((c) => !c.pago && c.vencimento === hoje);
  },

  getContasProximas(dias = 7) {
    const contas = this.carregar("contasReceber");
    const hoje = new Date();
    const futuro = new Date();
    futuro.setDate(hoje.getDate() + dias);
    const hojeFmt = hoje.toISOString().split("T")[0];
    const futuroFmt = futuro.toISOString().split("T")[0];
    return contas.filter(
      (c) => !c.pago && c.vencimento > hojeFmt && c.vencimento <= futuroFmt
    );
  },

  getTotalReceber() {
    return this.getContasReceber()
      .filter((c) => !c.pago)
      .reduce((t, c) => t + c.valor, 0);
  },

  // ==================== CONTAS A PAGAR ====================

  adicionarContaPagar(descricao, valor, vencimento, observacoes) {
    const contas = this.carregar("contasPagar");
    const novaConta = {
      id: Date.now(),
      descricao: descricao.trim(),
      valor: parseFloat(valor),
      vencimento: vencimento,
      observacoes: observacoes ? observacoes.trim() : "",
      pago: false,
      formaPagamento: null,
      dataCadastro: new Date().toISOString(),
    };
    contas.push(novaConta);
    this.salvar("contasPagar", contas);
    return novaConta.id;
  },

  editarContaPagar(id, descricao, valor, vencimento, observacoes) {
    const contas = this.carregar("contasPagar");
    const index = contas.findIndex((c) => c.id === id);
    if (index !== -1) {
      contas[index] = {
        ...contas[index],
        descricao: descricao.trim(),
        valor: parseFloat(valor),
        vencimento: vencimento,
        observacoes: observacoes ? observacoes.trim() : "",
      };
      this.salvar("contasPagar", contas);
      return true;
    }
    return false;
  },

  // ATUALIZADO: Aceita forma de pagamento
  marcarPagoContaPagar(id, formaPagamento) {
    const contas = this.carregar("contasPagar");
    const conta = contas.find((c) => c.id === id);
    if (conta) {
      conta.pago = true;
      conta.dataPagamento = new Date().toISOString();
      conta.formaPagamento = formaPagamento;
      this.salvar("contasPagar", contas);

      this.adicionarMovimentacao(
        "saida",
        conta.valor,
        `${conta.descricao} (${formaPagamento})`
      );
      return true;
    }
    return false;
  },

  marcarAbertoContaPagar(id) {
    const contas = this.carregar("contasPagar");
    const conta = contas.find((c) => c.id === id);
    if (conta) {
      conta.pago = false;
      conta.formaPagamento = null;
      this.salvar("contasPagar", contas);
      return true;
    }
    return false;
  },

  excluirContaPagar(id) {
    const contas = this.carregar("contasPagar");
    this.salvar(
      "contasPagar",
      contas.filter((c) => c.id !== id)
    );
    return true;
  },

  getContasPagar() {
    return this.carregar("contasPagar") || [];
  },

  getTotalPagar() {
    return this.getContasPagar()
      .filter((c) => !c.pago)
      .reduce((t, c) => t + c.valor, 0);
  },

  getContasPagarPendentes() {
    const hoje = new Date().toISOString().split("T")[0];
    return this.getContasPagar().filter((c) => !c.pago && c.vencimento <= hoje);
  },

  // ==================== VEÍCULOS ====================

  adicionarVeiculo(
    marca,
    modelo,
    ano,
    placa,
    valor,
    cor,
    km,
    imagens,
    observacoes
  ) {
    const veiculos = this.carregar("veiculos");
    const novoVeiculo = {
      id: Date.now(),
      marca: marca.trim(),
      modelo: modelo.trim(),
      ano: ano,
      placa: placa.trim().toUpperCase(),
      valor: parseFloat(valor),
      cor: cor.trim(),
      km: km ? parseInt(km) : 0,
      imagens: imagens || [],
      observacoes: observacoes ? observacoes.trim() : "",
      dataEntrada: new Date().toISOString(),
      vendido: false,
      dataVenda: null,
    };
    veiculos.push(novoVeiculo);
    this.salvar("veiculos", veiculos);
    return novoVeiculo.id;
  },

  editarVeiculo(
    id,
    marca,
    modelo,
    ano,
    placa,
    valor,
    cor,
    km,
    imagens,
    observacoes
  ) {
    const veiculos = this.carregar("veiculos");
    const index = veiculos.findIndex((v) => v.id === id);
    if (index !== -1) {
      const novasImagens =
        imagens && imagens.length > 0 ? imagens : veiculos[index].imagens;

      veiculos[index] = {
        ...veiculos[index],
        marca,
        modelo,
        ano,
        placa,
        valor: parseFloat(valor),
        cor,
        km: parseInt(km),
        imagens: novasImagens,
        observacoes,
        dataAtualizacao: new Date().toISOString(),
      };
      this.salvar("veiculos", veiculos);
      return true;
    }
    return false;
  },

  marcarVeiculoComoVendido(id) {
    const veiculos = this.carregar("veiculos");
    const veiculo = veiculos.find((v) => v.id === id);
    if (veiculo) {
      veiculo.vendido = true;
      veiculo.dataVenda = new Date().toISOString();
      this.salvar("veiculos", veiculos);
      this.adicionarMovimentacao(
        "entrada",
        veiculo.valor,
        `Venda - ${veiculo.marca} ${veiculo.modelo}`
      );
      return true;
    }
    return false;
  },

  excluirVeiculo(id) {
    const veiculos = this.carregar("veiculos");
    this.salvar(
      "veiculos",
      veiculos.filter((v) => v.id !== id)
    );
    return true;
  },

  getVeiculos() {
    return this.carregar("veiculos") || [];
  },

  getVeiculosDisponiveis() {
    return this.carregar("veiculos").filter((v) => !v.vendido);
  },

  getValorTotalEstoque() {
    return this.getVeiculosDisponiveis().reduce((t, v) => t + v.valor, 0);
  },

  getDiasEmEstoque(veiculo) {
    const entrada = new Date(veiculo.dataEntrada);
    const hoje = new Date();
    return Math.ceil(Math.abs(hoje - entrada) / (1000 * 60 * 60 * 24));
  },

  // ==================== MOVIMENTAÇÕES ====================

  adicionarMovimentacao(tipo, valor, descricao) {
    const movimentacoes = this.carregar("movimentacoes");
    movimentacoes.push({
      id: Date.now(),
      tipo,
      valor: parseFloat(valor),
      descricao,
      data: new Date().toISOString(),
    });
    this.salvar("movimentacoes", movimentacoes);
  },

  getMovimentacoes() {
    return this.carregar("movimentacoes") || [];
  },

  getTotalEntradas() {
    return this.getMovimentacoes()
      .filter((m) => m.tipo === "entrada")
      .reduce((t, m) => t + m.valor, 0);
  },

  getTotalSaidas() {
    return this.getMovimentacoes()
      .filter((m) => m.tipo === "saida")
      .reduce((t, m) => t + m.valor, 0);
  },

  getSaldo() {
    return this.getTotalEntradas() - this.getTotalSaidas();
  },

  // ==================== BACKUP ====================

  exportarBackup() {
    return {
      clientes: this.carregar("clientes"),
      contasReceber: this.carregar("contasReceber"),
      contasPagar: this.carregar("contasPagar"),
      veiculos: this.carregar("veiculos"),
      movimentacoes: this.carregar("movimentacoes"),
      dataBackup: new Date().toISOString(),
      versao: "1.3",
    };
  },

  importarBackup(backup) {
    try {
      if (backup.clientes) this.salvar("clientes", backup.clientes);
      if (backup.contasReceber)
        this.salvar("contasReceber", backup.contasReceber);
      if (backup.contasPagar) this.salvar("contasPagar", backup.contasPagar);
      if (backup.veiculos) this.salvar("veiculos", backup.veiculos);
      if (backup.movimentacoes)
        this.salvar("movimentacoes", backup.movimentacoes);
      return true;
    } catch (e) {
      console.error("Erro ao importar:", e);
      return false;
    }
  },
};

DB.inicializar();
