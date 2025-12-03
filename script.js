// ============================
// CONFIGURAÇÃO DO FIREBASE
// ============================
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    databaseURL: "https://meteorologia-ea-default-rtdb.firebaseio.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ============================
// CONFIGURAÇÃO DOS GRÁFICOS
// ============================
const configGrafico = (label, cor, maxY = null) => ({
    type: 'line',
    data: { labels: [], datasets: [{ 
        label, 
        data: [], 
        borderColor: cor, 
        backgroundColor: cor + '55', 
        fill: true, 
        tension: 0.4, 
        pointRadius: 4 
    }] },
    options: {
        responsive: true,
        plugins: {
            legend: { display: true },
            tooltip: { mode: 'index', intersect: false }
        },
        scales: {
            y: { beginAtZero: false, max: maxY },
            x: { ticks: { color: '#ffffff' } }
        }
    }
});

const graficoTemperatura = new Chart(document.getElementById('graficoTemp'), configGrafico('Temperatura', '#ffaaaa'));
const graficoUmidade = new Chart(document.getElementById('graficoUmidade'), configGrafico('Umidade', '#aaddff', 100));
const graficoPressao = new Chart(document.getElementById('graficoPressao'), configGrafico('Pressão', '#aaffaa'));

// ============================
// FUNÇÃO PARA ATUALIZAR GRÁFICOS
// ============================
function atualizarGraficos(temp, umidade, pressao) {
    const agora = new Date().toLocaleTimeString();

    function adicionar(chart, valor) {
        chart.data.labels.push(agora);
        chart.data.datasets[0].data.push(valor);
        if(chart.data.labels.length > 30) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }
        chart.update();
    }

    adicionar(graficoTemperatura, temp);
    adicionar(graficoUmidade, umidade);
    adicionar(graficoPressao, pressao);
}

// ============================
// ESCUTA EM TEMPO REAL DO FIREBASE
// ============================
const leiturasRef = database.ref("leituras");
leiturasRef.on("value", snapshot => {
    const dados = snapshot.val();
    let ultima = null;

    function percorrer(obj) {
        for (let key in obj) {
            if (obj[key].ts) ultima = obj[key];
            else percorrer(obj[key]);
        }
    }
    percorrer(dados);

    if (ultima) {
        const temp = ultima.temp ?? 0;
        const umidade = ultima.umidade ?? 0;
        const pressao = ultima.press ?? 0;

        document.getElementById("temp").innerText = temp + " °C";
        document.getElementById("umidade").innerText = umidade + " %";
        document.getElementById("pressao").innerText = pressao + " hPa";

        atualizarGraficos(temp, umidade, pressao);
    }
});
