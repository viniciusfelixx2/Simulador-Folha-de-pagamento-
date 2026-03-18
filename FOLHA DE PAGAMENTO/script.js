const form = document.getElementById("formFolha");
const salarioBrutoInput = document.getElementById("salarioBruto");
const inssInput = document.getElementById("inss");
const irrfInput = document.getElementById("irrf");
const liquidoEl = document.getElementById("liquido");
const mensagemEl = document.getElementById("mensagem");
const btnLimpar = document.getElementById("btnLimpar");

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function arredondar(valor) {
  return Math.round(valor * 100) / 100;
}

function parseValor(valor) {
  let texto = valor.trim().replace(/\s/g, "").replace("R$", "");

  if (texto.includes(",") && texto.includes(".")) {
    texto = texto.replace(/\./g, "").replace(",", ".");
  } else if (texto.includes(",")) {
    texto = texto.replace(",", ".");
  }

  return Number(texto);
}

function calcularINSS(salario) {
  if (salario <= 0) return 0;

  // OBS:
  // O texto do PDF cita 988.09, mas a tabela de testes bate com 988.10.
  // Se quiser seguir literalmente o texto do enunciado, troque para 988.09.
  const TETO_INSS = 988.10;

  const faixas = [
    { limite: 1621.00, aliquota: 0.075 },
    { limite: 2902.84, aliquota: 0.09 },
    { limite: 4354.27, aliquota: 0.12 },
    { limite: Infinity, aliquota: 0.14 }
  ];

  let total = 0;
  let limiteAnterior = 0;

  for (const faixa of faixas) {
    if (salario > limiteAnterior) {
      const baseDaFaixa = Math.min(salario, faixa.limite) - limiteAnterior;
      total += baseDaFaixa * faixa.aliquota;
      limiteAnterior = faixa.limite;
    } else {
      break;
    }
  }

  total = arredondar(total);

  if (total > TETO_INSS) {
    total = TETO_INSS;
  }

  return total;
}

function calcularIRRF(salarioBruto, inss) {
  const baseCalculo = salarioBruto - inss;

  if (baseCalculo <= 5000) {
    return 0;
  }

  const excedente = baseCalculo - 5000;
  return arredondar(excedente * 0.275);
}

function calcularFolha(event) {
  event.preventDefault();

  const salarioBruto = parseValor(salarioBrutoInput.value);

  if (isNaN(salarioBruto) || salarioBruto <= 0) {
    alert("Digite um salário bruto válido.");
    return;
  }

  const inss = calcularINSS(salarioBruto);
  const irrf = calcularIRRF(salarioBruto, inss);
  const liquido = arredondar(salarioBruto - inss - irrf);

  inssInput.value = formatarMoeda(inss);
  irrfInput.value = formatarMoeda(irrf);
  liquidoEl.textContent = formatarMoeda(liquido);

  if (irrf === 0) {
    mensagemEl.textContent = "Você está isento de Imposto de Renda em 2026!";
  } else {
    mensagemEl.textContent = "";
  }
}

function limparCampos() {
  salarioBrutoInput.value = "";
  inssInput.value = "";
  irrfInput.value = "";
  liquidoEl.textContent = "R$ 0,00";
  mensagemEl.textContent = "";
  salarioBrutoInput.focus();
}

form.addEventListener("submit", calcularFolha);
btnLimpar.addEventListener("click", limparCampos);