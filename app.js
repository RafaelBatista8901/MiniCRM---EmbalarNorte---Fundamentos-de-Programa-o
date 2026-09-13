//Inicialização do array de leads a partir do armazenamento local ou cria um array vazio
let leads = JSON.parse(localStorage.getItem("embalarNorteLeads")) || [];
//Variável de controlo para saber se estamos a criar uma lead nova ou a editar uma existente
let idEmEdicao = null;

//Definição dos estados possíveis no pipeline comercial
let estados = ["Novo", "Contactado", "Proposta", "Ganho", "Perdido"];
//Regras de negócio que limitam as transições de estado para garantir a integridade do processo
let transicoes = {
    Novo: ["Contactado", "Perdido"],
    Contactado: ["Proposta", "Perdido"],
    Proposta: ["Ganho", "Perdido"],
    Ganho: [],
    Perdido: []
};

//Atribui automaticamente um comercial responsável com base na região geográfica escolhida
function escolherComercial(regiao) {
    if (regiao === "Norte") return "Pedro Ferreira";
    if (regiao === "Centro") return "Rafael Batista";
    return "Mário Amorim";
}

//Constrói o objeto de uma nova lead e gera um ID único baseado no timestamp atual
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

//Classifica dinamicamente a prioridade da lead consoante o valor monetário do negócio
function qualificar(lead) {
    if (lead.valorPotencial >= 10000) return "Quente";
    if (lead.valorPotencial >= 5000) return "Morno";
    return "Frio";
}

//Guarda o estado atual do array de leads na memória do navegador
function guardarLeads() {
    localStorage.setItem("embalarNorteLeads", JSON.stringify(leads));
}

//Extrai e formata os dados introduzidos nos campos do formulário HTML
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

//Efetua as validações de campos obrigatórios e formatos específicos
function validar(dados) {
    let campos = [dados.nomeContacto, dados.nomeEmpresa, dados.email, dados.telefone, dados.origem, dados.regiao, dados.codigoPostal, dados.moradaEnvio, dados.valorPotencial];
    for (let i = 0; i < campos.length; i++) {
        if (!campos[i]) return "Preenche todos os campos obrigatórios.";
    }
    if (!/^\d{4}-?\d{3}$/.test(dados.codigoPostal)) return "Indica um código postal válido, por exemplo 4000-123.";
    if (Number(dados.valorPotencial) < 0) return "O valor potencial não pode ser negativo.";
    return "";
}

//Preenche o formulário com os dados da lead selecionada e altera a interface para o modo de edição
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

//Limpa os campos, limpa a variável de controlo de edição e restaura o formulário para o modo de criação
function limparFormulario() {
    document.getElementById("formLead").reset();
    document.getElementById("tituloFormulario").textContent = "Nova lead";
    document.getElementById("botaoGuardar").textContent = "Adicionar lead";
    document.getElementById("cancelarEdicao").classList.add("escondido");
    document.getElementById("mensagemFormulario").textContent = "";
    idEmEdicao = null;
}

//Calcula e renderiza os KPIs no topo da página consoante o estado atual da base de dados
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

//Função central que renderiza a lista de leads
function mostrarLeads() {
    let lista = document.getElementById("listaLeads");
    let pesquisa = document.getElementById("pesquisa").value.toLowerCase();
    let filtro = document.getElementById("filtroEstado").value;
    
    //Limpa a estrutura atual antes de a voltar a gerar com os dados mais recentes
    lista.innerHTML = ""; 
    let quantidade = 0;

    for (let i = 0; i < leads.length; i++) {
        let lead = leads[i];
        
        //Verifica se a lead atual passa nos critérios de pesquisa por texto e filtro por estado
        let correspondeTexto = lead.nomeContacto.toLowerCase().includes(pesquisa) || lead.nomeEmpresa.toLowerCase().includes(pesquisa);
        let correspondeEstado = filtro === "Todos" || lead.estado === filtro;
        if (!correspondeTexto || !correspondeEstado) continue;

        quantidade++;
        
        //Cria o contentor principal do item da lista
        let li = document.createElement("li");
        li.className = "lead";

        //Cabeçalho do Cartão da Lead
        let leadTopo = document.createElement("div");
        leadTopo.className = "lead-topo";
        
        let divTitulos = document.createElement("div");
        let h3 = document.createElement("h3");
        h3.textContent = lead.nomeEmpresa; 
        
        let pInfo = document.createElement("p");
        pInfo.textContent = lead.nomeContacto + " · " + lead.email + " · " + lead.telefone;
        
        divTitulos.appendChild(h3);
        divTitulos.appendChild(pInfo);

        let badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = qualificar(lead);

        leadTopo.appendChild(divTitulos);
        leadTopo.appendChild(badge);

        //Grelha de Informação Detalhada
        let detalhes = document.createElement("div");
        detalhes.className = "detalhes";

        //Função auxiliar para estruturar rapidamente os pares de rótulo e valor
        function criarDetalhe(rotulo, valorTexto) {
            let span = document.createElement("span");
            span.textContent = rotulo + ": ";
            let strong = document.createElement("strong");
            strong.textContent = valorTexto;
            span.appendChild(strong);
            return span;
        }

        detalhes.appendChild(criarDetalhe("Valor", Number(lead.valorPotencial).toLocaleString("pt-PT", { style: "currency", currency: "EUR" })));
        detalhes.appendChild(criarDetalhe("Origem", lead.origem));
        detalhes.appendChild(criarDetalhe("Comercial", lead.comercial));
        detalhes.appendChild(criarDetalhe("Região", lead.regiao + " (" + lead.codigoPostal + ")"));
        detalhes.appendChild(criarDetalhe("Amostra", lead.estadoAmostra));
        detalhes.appendChild(criarDetalhe("Proposta", lead.estadoProposta));

        //Área de Ações e Estado
        let leadAcoes = document.createElement("div");
        leadAcoes.className = "lead-acoes";

        let labelSelect = document.createElement("label");
        labelSelect.textContent = "Estado do acompanhamento ";
        
        let selectEstado = document.createElement("select");
        selectEstado.className = "seletor-estado";
        
        //Gera as opções do dropdown de estados e marca o estado atual da lead
        for (let j = 0; j < estados.length; j++) {
            let option = document.createElement("option");
            option.textContent = estados[j];
            option.value = estados[j];
            if (estados[j] === lead.estado) {
                option.selected = true;
            }
            selectEstado.appendChild(option);
        }

        //Adiciona um evento para validar e alterar o estado diretamente a partir do dropdown
        selectEstado.addEventListener("change", function(evento) {
            mudarEstado(lead.id, evento.target.value, evento.target);
        });
        
        labelSelect.appendChild(selectEstado);

        let divBotoes = document.createElement("div");

        let botaoEditar = document.createElement("button");
        botaoEditar.className = "botao secundario editar";
        botaoEditar.type = "button";
        botaoEditar.textContent = "Editar";
        //Liga o botão de edição à função que preenche o formulário
        botaoEditar.addEventListener("click", function() {
            editarLead(lead);
        });

        let botaoEliminar = document.createElement("button");
        botaoEliminar.className = "botao eliminar";
        botaoEliminar.type = "button";
        botaoEliminar.textContent = "Eliminar";
        //Liga o botão de eliminar à função de remoção
        botaoEliminar.addEventListener("click", function() {
            eliminarLead(lead.id);
        });

        divBotoes.appendChild(botaoEditar);
        divBotoes.appendChild(botaoEliminar);

        leadAcoes.appendChild(labelSelect);
        leadAcoes.appendChild(divBotoes);

        //Agrupa os três blocos principais dentro do contentor da lead
        li.appendChild(leadTopo);
        li.appendChild(detalhes);
        li.appendChild(leadAcoes);

        //Insere a lead construída na árvore principal
        lista.appendChild(li);
    }

    //Apresenta uma mensagem alternativa caso a pesquisa ou o filtro não devolvam resultados
    if (quantidade === 0) {
        let pVazio = document.createElement("p");
        pVazio.className = "vazio";
        pVazio.textContent = "Não existem leads para mostrar.";
        lista.appendChild(pVazio);
    }
    
    //Assegura que os indicadores visuais representam os dados apresentados
    atualizarIndicadores();
}

//Aplica as regras de negócio definidas na matriz de transições antes de gravar o novo estado
function mudarEstado(id, novoEstado, seletor) {
    for (let i = 0; i < leads.length; i++) {
        if (leads[i].id !== id) continue;
        
        //Interrompe a alteração e reverte o dropdown caso a transição seja inválida
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

//Remove uma lead do array principal após confirmação do utilizador
function eliminarLead(id) {
    if (!confirm("Queres eliminar esta lead?")) return;
    for (let i = 0; i < leads.length; i++) {
        if (leads[i].id === id) leads.splice(i, 1);
    }
    guardarLeads();
    mostrarLeads();
}

//Interceta a submissão do formulário para tratar a inserção ou atualização de dados sem recarregar a página
let form = document.getElementById("formLead");
form.addEventListener("submit", function(evento) {
    evento.preventDefault();
    let dados = lerFormulario();
    let erro = validar(dados);
    
    document.getElementById("mensagemFormulario").textContent = erro;
    if (erro) return;

    //Se a variável idEmEdicao for nula, cria um registo novo. Caso contrário, atualiza o existente.
    if (idEmEdicao === null) {
        leads.push(criarLead(dados));
    } else {
        for (let i = 0; i < leads.length; i++) {
            if (leads[i].id === idEmEdicao) {
                //Junta os novos dados capturados ao objeto lead existente
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

//Configuração de eventos globais para a interação do utilizador
document.getElementById("cancelarEdicao").addEventListener("click", limparFormulario);
document.getElementById("pesquisa").addEventListener("input", mostrarLeads);
document.getElementById("filtroEstado").addEventListener("change", mostrarLeads);

//Arranque da aplicação: processa e desenha as leads iniciais lidas do localStorage
mostrarLeads();