// =========================
// Dados e regras do CRM
// =========================

let leads = JSON.parse(localStorage.getItem("embalarNorteLeads")) || [];
let idEmEdicao = null;

let estados = ["Novo", "Contactado", "Proposta", "Ganho", "Perdido"];

// Ganho e Perdido são estados finais.
let transicoes = {
    Novo: ["Contactado", "Perdido"],
    Contactado: ["Proposta", "Perdido"],
    Proposta: ["Ganho", "Perdido"],
    Ganho: [],
    Perdido: []
};


// =========================
// Funções dos dados
// =========================

// Atribui o comercial de acordo com a região da lead.
function escolherComercial(regiao) {
    if (regiao === "Norte") return "Pedro Ferreira";
    if (regiao === "Centro") return "Rafael Batista";
    return "Mário Amorim";
}

// Todas as leads novas são criadas nesta função.
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
        valorPotencial: Number(dados.valorPotencial),
        comercial: escolherComercial(dados.regiao),
        estado: "Novo"
    };
}

// Calcula a prioridade através do valor potencial.
function qualificar(lead) {
    if (lead.valorPotencial >= 10000) return "Quente";
    if (lead.valorPotencial >= 5000) return "Morno";
    return "Frio";
}

function guardarLeads() {
    localStorage.setItem("embalarNorteLeads", JSON.stringify(leads));
}


// =========================
// Formulário
// =========================

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
        valorPotencial: document.getElementById("valorPotencial").value
    };
}

function validar(dados) {
    let camposObrigatorios = [
        dados.nomeContacto,
        dados.nomeEmpresa,
        dados.email,
        dados.telefone,
        dados.origem,
        dados.regiao,
        dados.codigoPostal,
        dados.moradaEnvio,
        dados.valorPotencial
    ];

    for (let i = 0; i < camposObrigatorios.length; i++) {
        if (!camposObrigatorios[i]) {
            return "Preenche todos os campos obrigatórios.";
        }
    }

    if (!/^\d{9}$/.test(dados.telefone)) {
        return "O telefone deve ter exatamente 9 dígitos.";
    }

    if (!/^\d{4}-?\d{3}$/.test(dados.codigoPostal)) {
        return "Indica um código postal válido, por exemplo 4000-123.";
    }

    if (Number(dados.valorPotencial) < 0) {
        return "O valor potencial não pode ser negativo.";
    }

    return "";
}

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
    document.getElementById("valorPotencial").value = lead.valorPotencial;

    document.getElementById("tituloFormulario").textContent = "Editar lead";
    document.getElementById("botaoGuardar").textContent = "Guardar alterações";
    document.getElementById("cancelarEdicao").classList.remove("escondido");

    idEmEdicao = lead.id;
    window.scrollTo(0, 0);
}

function limparFormulario() {
    document.getElementById("formLead").reset();
    document.getElementById("tituloFormulario").textContent = "Nova lead";
    document.getElementById("botaoGuardar").textContent = "Adicionar lead";
    document.getElementById("cancelarEdicao").classList.add("escondido");
    document.getElementById("mensagemFormulario").textContent = "";
    document.getElementById("estadoAmostra").value = "Aguarda Aprovação";
    idEmEdicao = null;
}


// =========================
// Indicadores
// =========================

function atualizarIndicadores() {
    let valorAtivo = 0;
    let leadsGanhas = 0;

    for (let i = 0; i < leads.length; i++) {
        if (leads[i].estado !== "Ganho" && leads[i].estado !== "Perdido") {
            valorAtivo += Number(leads[i].valorPotencial);
        }

        // Uma lead Ganho representa uma proposta aprovada.
        if (leads[i].estado === "Ganho") {
            leadsGanhas++;
        }
    }

    document.getElementById("totalLeads").textContent = leads.length;
    document.getElementById("valorAtivo").textContent = valorAtivo.toLocaleString("pt-PT", {
        style: "currency",
        currency: "EUR"
    });

    let taxa = leads.length ? Math.round(leadsGanhas / leads.length * 100) : 0;
    document.getElementById("taxaConversao").textContent = taxa + "%";
}


// =========================
// Lista de leads
// =========================

function criarDetalhe(rotulo, valor) {
    let span = document.createElement("span");
    span.textContent = rotulo + ": ";

    let strong = document.createElement("strong");
    strong.textContent = valor;
    span.appendChild(strong);

    return span;
}

function criarOpcoesEstado(lead, selectEstado) {
    let opcoes = [lead.estado];

    for (let i = 0; i < transicoes[lead.estado].length; i++) {
        let proximoEstado = transicoes[lead.estado][i];

        // Uma amostra rejeitada nunca pode levar a lead para Ganho.
        if (proximoEstado === "Ganho" && lead.estadoAmostra === "Rejeitada") {
            continue;
        }

        opcoes.push(proximoEstado);
    }

    for (let i = 0; i < opcoes.length; i++) {
        let option = document.createElement("option");
        option.textContent = opcoes[i];
        option.value = opcoes[i];
        option.selected = opcoes[i] === lead.estado;
        option.hidden = opcoes[i] === lead.estado;
        selectEstado.appendChild(option);
    }

    // Estados finais não têm opções para escolher.
    if (opcoes.length === 1) {
        selectEstado.disabled = true;
    }
}

function criarBotoes(lead) {
    let divBotoes = document.createElement("div");

    let botaoEditar = document.createElement("button");
    botaoEditar.className = "botao secundario editar";
    botaoEditar.type = "button";
    botaoEditar.textContent = "Editar";

    // Leads Ganho ou Perdido já não podem ser alteradas.
    if (lead.estado === "Ganho" || lead.estado === "Perdido") {
        botaoEditar.disabled = true;
    } else {
        botaoEditar.addEventListener("click", function() {
            editarLead(lead);
        });
    }

    let botaoEliminar = document.createElement("button");
    botaoEliminar.className = "botao eliminar";
    botaoEliminar.type = "button";
    botaoEliminar.textContent = "Eliminar";
    botaoEliminar.addEventListener("click", function() {
        eliminarLead(lead.id);
    });

    divBotoes.appendChild(botaoEditar);
    divBotoes.appendChild(botaoEliminar);

    return divBotoes;
}

function criarCartaoLead(lead) {
    let li = document.createElement("li");
    li.className = "lead";

    if (lead.estado === "Ganho") {
        li.classList.add("ganho");
    }

    if (lead.estado === "Perdido") {
        li.classList.add("perdido");
    }

    let leadTopo = document.createElement("div");
    leadTopo.className = "lead-topo";

    let divTitulos = document.createElement("div");
    let titulo = document.createElement("h3");
    titulo.textContent = lead.nomeEmpresa;

    let info = document.createElement("p");
    info.textContent = lead.nomeContacto + " · " + lead.email + " · " + lead.telefone;

    divTitulos.appendChild(titulo);
    divTitulos.appendChild(info);

    let badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = qualificar(lead);

    leadTopo.appendChild(divTitulos);
    leadTopo.appendChild(badge);

    let detalhes = document.createElement("div");
    detalhes.className = "detalhes";
    detalhes.appendChild(criarDetalhe("Valor", Number(lead.valorPotencial).toLocaleString("pt-PT", { style: "currency", currency: "EUR" })));
    detalhes.appendChild(criarDetalhe("Origem", lead.origem));
    detalhes.appendChild(criarDetalhe("Comercial", lead.comercial));
    detalhes.appendChild(criarDetalhe("Região", lead.regiao + " (" + lead.codigoPostal + ")"));
    detalhes.appendChild(criarDetalhe("Amostra", lead.estadoAmostra));

    let leadAcoes = document.createElement("div");
    leadAcoes.className = "lead-acoes";

    let labelEstado = document.createElement("label");
    labelEstado.textContent = "Estado do acompanhamento ";

    let selectEstado = document.createElement("select");
    selectEstado.className = "seletor-estado";
    criarOpcoesEstado(lead, selectEstado);
    selectEstado.addEventListener("change", function(evento) {
        mudarEstado(lead.id, evento.target.value, evento.target);
    });

    labelEstado.appendChild(selectEstado);
    leadAcoes.appendChild(labelEstado);
    leadAcoes.appendChild(criarBotoes(lead));

    li.appendChild(leadTopo);
    li.appendChild(detalhes);
    li.appendChild(leadAcoes);

    return li;
}

function mostrarLeads() {
    let lista = document.getElementById("listaLeads");
    let pesquisa = document.getElementById("pesquisa").value.toLowerCase();
    let filtro = document.getElementById("filtroEstado").value;
    let quantidade = 0;

    lista.innerHTML = "";

    for (let i = 0; i < leads.length; i++) {
        let lead = leads[i];
        let correspondeTexto = lead.nomeContacto.toLowerCase().includes(pesquisa) || lead.nomeEmpresa.toLowerCase().includes(pesquisa);
        let correspondeEstado = filtro === "Todos" || lead.estado === filtro;

        if (!correspondeTexto || !correspondeEstado) {
            continue;
        }

        lista.appendChild(criarCartaoLead(lead));
        quantidade++;
    }

    if (quantidade === 0) {
        let pVazio = document.createElement("p");
        pVazio.className = "vazio";
        pVazio.textContent = "Não existem leads para mostrar.";
        lista.appendChild(pVazio);
    }

    atualizarIndicadores();
}


// =========================
// Estados e ações
// =========================

function mudarEstado(id, novoEstado, seletor) {
    for (let i = 0; i < leads.length; i++) {
        if (leads[i].id !== id) {
            continue;
        }

        if (novoEstado === "Ganho" && leads[i].estadoAmostra === "Rejeitada") {
            document.getElementById("mensagemLista").textContent = "Uma amostra rejeitada não pode passar para Ganho.";
            seletor.value = leads[i].estado;
            return;
        }

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
    if (!confirm("Queres eliminar esta lead?")) {
        return;
    }

    for (let i = 0; i < leads.length; i++) {
        if (leads[i].id === id) {
            leads.splice(i, 1);
            break;
        }
    }

    guardarLeads();
    mostrarLeads();
}


// =========================
// Eventos da aplicação
// =========================

let form = document.getElementById("formLead");
form.addEventListener("submit", function(evento) {
    evento.preventDefault();

    let dados = lerFormulario();
    let erro = validar(dados);
    document.getElementById("mensagemFormulario").textContent = erro;

    if (erro) {
        return;
    }

    if (idEmEdicao === null) {
        leads.push(criarLead(dados));
    } else {
        for (let i = 0; i < leads.length; i++) {
            if (leads[i].id === idEmEdicao) {
                leads[i] = Object.assign(leads[i], dados);
                leads[i].valorPotencial = Number(dados.valorPotencial);
                leads[i].comercial = escolherComercial(dados.regiao);

                // Uma amostra rejeitada torna a lead Perdida.
                if (dados.estadoAmostra === "Rejeitada") {
                    leads[i].estado = "Perdido";
                }
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

// Insere automaticamente o hífen depois dos quatro primeiros dígitos.
document.getElementById("codigoPostal").addEventListener("input", function(evento) {
    let numeros = evento.target.value.replace(/\D/g, "").slice(0, 7);
    evento.target.value = numeros.length > 4 ? numeros.slice(0, 4) + "-" + numeros.slice(4) : numeros;
});

// Mostra as leads guardadas quando a página abre.
mostrarLeads();
