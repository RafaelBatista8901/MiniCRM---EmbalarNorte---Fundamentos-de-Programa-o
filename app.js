// Array para guardar as leads existentes no navegador.
let leads = JSON.parse(localStorage.getItem("embalarNorteLeads")) || [];
let idEmEdicao = null;

// Estados e mudanças permitidas no acompanhamento da lead.
let estados = ["Novo", "Contactado", "Proposta", "Ganho", "Perdido"];
let transicoes = {
    Novo: ["Contactado", "Perdido"],
    Contactado: ["Proposta", "Perdido"],
    Proposta: ["Ganho", "Perdido"],
    Ganho: [],
    Perdido: []
};

// Escolhe o comercial através da região indicada no formulário.
function escolherComercial(regiao) {
    if (regiao === "Norte") return "Pedro Ferreira";
    if (regiao === "Centro") return "Rafael Batista";
    return "Mário Amorim";
}

// Todos os objetos lead são criados nesta função.
function criarLead(dados) {
    return {
        id: Date.now().toString(),
        nomeContacto: dados.nomeContacto,
        nomeEmpresa: dados.nomeEmpresa,
        email: dados.email,
        telefone: dados.telefone,
        origem: dados.origem,
        regiao: dados.regiao,
        codigoPostal: dados.codigoPostal,
        moradaEnvio: dados.moradaEnvio,
        estadoAmostra: dados.estadoAmostra,
        estadoProposta: dados.estadoProposta,
        valorPotencial: Number(dados.valorPotencial),
        comercial: escolherComercial(dados.regiao),
        estado: "Novo"
    };
}

// Calcula a prioridade sem ser escolhida manualmente.
function qualificar(lead) {
    if (lead.valorPotencial >= 10000) return "Quente";
    if (lead.valorPotencial >= 5000) return "Morno";
    return "Frio";
}

// Guarda os dados para continuarem disponíveis depois de fechar a página.
function guardarLeads() {
    localStorage.setItem("embalarNorteLeads", JSON.stringify(leads));
}

// Lê os valores introduzidos no formulário.
function lerFormulario() {
    return {
        nomeContacto: document.getElementById("nomeContacto").value.trim(),
        nomeEmpresa: document.getElementById("nomeEmpresa").value.trim(),
        email: document.getElementById("email").value.trim(),
        telefone: document.getElementById("telefone").value.trim(),
        origem: document.getElementById("origem").value,
        regiao: document.getElementById("regiao").value,
        codigoPostal: document.getElementById("codigoPostal").value.trim(),
        moradaEnvio: document.getElementById("moradaEnvio").value.trim(),
        estadoAmostra: document.getElementById("estadoAmostra").value,
        estadoProposta: document.getElementById("estadoProposta").value,
        valorPotencial: document.getElementById("valorPotencial").value
    };
}

// Verifica os dados antes de criar ou alterar uma lead.
function validar(dados) {
    let campos = [dados.nomeContacto, dados.nomeEmpresa, dados.email, dados.telefone, dados.origem, dados.regiao, dados.codigoPostal, dados.moradaEnvio, dados.valorPotencial];
    for (let i = 0; i < campos.length; i++) {
        if (!campos[i]) return "Preenche todos os campos obrigatórios.";
    }
    if (!/^\d{4}-?\d{3}$/.test(dados.codigoPostal)) return "Indica um código postal válido, por exemplo 4000-123.";
    if (Number(dados.valorPotencial) < 0) return "O valor potencial não pode ser negativo.";
    return "";
}

// Preenche o formulário quando o utilizador escolhe Editar.
function editarLead(lead) {
    document.getElementById("nomeContacto").value = lead.nomeContacto;
    document.getElementById("nomeEmpresa").value = lead.nomeEmpresa;
    document.getElementById("email").value = lead.email;
    document.getElementById("telefone").value = lead.telefone;
    document.getElementById("origem").value = lead.origem;
    document.getElementById("regiao").value = lead.regiao;
    document.getElementById("codigoPostal").value = lead.codigoPostal;
    document.getElementById("moradaEnvio").value = lead.moradaEnvio;
    document.getElementById("estadoAmostra").value = lead.estadoAmostra;
    document.getElementById("estadoProposta").value = lead.estadoProposta;
    document.getElementById("valorPotencial").value = lead.valorPotencial;
    document.getElementById("tituloFormulario").textContent = "Editar lead";
    document.getElementById("botaoGuardar").textContent = "Guardar alterações";
    document.getElementById("cancelarEdicao").classList.remove("escondido");
    idEmEdicao = lead.id;
    window.scrollTo(0, 0);
}

// Limpa o formulário e cancela uma edição em curso.
function limparFormulario() {
    document.getElementById("formLead").reset();
    document.getElementById("tituloFormulario").textContent = "Nova lead";
    document.getElementById("botaoGuardar").textContent = "Adicionar lead";
    document.getElementById("cancelarEdicao").classList.add("escondido");
    document.getElementById("mensagemFormulario").textContent = "";
    idEmEdicao = null;
}

// Atualiza os indicadores no topo da página.
function atualizarIndicadores() {
    let valorAtivo = 0;
    let propostasAceites = 0;

    for (let i = 0; i < leads.length; i++) {
        if (leads[i].estado !== "Ganho" && leads[i].estado !== "Perdido") {
            valorAtivo += Number(leads[i].valorPotencial);
        }
        if (leads[i].estadoProposta === "Aceite") propostasAceites++;
    }

    document.getElementById("totalLeads").textContent = leads.length;
    document.getElementById("valorAtivo").textContent = valorAtivo.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
    document.getElementById("taxaConversao").textContent = leads.length ? Math.round(propostasAceites / leads.length * 100) + "%" : "0%";
}

// Mostra a lista de leads e aplica a pesquisa e o filtro.
function mostrarLeads() {
    let lista = document.getElementById("listaLeads");
    let pesquisa = document.getElementById("pesquisa").value.toLowerCase();
    let filtro = document.getElementById("filtroEstado").value;
    lista.innerHTML = "";
    let quantidade = 0;

    for (let i = 0; i < leads.length; i++) {
        let lead = leads[i];
        let correspondeTexto = lead.nomeContacto.toLowerCase().includes(pesquisa) || lead.nomeEmpresa.toLowerCase().includes(pesquisa);
        let correspondeEstado = filtro === "Todos" || lead.estado === filtro;
        if (!correspondeTexto || !correspondeEstado) continue;

        quantidade++;
        let artigo = document.createElement("article");
        artigo.className = "lead";
        artigo.innerHTML =
            '<div class="lead-topo"><div><h3>' + escapar(lead.nomeEmpresa) + '</h3><p>' + escapar(lead.nomeContacto) + ' · ' + escapar(lead.email) + ' · ' + escapar(lead.telefone) + '</p></div><span class="badge">' + qualificar(lead) + '</span></div>' +
            '<div class="detalhes">' +
            '<span>Valor: <strong>' + Number(lead.valorPotencial).toLocaleString("pt-PT", { style: "currency", currency: "EUR" }) + '</strong></span>' +
            '<span>Origem: <strong>' + escapar(lead.origem) + '</strong></span>' +
            '<span>Comercial: <strong>' + escapar(lead.comercial) + '</strong></span>' +
            '<span>Região: <strong>' + escapar(lead.regiao) + ' (' + escapar(lead.codigoPostal) + ')</strong></span>' +
            '<span>Amostra: <strong>' + escapar(lead.estadoAmostra) + '</strong></span>' +
            '<span>Proposta: <strong>' + escapar(lead.estadoProposta) + '</strong></span></div>' +
            '<div class="lead-acoes"><label>Estado do acompanhamento<select class="seletor-estado">' + criarOpcoesEstado(lead.estado) + '</select></label><div><button class="botao secundario editar" type="button">Editar</button> <button class="botao eliminar" type="button">Eliminar</button></div></div>';

        artigo.querySelector(".seletor-estado").addEventListener("change", function(evento) {
            mudarEstado(lead.id, evento.target.value, evento.target);
        });
        artigo.querySelector(".editar").addEventListener("click", function() {
            editarLead(lead);
        });
        artigo.querySelector(".eliminar").addEventListener("click", function() {
            eliminarLead(lead.id);
        });
        lista.appendChild(artigo);
    }

    if (quantidade === 0) lista.innerHTML = '<p class="vazio">Não existem leads para mostrar.</p>';
    atualizarIndicadores();
}

function criarOpcoesEstado(estadoAtual) {
    let opcoes = "";
    for (let i = 0; i < estados.length; i++) {
        let selecionado = estados[i] === estadoAtual ? " selected" : "";
        opcoes += '<option' + selecionado + '>' + estados[i] + '</option>';
    }
    return opcoes;
}

// Mostra os dados como texto seguro dentro da página.
function escapar(valor) {
    let div = document.createElement("div");
    div.textContent = valor;
    return div.innerHTML;
}

// Só permite as mudanças de estado definidas no projeto.
function mudarEstado(id, novoEstado, seletor) {
    for (let i = 0; i < leads.length; i++) {
        if (leads[i].id !== id) continue;
        if (!transicoes[leads[i].estado].includes(novoEstado)) {
            document.getElementById("mensagemLista").textContent = "Transição não permitida.";
            seletor.value = leads[i].estado;
            return;
        }
        leads[i].estado = novoEstado;
        guardarLeads();
        mostrarLeads();
        return;
    }
}

function eliminarLead(id) {
    if (!confirm("Queres eliminar esta lead?")) return;
    for (let i = 0; i < leads.length; i++) {
        if (leads[i].id === id) leads.splice(i, 1);
    }
    guardarLeads();
    mostrarLeads();
}

// Adiciona uma lead nova ou guarda as alterações de uma lead existente.
let form = document.getElementById("formLead");
form.addEventListener("submit", function(evento) {
    evento.preventDefault();
    let dados = lerFormulario();
    let erro = validar(dados);
    document.getElementById("mensagemFormulario").textContent = erro;
    if (erro) return;

    if (idEmEdicao === null) {
        leads.push(criarLead(dados));
    } else {
        for (let i = 0; i < leads.length; i++) {
            if (leads[i].id === idEmEdicao) {
                leads[i] = Object.assign(leads[i], dados);
                leads[i].valorPotencial = Number(dados.valorPotencial);
                leads[i].comercial = escolherComercial(dados.regiao);
            }
        }
    }
    guardarLeads();
    limparFormulario();
    mostrarLeads();
});

document.getElementById("cancelarEdicao").addEventListener("click", limparFormulario);
document.getElementById("pesquisa").addEventListener("input", mostrarLeads);
document.getElementById("filtroEstado").addEventListener("change", mostrarLeads);

// Mostra os dados guardados quando a página abre.
mostrarLeads();
