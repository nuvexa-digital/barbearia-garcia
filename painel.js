// ==========================
// FIREBASE
// ==========================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    doc,
    deleteDoc
}
from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyAPUf_5xndCIHpuBoKl-POWk24BR_h_VPo",
    authDomain: "barbearia-garcia-653cd.firebaseapp.com",
    projectId: "barbearia-garcia-653cd",
    storageBucket: "barbearia-garcia-653cd.firebasestorage.app",
    messagingSenderId: "483477620088",
    appId: "1:483477620088:web:7df6c58023a8df0ca6348d"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);


// ==========================
// ELEMENTOS
// ==========================

const telaLogin =
    document.getElementById("telaLogin");

const telaPainel =
    document.getElementById("telaPainel");

const email =
    document.getElementById("email");

const senha =
    document.getElementById("senha");

const btnEntrar =
    document.getElementById("btnEntrar");

const btnSair =
    document.getElementById("btnSair");

const mensagem =
    document.getElementById("mensagem");

const listaAgendamentos =
    document.getElementById("listaAgendamentos");

const carregando =
    document.getElementById("carregando");

const dataAtual =
    document.getElementById("dataAtual");

const abaSemana =
    document.getElementById("abaSemana");

const abaProximaSemana =
    document.getElementById("abaProximaSemana");

const abaHistorico =
    document.getElementById("abaHistorico");

    const resumoAgenda = document.getElementById("resumoAgenda");
const resumoClientes = document.getElementById("resumoClientes");
const resumoConcluidos = document.getElementById("resumoConcluidos");
const resumoValor = document.getElementById("resumoValor");

let modoAtual = "semana";


// ==========================
// FUNCIONAMENTO
// ==========================

const funcionamento = {
    0: null, // domingo

    1: {
        inicio: "18:00",
        fim: "00:00"
    },

    2: null, // terça

    3: {
        inicio: "17:30",
        fim: "00:00"
    },

    4: {
        inicio: "17:30",
        fim: "00:00"
    },

    5: {
        inicio: "17:30",
        fim: "00:00"
    },

    6: {
        inicio: "08:30",
        fim: "17:30"
    }
};


// ==========================
// DATAS
// ==========================

function formatarDataBanco(data){

    const ano =
        data.getFullYear();

    const mes =
        String(
            data.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            data.getDate()
        ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}


function formatarDataBR(dataBanco){

    const partes =
        dataBanco.split("-");

    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );
}


function criarDataLocal(dataBanco){

    const partes =
        dataBanco.split("-");

    return new Date(
        Number(partes[0]),
        Number(partes[1]) - 1,
        Number(partes[2])
    );
}


// ==========================
// SEGUNDA-FEIRA DA SEMANA
// ==========================

function inicioDaSemana(data){

    const resultado =
        new Date(
            data.getFullYear(),
            data.getMonth(),
            data.getDate()
        );

    const dia =
        resultado.getDay();

    // Domingo = volta 6 dias
    // Segunda = volta 0
    // Terça = volta 1...
    const diferenca =
        dia === 0
        ? -6
        : 1 - dia;

    resultado.setDate(
        resultado.getDate() +
        diferenca
    );

    return resultado;
}


// ==========================
// CRIAR OS 7 DIAS
// ==========================

function criarDiasSemana(inicio){

    const dias = [];

    for(let i = 0; i < 7; i++){

        const data =
            new Date(
                inicio.getFullYear(),
                inicio.getMonth(),
                inicio.getDate()
            );

        data.setDate(
            inicio.getDate() + i
        );

        dias.push(data);
    }

    return dias;
}


// ==========================
// NOME DO DIA
// ==========================

function nomeDiaSemana(data){

    const nomes = [
        "Domingo",
        "Segunda-feira",
        "Terça-feira",
        "Quarta-feira",
        "Quinta-feira",
        "Sexta-feira",
        "Sábado"
    ];

    return nomes[data.getDay()];
}


// ==========================
// HORÁRIO FINAL
// ==========================

function calcularFim(horario, duracao){

    const partes =
        horario.split(":");

    const inicio =
        Number(partes[0]) * 60 +
        Number(partes[1]);

    const fim =
        inicio +
        Number(duracao);

    const horas =
        Math.floor(fim / 60) % 24;

    const minutos =
        fim % 60;

    return (
        String(horas).padStart(2, "0") +
        ":" +
        String(minutos).padStart(2, "0")
    );
}


// ==========================
// CONCLUÍDO AUTOMATICAMENTE
// ==========================

function estaConcluido(item){

    const partesData =
        item.data.split("-");

    const partesHorario =
        item.horario.split(":");

    const inicio =
        new Date(
            Number(partesData[0]),
            Number(partesData[1]) - 1,
            Number(partesData[2]),
            Number(partesHorario[0]),
            Number(partesHorario[1])
        );

    const fim =
        new Date(
            inicio.getTime() +
            Number(item.duracao) *
            60 *
            1000
        );

    return new Date() >= fim;
}


// ==========================
// LOGIN
// ==========================

btnEntrar.addEventListener(
    "click",
    async function(){

        const emailDigitado =
            email.value.trim();

        const senhaDigitada =
            senha.value;

        if(
            emailDigitado === "" ||
            senhaDigitada === ""
        ){

            mensagem.textContent =
                "Digite o e-mail e a senha.";

            return;
        }

        try{

            btnEntrar.disabled = true;

            btnEntrar.textContent =
                "Entrando...";

            mensagem.textContent = "";

            await signInWithEmailAndPassword(
                auth,
                emailDigitado,
                senhaDigitada
            );

        }catch(erro){

            console.error(
                "Erro no login:",
                erro
            );

            mensagem.style.color =
                "#e16b6b";

            mensagem.textContent =
                "E-mail ou senha incorretos.";

            btnEntrar.disabled = false;

            btnEntrar.textContent =
                "Entrar no painel";
        }
    }
);


// ENTER PARA ENTRAR

senha.addEventListener(
    "keydown",
    function(evento){

        if(evento.key === "Enter"){
            btnEntrar.click();
        }
    }
);


// ==========================
// SAIR
// ==========================

btnSair.addEventListener(
    "click",
    async function(){

        await signOut(auth);
    }
);


// ==========================
// ESTADO DO LOGIN
// ==========================

onAuthStateChanged(
    auth,
    function(usuario){

        if(usuario){

            telaLogin.style.display =
                "none";

            telaPainel.style.display =
                "block";

            carregarAgendamentos();

        }else{

            telaPainel.style.display =
                "none";

            telaLogin.style.display =
                "flex";

            btnEntrar.disabled = false;

            btnEntrar.textContent =
                "Entrar no painel";
        }
    }
);


// ==========================
// BUSCAR AGENDAMENTOS
// ==========================

async function buscarTodosAgendamentos(){

    const resultado =
        await getDocs(
            collection(
                db,
                "agendamentos"
            )
        );

    const agendamentos = [];

    resultado.forEach(
        function(documento){

            agendamentos.push({
                id: documento.id,
                ...documento.data()
            });
        }
    );


    agendamentos.sort(
        function(a, b){

            const primeiro =
                a.data +
                " " +
                a.horario;

            const segundo =
                b.data +
                " " +
                b.horario;

            return primeiro.localeCompare(
                segundo
            );
        }
    );


    return agendamentos;
}


// ==========================
// CARREGAR PAINEL
// ==========================

async function carregarAgendamentos(){

    carregando.style.display =
        "block";

    listaAgendamentos.innerHTML =
        "";

    try{

        const agendamentos =
            await buscarTodosAgendamentos();


        carregando.style.display =
            "none";


        if(modoAtual === "semana"){

            mostrarSemana(
                agendamentos,
                0
            );

        }else if(
            modoAtual === "proxima"
        ){

            mostrarSemana(
                agendamentos,
                7
            );

        }else{

            mostrarHistorico(
                agendamentos
            );
        }


    }catch(erro){

        console.error(
            "Erro ao carregar agenda:",
            erro
        );

        carregando.style.display =
            "none";

        listaAgendamentos.innerHTML = `
            <div class="vazio">
                Não foi possível carregar
                os agendamentos.
            </div>
        `;
    }
}

function atualizarResumo(agendamentosSemana){

    const totalClientes = agendamentosSemana.length;

    let totalConcluidos = 0;
    let valorPrevisto = 0;

    agendamentosSemana.forEach(function(item){

        // Verifica se o atendimento já terminou
        if(estaConcluido(item)){
            totalConcluidos++;
        }

        // Converte o preço para número
        let preco = String(item.preco || "0");

        preco = preco
            .replace("R$", "")
            .replace(/\s/g, "")
            .replace(",", ".");

        const valor = Number(preco);

        if(!isNaN(valor)){
            valorPrevisto += valor;
        }
    });

    resumoClientes.textContent = totalClientes;

    resumoConcluidos.textContent = totalConcluidos;

    resumoValor.textContent = valorPrevisto.toLocaleString(
        "pt-BR",
        {
            style:"currency",
            currency:"BRL"
        }
    );

    resumoAgenda.style.display = "grid";
}

// ==========================
// MOSTRAR SEMANA
// ==========================

function mostrarSemana(
    agendamentos,
    adicionarDias
){

    listaAgendamentos.innerHTML =
        "";

    const hoje = new Date();

    const hojeLimpo =
        new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            hoje.getDate()
        );


    const inicio =
        inicioDaSemana(
            hojeLimpo
        );


    inicio.setDate(
        inicio.getDate() +
        adicionarDias
    );


    const dias =
        criarDiasSemana(
            inicio
        );


    const finalSemana =
        dias[6];


    dataAtual.textContent =
        formatarDataBR(
            formatarDataBanco(inicio)
        ) +
        " até " +
        formatarDataBR(
            formatarDataBanco(finalSemana)
        );
     
    // Agendamentos que pertencem somente à semana exibida
const inicioTexto = formatarDataBanco(inicio);
const finalTexto = formatarDataBanco(finalSemana);

const agendamentosSemana = agendamentos.filter(function(item){
    return item.data >= inicioTexto && item.data <= finalTexto;
});

// Atualiza os cards do resumo
atualizarResumo(agendamentosSemana);

    dias.forEach(
        function(data){

            criarDiaDaSemana(
                data,
                agendamentos,
                hojeLimpo
            );
        }
    );
}


// ==========================
// CRIAR DIA DA SEMANA
// ==========================

function criarDiaDaSemana(
    data,
    agendamentos,
    hoje
){

    const dataBanco =
        formatarDataBanco(data);


    const agendamentosDia =
        agendamentos.filter(
            function(item){

                return (
                    item.data ===
                    dataBanco
                );
            }
        );


    const bloco =
        document.createElement(
            "section"
        );

    bloco.classList.add(
        "dia-semana"
    );


    if(
        formatarDataBanco(data) ===
        formatarDataBanco(hoje)
    ){

        bloco.classList.add(
            "dia-hoje"
        );
    }


    const titulo =
        document.createElement(
            "div"
        );

    titulo.classList.add(
        "dia-semana-titulo"
    );


    const h3 =
        document.createElement("h3");

    h3.textContent =
        nomeDiaSemana(data);


    const span =
        document.createElement("span");

    span.textContent =
        formatarDataBR(
            dataBanco
        );


    titulo.appendChild(h3);
    titulo.appendChild(span);

    bloco.appendChild(titulo);


    // DIA FECHADO

    if(
        funcionamento[
            data.getDay()
        ] === null
    ){

        const fechado =
            document.createElement(
                "div"
            );

        fechado.classList.add(
            "dia-fechado"
        );

        const strong =
            document.createElement(
                "strong"
            );

        strong.textContent =
            "FECHADO";

        fechado.appendChild(
            strong
        );

        bloco.appendChild(
            fechado
        );

        listaAgendamentos.appendChild(
            bloco
        );

        return;
    }


    // DIA SEM AGENDAMENTOS

    if(
        agendamentosDia.length === 0
    ){

        const vazio =
            document.createElement(
                "div"
            );

        vazio.classList.add(
            "dia-vazio"
        );

        vazio.textContent =
            "Nenhum agendamento neste dia.";

        bloco.appendChild(
            vazio
        );

        listaAgendamentos.appendChild(
            bloco
        );

        return;
    }


    // AGENDAMENTOS DO DIA

    const lista =
        document.createElement(
            "div"
        );

    lista.classList.add(
        "agendamentos-dia"
    );


    agendamentosDia.forEach(
        function(item){

            criarCard(
                item,
                lista
            );
        }
    );


    bloco.appendChild(
        lista
    );


    listaAgendamentos.appendChild(
        bloco
    );
}


// ==========================
// HISTÓRICO
// ==========================

function mostrarHistorico(
    agendamentos
){

    listaAgendamentos.innerHTML =
        "";

    dataAtual.textContent =
        "Serviços de dias anteriores";


    const hoje =
        formatarDataBanco(
            new Date()
        );


    const historico =
        agendamentos.filter(
            function(item){

                return item.data < hoje;
            }
        );


    historico.reverse();


    if(
        historico.length === 0
    ){

        listaAgendamentos.innerHTML = `
            <div class="vazio">
                Ainda não existem
                agendamentos no histórico.
            </div>
        `;

        return;
    }


    let ultimaData = "";


    historico.forEach(
        function(item){

            if(
                item.data !==
                ultimaData
            ){

                ultimaData =
                    item.data;


                const titulo =
                    document.createElement(
                        "div"
                    );

                titulo.classList.add(
                    "dia-semana-titulo"
                );


                const dataItem =
                    criarDataLocal(
                        item.data
                    );


                const h3 =
                    document.createElement(
                        "h3"
                    );

                h3.textContent =
                    nomeDiaSemana(
                        dataItem
                    );


                const span =
                    document.createElement(
                        "span"
                    );

                span.textContent =
                    formatarDataBR(
                        item.data
                    );


                titulo.appendChild(
                    h3
                );

                titulo.appendChild(
                    span
                );

                listaAgendamentos.appendChild(
                    titulo
                );
            }


            criarCard(
                item,
                listaAgendamentos
            );
        }
    );
}


// ==========================
// CRIAR CARD
// ==========================

function criarCard(
    item,
    destino
){

    const concluido =
        estaConcluido(item);


    const horarioFinal =
        calcularFim(
            item.horario,
            item.duracao
        );


    const card =
        document.createElement(
            "div"
        );


    card.classList.add(
        "agendamento-card"
    );


    // TOPO

    const topo =
        document.createElement(
            "div"
        );

    topo.classList.add(
        "card-topo"
    );


    const horarioArea =
        document.createElement(
            "div"
        );


    const horario =
        document.createElement(
            "div"
        );

    horario.classList.add(
        "horario"
    );

    horario.textContent =
        item.horario;


    const horarioFim =
        document.createElement(
            "small"
        );

    horarioFim.textContent =
        "até " + horarioFinal;


    horarioArea.appendChild(
        horario
    );

    horarioArea.appendChild(
        horarioFim
    );


    const status =
        document.createElement(
            "span"
        );

    status.classList.add(
        "status"
    );


    if(concluido){

        status.classList.add(
            "status-concluido"
        );

        status.textContent =
            "CONCLUÍDO";

    }else{

        status.classList.add(
            "status-agendado"
        );

        status.textContent =
            "AGENDADO";
    }


    topo.appendChild(
        horarioArea
    );

    topo.appendChild(
        status
    );


    card.appendChild(
        topo
    );


    // DADOS

    const dados =
        document.createElement(
            "div"
        );

    dados.classList.add(
        "dados"
    );


    adicionarDado(
        dados,
        "Cliente",
        item.nome
    );

    adicionarDado(
        dados,
        "Data",
        formatarDataBR(
            item.data
        )
    );

    adicionarDado(
        dados,
        "Serviço",
        item.servico
    );

    adicionarDado(
        dados,
        "Duração",
        item.duracao + " min"
    );

    adicionarDado(
        dados,
        "Telefone",
        item.telefone
    );

    adicionarDado(
        dados,
        "E-mail",
        item.email
    );

    adicionarDado(
        dados,
        "Valor",
        "R$ " + item.preco
    );


    card.appendChild(
        dados
    );


    // CANCELAR SOMENTE
    // SE NÃO TERMINOU

    if(!concluido){

        const acoes =
            document.createElement(
                "div"
            );

        acoes.classList.add(
            "acoes"
        );


        const btnCancelar =
            document.createElement(
                "button"
            );

        btnCancelar.classList.add(
            "btn-cancelar"
        );

        btnCancelar.textContent =
            "Cancelar agendamento";


        btnCancelar.addEventListener(
            "click",
            function(){

                cancelarAgendamento(
                    item
                );
            }
        );


        acoes.appendChild(
            btnCancelar
        );

        card.appendChild(
            acoes
        );
    }


    destino.appendChild(
        card
    );
}


// ==========================
// ADICIONAR DADO AO CARD
// ==========================

function adicionarDado(
    destino,
    titulo,
    valor
){

    const dado =
        document.createElement(
            "div"
        );

    dado.classList.add(
        "dado"
    );


    const small =
        document.createElement(
            "small"
        );

    small.textContent =
        titulo;


    const strong =
        document.createElement(
            "strong"
        );

    strong.textContent =
        valor ?? "-";


    dado.appendChild(
        small
    );

    dado.appendChild(
        strong
    );


    destino.appendChild(
        dado
    );
}


// ==========================
// CANCELAR
// ==========================

async function cancelarAgendamento(
    item
){

    const confirmar =
        confirm(
            "Deseja realmente cancelar este agendamento?"
        );


    if(!confirmar){
        return;
    }


    try{

        const consulta =
            query(
                collection(
                    db,
                    "horarios_ocupados"
                ),
                where(
                    "agendamentoId",
                    "==",
                    item.id
                )
            );


        const resultado =
            await getDocs(
                consulta
            );


        const exclusoes = [];


        resultado.forEach(
            function(documento){

                exclusoes.push(
                    deleteDoc(
                        doc(
                            db,
                            "horarios_ocupados",
                            documento.id
                        )
                    )
                );
            }
        );


        await Promise.all(
            exclusoes
        );


        await deleteDoc(
            doc(
                db,
                "agendamentos",
                item.id
            )
        );


        alert(
            "Agendamento cancelado. O horário foi liberado."
        );


        await carregarAgendamentos();


    }catch(erro){

        console.error(
            "Erro ao cancelar:",
            erro
        );


        alert(
            "Não foi possível cancelar o agendamento."
        );
    }
}


// ==========================
// ABAS
// ==========================

function limparAbas(){

    abaSemana.classList.remove(
        "active"
    );

    abaProximaSemana.classList.remove(
        "active"
    );

    abaHistorico.classList.remove(
        "active"
    );
}


abaSemana.addEventListener(
    "click",
    function(){

        modoAtual =
            "semana";

        limparAbas();

        abaSemana.classList.add(
            "active"
        );

        carregarAgendamentos();
    }
);


abaProximaSemana.addEventListener(
    "click",
    function(){

        modoAtual =
            "proxima";

        limparAbas();

        abaProximaSemana.classList.add(
            "active"
        );

        carregarAgendamentos();
    }
);


abaHistorico.addEventListener(
    "click",
    function(){

        modoAtual =
            "historico";

        limparAbas();

        abaHistorico.classList.add(
            "active"
        );

        carregarAgendamentos();
    }
);


// ==========================
// ATUALIZAÇÃO AUTOMÁTICA
// ==========================

// Atualiza a cada 30 segundos.
// Assim o status muda sozinho
// para CONCLUÍDO quando o
// tempo do serviço terminar.

setInterval(
    function(){

        if(auth.currentUser){

            carregarAgendamentos();
        }

    },
    30000
);