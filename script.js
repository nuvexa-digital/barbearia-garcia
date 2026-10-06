
 // ==========================
// FIREBASE
// ==========================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    doc,
    runTransaction,
    serverTimestamp,
    getDoc,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    getAuth,
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAPUf_5xndCIHpuBoKl-POWk24BR_h_VPo",
    authDomain: "barbearia-garcia-653cd.firebaseapp.com",
    projectId: "barbearia-garcia-653cd",
    storageBucket: "barbearia-garcia-653cd.firebasestorage.app",
    messagingSenderId: "483477620088",
    appId: "1:483477620088:web:7df6c58023a8df0ca6348d"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

async function garantirClienteAnonimo(){

    // Se este navegador já estiver identificado,
    // continua usando o mesmo usuário.
    if(auth.currentUser){
        return auth.currentUser;
    }

    // Caso seja a primeira vez,
    // Firebase cria um usuário anônimo automaticamente.
    const resultado = await signInAnonymously(auth);

    return resultado.user;
}

console.log("Firebase conectado!");

// ==========================
// DADOS DO AGENDAMENTO
// ==========================

const agendamento = {

    nome:"",
    telefone:"",
    email:"",
    servico:"",
    preco:"",
    duracao:"",
    data:"",
    horario:""

};


// ==========================
// TELAS PRINCIPAIS
// ==========================

const homeScreen =
document.getElementById("homeScreen");


const bookingScreen =
document.getElementById("bookingScreen");

const meusHorariosScreen = document.getElementById("meusHorariosScreen");

const btnMeusHorarios = document.getElementById("btnMeusHorarios");

const btnVoltarMeusHorarios = document.getElementById("btnVoltarMeusHorarios");

const btnAgendar =
document.getElementById("btnAgendar");


const btnAgendarTopo =
document.getElementById("btnAgendarTopo");


const btnVoltar =
document.getElementById("btnVoltar");



// ==========================
// ABRIR AGENDAMENTO
// ==========================

function abrirAgendamento(){

    homeScreen.classList.remove("active");


    setTimeout(function(){

        bookingScreen.classList.add("active");

    },150);

}



// ==========================
// VOLTAR PARA HOME
// ==========================

function voltarInicio(){

    bookingScreen.classList.remove("active");


    setTimeout(function(){

        homeScreen.classList.add("active");

    },150);

}



// BOTÕES

btnAgendar.addEventListener(

    "click",

    abrirAgendamento

);


btnAgendarTopo.addEventListener(

    "click",

    abrirAgendamento

);


btnVoltar.addEventListener(

    "click",

    voltarInicio

);

// ==========================================
// CARREGAR MEUS HORÁRIOS
// ==========================================

async function carregarMeusHorarios(){

    const listaMeusHorarios =
        document.getElementById("listaMeusHorarios");

    listaMeusHorarios.innerHTML =
        `<p class="sem-agendamentos">Carregando seus horários...</p>`;

    // IDs dos agendamentos salvos neste navegador
    const meusAgendamentos = JSON.parse(
        localStorage.getItem("meusAgendamentos") || "[]"
    );

    // Se não existir nenhum ID salvo
    if(meusAgendamentos.length === 0){

        listaMeusHorarios.innerHTML = `
            <p class="sem-agendamentos">
                Você ainda não possui horários agendados.
            </p>
        `;

        return;
    }


    listaMeusHorarios.innerHTML = "";

    let quantidadeEncontrada = 0;


    for(const agendamentoId of meusAgendamentos){

        try{

            const agendamentoRef =
                doc(db, "agendamentos", agendamentoId);

            const agendamentoDoc =
                await getDoc(agendamentoRef);


            // Caso esse agendamento já tenha sido apagado
            if(!agendamentoDoc.exists()){
                continue;
            }


            const dados = agendamentoDoc.data();

            quantidadeEncontrada++;


            // Formata 2026-10-05 para 05/10/2026
            const partesData = dados.data.split("-");

            const dataFormatada =
                partesData[2] + "/" +
                partesData[1] + "/" +
                partesData[0];


            // Cria o card
            const card =
                document.createElement("div");

            card.classList.add("meu-horario-card");


            const titulo =
                document.createElement("h4");

            titulo.textContent =
                dados.servico;


            const informacoes =
                document.createElement("div");

            informacoes.classList.add(
                "meu-horario-info"
            );


            const data =
                document.createElement("span");

            data.innerHTML =
                `<i class="fa-regular fa-calendar"></i> ${dataFormatada}`;


            const horario =
                document.createElement("span");

            horario.innerHTML =
                `<i class="fa-regular fa-clock"></i> ${dados.horario}`;


            const preco =
                document.createElement("span");

            preco.innerHTML =
                `<i class="fa-solid fa-tag"></i> R$ ${dados.preco}`;


            informacoes.appendChild(data);
            informacoes.appendChild(horario);
            informacoes.appendChild(preco);


            const btnCancelar =
                document.createElement("button");

            btnCancelar.type = "button";

            btnCancelar.classList.add(
                "btn-cancelar-cliente"
            );

            btnCancelar.textContent =
                "Cancelar agendamento";

            btnCancelar.addEventListener("click", async function(){

           const modalCancelamento =
    document.getElementById("modalCancelamento");

const textoCancelamento =
    document.getElementById("textoCancelamento");

const btnVoltarCancelamento =
    document.getElementById("btnVoltarCancelamento");

const btnConfirmarCancelamento =
    document.getElementById("btnConfirmarCancelamento");


textoCancelamento.innerHTML = `
    Tem certeza que deseja cancelar
    <strong>${dados.servico}</strong><br>
    ${dataFormatada} às ${dados.horario}?
`;


modalCancelamento.classList.add("ativo");


const confirmar = await new Promise(function(resolve){

    function fecharModal(resultado){

        modalCancelamento.classList.remove("ativo");

        btnVoltarCancelamento.onclick = null;
        btnConfirmarCancelamento.onclick = null;

        resolve(resultado);
    }


    btnVoltarCancelamento.onclick = function(){

        fecharModal(false);

    };


    btnConfirmarCancelamento.onclick = function(){

        fecharModal(true);

    };

});


if(!confirmar){
    return;
}
    try{

        btnCancelar.disabled = true;
        btnCancelar.textContent = "Cancelando...";

        const usuarioCliente =
            await garantirClienteAnonimo();

        const blocos = criarBlocosOcupados(
            dados.horario,
            dados.duracao
        );

        await runTransaction(
    db,
    async function(transaction){

        const agendamentoRef = doc(
            db,
            "agendamentos",
            agendamentoId
        );

        // Confere se o agendamento ainda existe
        const agendamentoAtual =
            await transaction.get(agendamentoRef);

        if(!agendamentoAtual.exists()){
            throw new Error("AGENDAMENTO_NAO_EXISTE");
        }

        const referenciasParaApagar = [];

        // Primeiro lê e confere todos os blocos
        for(const horario of blocos){

            const horarioId =
                dados.data +
                "_" +
                horario.replace(":", "");

            const horarioRef = doc(
                db,
                "horarios_ocupados",
                horarioId
            );

            const horarioDoc =
                await transaction.get(horarioRef);

            if(horarioDoc.exists()){

                const dadosHorario =
                    horarioDoc.data();

                if(
                    dadosHorario.agendamentoId !==
                    agendamentoId
                ){
                    throw new Error(
                        "BLOCO_NAO_PERTENCE_AO_AGENDAMENTO"
                    );
                }

                referenciasParaApagar.push(
                    horarioRef
                );
            }
        }

        // Depois das leituras, apaga os blocos
        for(const horarioRef of referenciasParaApagar){

            transaction.delete(horarioRef);

        }

        // Por último apaga o agendamento
        transaction.delete(agendamentoRef);

    }
);


        // Remove o ID deste navegador
        const idsAtualizados =
            meusAgendamentos.filter(function(id){
                return id !== agendamentoId;
            });

        localStorage.setItem(
            "meusAgendamentos",
            JSON.stringify(idsAtualizados)
        );


        alert(
            "Agendamento cancelado com sucesso!"
        );


        // Atualiza a tela
        await carregarMeusHorarios();


    }catch(erro){

        console.error(
            "Erro ao cancelar agendamento:",
            erro
        );

        alert(
            "Não foi possível cancelar o agendamento."
        );

        btnCancelar.disabled = false;
        btnCancelar.textContent =
            "Cancelar agendamento";

    }

});

            card.appendChild(titulo);
            card.appendChild(informacoes);
            card.appendChild(btnCancelar);

            listaMeusHorarios.appendChild(card);

        }catch(erro){

            console.error(
                "Erro ao carregar agendamento:",
                erro
            );

        }

    }


    // Se os IDs existiam, mas os documentos foram apagados
    if(quantidadeEncontrada === 0){

        listaMeusHorarios.innerHTML = `
            <p class="sem-agendamentos">
                Você ainda não possui horários agendados.
            </p>
        `;

    }

}

btnMeusHorarios.addEventListener("click", function(){

    homeScreen.classList.remove("active");
    bookingScreen.classList.remove("active");

    meusHorariosScreen.classList.add("active");
   carregarMeusHorarios();
});

btnVoltarMeusHorarios.addEventListener("click", function(){

    meusHorariosScreen.classList.remove("active");

    homeScreen.classList.add("active");

});


// ==========================
// ETAPAS
// ==========================

const stepNome =
document.getElementById("stepNome");


const stepTelefone =
document.getElementById("stepTelefone");


const stepEmail =
document.getElementById("stepEmail");


const stepServico =
document.getElementById("stepServico");

const stepData =
document.getElementById("stepData");

const stepHorario =
document.getElementById("stepHorario");


const listaDatas =
document.getElementById("listaDatas");


const btnData =
document.getElementById("btnData");


const listaHorarios =
document.getElementById("listaHorarios");

// ==========================
// INPUTS
// ==========================

const nomeCliente =
document.getElementById("nomeCliente");


const telefoneCliente =
document.getElementById("telefoneCliente");


const emailCliente =
document.getElementById("emailCliente");



// ==========================
// BOTÕES ETAPAS
// ==========================

const btnNome =
document.getElementById("btnNome");


const btnTelefone =
document.getElementById("btnTelefone");


const btnEmail =
document.getElementById("btnEmail");


const btnServico =
document.getElementById("btnServico");

const btnConfirmar =
document.getElementById("btnConfirmar");

// ==========================
// TROCAR ETAPA
// ==========================

function mostrarEtapa(etapa){


    document
    .querySelectorAll(".booking-screen")
    .forEach(function(tela){


        tela.classList.remove("active");


    });


    etapa.classList.add("active");


}



// ==========================
// NOME
// ==========================

btnNome.addEventListener(

    "click",

    function(){


        const nome =

        nomeCliente.value.trim();


        if(nome.length < 2){


            alert(

                "Digite seu nome."

            );


            return;


        }


        agendamento.nome = nome;


        mostrarEtapa(

            stepTelefone

        );


    }

);



// ==========================
// TELEFONE
// ==========================

btnTelefone.addEventListener(

    "click",

    function(){


        const telefone =

        telefoneCliente.value.trim();


        if(telefone.length < 8){


            alert(

                "Digite um telefone válido."

            );


            return;


        }


        agendamento.telefone = telefone;


        mostrarEtapa(

            stepEmail

        );


    }

);



// ==========================
// EMAIL
// ==========================

btnEmail.addEventListener(

    "click",

    function(){


        const email =

        emailCliente.value.trim();


        if(

            email === "" ||

            !email.includes("@")

        ){


            alert(

                "Digite um e-mail válido."

            );


            return;


        }


        agendamento.email = email;


        mostrarEtapa(

            stepServico

        );


    }

);



// ==========================
// SERVIÇOS
// ==========================

const servicos =

document.querySelectorAll(

    ".booking-service"

);



servicos.forEach(

function(servico){


    servico.addEventListener(

        "click",

        function(){


            servicos.forEach(

            function(item){


                item.classList.remove(

                    "selected"

                );


            });


            servico.classList.add(

                "selected"

            );


            agendamento.servico =

            servico.dataset.servico;


            agendamento.preco =

            servico.dataset.preco;


            agendamento.duracao =

            servico.dataset.duracao;


            btnServico.disabled = false;


            console.log(

                agendamento

            );


        }

    );


});

// ==========================
// SERVIÇO → DATA
// ==========================

btnServico.addEventListener(
    "click",
    function(){

        if(agendamento.servico === ""){
            alert("Escolha um serviço.");
            return;
        }

        mostrarEtapa(stepData);

    }
);

// ==========================
// CRIAR DATAS DISPONÍVEIS
// ==========================

const nomesDias = [
    "DOM",
    "SEG",
    "TER",
    "QUA",
    "QUI",
    "SEX",
    "SÁB"
];

const nomesMeses = [
    "JAN",
    "FEV",
    "MAR",
    "ABR",
    "MAI",
    "JUN",
    "JUL",
    "AGO",
    "SET",
    "OUT",
    "NOV",
    "DEZ"
];


function criarDatas(){

    listaDatas.innerHTML = "";

    const hoje = new Date();


    // Mostra os próximos 14 dias
    for(let i = 0; i < 14; i++){

        const data = new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            hoje.getDate() + i
        );


        const ano = data.getFullYear();

        const mesNumero =
        String(data.getMonth() + 1).padStart(2, "0");

        const diaNumero =
        String(data.getDate()).padStart(2, "0");


        const dataBanco =
        `${ano}-${mesNumero}-${diaNumero}`;


        const botao =
        document.createElement("button");


        botao.type = "button";

        botao.classList.add("data-card");


// Domingo = 0
// Terça-feira = 2
const diaSemana = data.getDay();

const fechado =
diaSemana === 0 || diaSemana === 2;


if(fechado){

    botao.disabled = true;

    botao.classList.add("fechado");

    botao.innerHTML = `
        <span>${nomesDias[data.getDay()]}</span>

        <strong class="dia-fechado">
            <i class="fa-solid fa-xmark"></i>
        </strong>

        <small>FECHADO</small>
    `;

}else{

    botao.innerHTML = `
        <span>${nomesDias[data.getDay()]}</span>

        <strong>
            ${i === 0 ? "HOJE" : diaNumero}
        </strong>

        <small>
            ${nomesMeses[data.getMonth()]}
        </small>
    `;

}


        botao.addEventListener(
            "click",
            function(){

                document
                .querySelectorAll(".data-card")
                .forEach(function(item){

                    item.classList.remove("selected");

                });


                botao.classList.add("selected");


                agendamento.data = dataBanco;


                btnData.disabled = false;

            }
        );


        listaDatas.appendChild(botao);

    }

}


criarDatas();


// ==========================
// DATA → HORÁRIO
// ==========================

btnData.addEventListener(
    "click",
    function(){

        if(agendamento.data === ""){

            alert("Escolha uma data.");

            return;

        }

        criarHorarios();

        mostrarEtapa(stepHorario);

    }
);

// ==========================
// HORÁRIOS DISPONÍVEIS
// ==========================

// ==========================
// HORÁRIOS DE FUNCIONAMENTO
// ==========================

const funcionamento = {

    // Domingo
    0: null,

    // Segunda
    1: {
        inicio: "18:00",
        fim: "00:00"
    },

    // Terça
    2: null,

    // Quarta
    3: {
        inicio: "17:30",
        fim: "00:00"
    },

    // Quinta
    4: {
        inicio: "17:30",
        fim: "00:00"
    },

    // Sexta
    5: {
        inicio: "17:30",
        fim: "00:00"
    },

    // Sábado
    6: {
        inicio: "08:30",
        fim: "17:30"
    }

};

// ==========================
// CRIAR HORÁRIOS DISPONÍVEIS
// ==========================

async function criarHorarios(){

    listaHorarios.innerHTML = "<p>Carregando horários...</p>";

    agendamento.horario = "";
    btnConfirmar.disabled = true;

    // Pega a data escolhida
    const partes = agendamento.data.split("-");

    const dataEscolhida = new Date(
        Number(partes[0]),
        Number(partes[1]) - 1,
        Number(partes[2])
    );

    const diaSemana = dataEscolhida.getDay();
    const expediente = funcionamento[diaSemana];

    // Dia fechado
    if(!expediente){
        listaHorarios.innerHTML =
            "<p>Não há atendimento neste dia.</p>";
        return;
    }

    // Converte HH:MM para minutos
    function paraMinutos(horario){
        const partesHorario = horario.split(":");

        return (
            Number(partesHorario[0]) * 60 +
            Number(partesHorario[1])
        );
    }

    // Converte minutos para HH:MM
    function paraHorario(minutos){
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;

        return (
            String(horas).padStart(2, "0") +
            ":" +
            String(mins).padStart(2, "0")
        );
    }

    const inicio = paraMinutos(expediente.inicio);

    let fim;

    if(expediente.fim === "00:00"){
        fim = 24 * 60;
    }else{
        fim = paraMinutos(expediente.fim);
    }

    const duracaoServico = Number(agendamento.duracao);

    try{

        // Busca os horários ocupados dessa data
        const consulta = query(
            collection(db, "horarios_ocupados"),
            where("data", "==", agendamento.data)
        );

        const resultado = await getDocs(consulta);

        const ocupados = new Set();

        resultado.forEach(function(documento){
            const dados = documento.data();

            ocupados.add(dados.horario);
        });

        listaHorarios.innerHTML = "";

        let quantidadeDisponivel = 0;

        // Verifica se a data escolhida é hoje
const agora = new Date();

const hojeTexto =
    agora.getFullYear() + "-" +
    String(agora.getMonth() + 1).padStart(2, "0") + "-" +
    String(agora.getDate()).padStart(2, "0");

const dataEhHoje = agendamento.data === hojeTexto;

// Horário atual em minutos
const minutosAgora =
    agora.getHours() * 60 +
    agora.getMinutes();

let quantidadeHorariosFuturos = 0;
        // Cria opções a cada 30 minutos
        for(
    let minutos = inicio;
    minutos < fim;
    minutos += 30
){

    // Se for hoje e o horário já passou, não mostra
    if(dataEhHoje && minutos <= minutosAgora){
        continue;
    }

    quantidadeHorariosFuturos++;

    const fimServico =
        minutos + duracaoServico;

    // Não permite terminar depois do fechamento
    if(fimServico > fim){
        continue;
    }



            let possuiConflito = false;

            // Verifica a duração inteira em blocos de 10 min
            for(
                let bloco = minutos;
                bloco < fimServico;
                bloco += 10
            ){

                const horarioBloco =
                    paraHorario(bloco);

                if(ocupados.has(horarioBloco)){
                    possuiConflito = true;
                    break;
                }
            }

            // Horário ocupado não aparece
            if(possuiConflito){
                continue;
            }

            const horario =
                paraHorario(minutos);

            const botao =
                document.createElement("button");

            botao.type = "button";
            botao.classList.add("horario-card");
            botao.textContent = horario;

            botao.addEventListener(
                "click",
                function(){

                    document
                        .querySelectorAll(".horario-card")
                        .forEach(function(item){
                            item.classList.remove("selected");
                        });

                    botao.classList.add("selected");

                    agendamento.horario = horario;

                    btnConfirmar.disabled = false;

                    console.log(agendamento);
                }
            );

            listaHorarios.appendChild(botao);

            quantidadeDisponivel++;
        }

        if(quantidadeDisponivel === 0){

    if(dataEhHoje && quantidadeHorariosFuturos === 0){

        listaHorarios.innerHTML =
            "<p>Todos os horários disponíveis de hoje já passaram.</p>";

    }else{

        listaHorarios.innerHTML =
            "<p>Todos os horários disponíveis já foram marcados.</p>";

    }
}
    }catch(erro){

        console.error(
            "Erro ao carregar horários:",
            erro
        );

        listaHorarios.innerHTML =
            "<p>Não foi possível carregar os horários. Tente novamente.</p>";
    }
}

// ==========================
// CONFIRMAR AGENDAMENTO
// ==========================

// ==========================
// CONFIRMAR AGENDAMENTO
// COM BLOQUEIO DE HORÁRIOS
// ==========================

function horarioParaMinutos(horario){

    const partes = horario.split(":");

    return (
        Number(partes[0]) * 60 +
        Number(partes[1])
    );
}


function minutosParaHorario(minutos){

    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;

    return (
        String(horas).padStart(2, "0") +
        ":" +
        String(mins).padStart(2, "0")
    );
}


// Cria blocos de 10 minutos.
// Exemplo:
// 10:30 + serviço de 50 min
//
// 10:30
// 10:40
// 10:50
// 11:00
// 11:10

function criarBlocosOcupados(horario, duracao){

    const inicio =
        horarioParaMinutos(horario);

    const duracaoNumero =
        Number(duracao);

    const blocos = [];

    for(
        let minuto = inicio;
        minuto < inicio + duracaoNumero;
        minuto += 10
    ){
        blocos.push(
            minutosParaHorario(minuto)
        );
    }

    return blocos;
}


btnConfirmar.addEventListener("click", async function(){

    if(
        agendamento.nome === "" ||
        agendamento.telefone === "" ||
        agendamento.email === "" ||
        agendamento.servico === "" ||
        agendamento.data === "" ||
        agendamento.horario === ""
    ){
        alert("Preencha todos os dados do agendamento.");
        return;
    }

    try{

        btnConfirmar.disabled = true;
        btnConfirmar.textContent = "Confirmando...";

        // Identifica silenciosamente este cliente
        const usuarioCliente = await garantirClienteAnonimo();

        // Calcula todos os blocos ocupados pelo serviço
        const blocosOcupados = criarBlocosOcupados(
            agendamento.horario,
            agendamento.duracao
        );

        // Cria antecipadamente o ID do agendamento
        const agendamentoRef = doc(
            collection(db, "agendamentos")
        );

        await runTransaction(db, async function(transaction){

            const referenciasHorarios = [];

            // ==========================================
            // VERIFICAR SE OS HORÁRIOS ESTÃO LIVRES
            // ==========================================

            for(const horario of blocosOcupados){

                const horarioId =
                    agendamento.data +
                    "_" +
                    horario.replace(":", "");

                const horarioRef = doc(
                    db,
                    "horarios_ocupados",
                    horarioId
                );

                referenciasHorarios.push({
                    ref: horarioRef,
                    horario: horario
                });

                const horarioDoc =
                    await transaction.get(horarioRef);

                if(horarioDoc.exists()){
                    throw new Error("HORARIO_OCUPADO");
                }
            }


            // ==========================================
            // SALVAR AGENDAMENTO
            // ==========================================

            transaction.set(
                agendamentoRef,
                {
                    nome: agendamento.nome,
                    telefone: agendamento.telefone,
                    email: agendamento.email,
                    servico: agendamento.servico,
                    preco: agendamento.preco,
                    duracao: agendamento.duracao,
                    data: agendamento.data,
                    horario: agendamento.horario,
                    clienteUid: usuarioCliente.uid,
                    criadoEm: serverTimestamp()
                }
            );


            // ==========================================
            // BLOQUEAR TODOS OS BLOCOS DO SERVIÇO
            // ==========================================

            for(const item of referenciasHorarios){

                transaction.set(
                    item.ref,
                    {
                        data: agendamento.data,
                        horario: item.horario,
                        agendamentoId: agendamentoRef.id,
                        clienteUid: usuarioCliente.uid
                    }
                );

            }

        });


        // ==========================================
        // GUARDAR O ID NESTE NAVEGADOR
        // ==========================================

        const meusAgendamentos = JSON.parse(
            localStorage.getItem("meusAgendamentos") || "[]"
        );

        if(!meusAgendamentos.includes(agendamentoRef.id)){
            meusAgendamentos.push(agendamentoRef.id);
        }

        localStorage.setItem(
            "meusAgendamentos",
            JSON.stringify(meusAgendamentos)
        );


        // ==========================================
        // SUCESSO
        // ==========================================

        mostrarEtapa(
            document.getElementById("stepSucesso")
        );

        btnConfirmar.textContent =
            "Agendamento confirmado";


        setTimeout(function(){

            bookingScreen.classList.remove("active");
            homeScreen.classList.add("active");

            mostrarEtapa(
                document.getElementById("stepNome")
            );

        }, 5000);


    }catch(erro){

        console.error(
            "Erro no agendamento:",
            erro
        );

        if(erro.message === "HORARIO_OCUPADO"){

            alert(
                "Esse horário acabou de ser ocupado por outro cliente. Escolha outro horário."
            );

        }else{

            alert(
                "Não foi possível realizar o agendamento. Tente novamente."
            );

        }

        btnConfirmar.disabled = false;

        btnConfirmar.innerHTML = `
            Confirmar agendamento
            <i class="fa-solid fa-check"></i>
        `;
    }

});