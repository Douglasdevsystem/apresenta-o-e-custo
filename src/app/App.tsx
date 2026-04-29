import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Zap, TrendingUp, Calculator } from 'lucide-react';

interface MonthData {
  id: string;
  mes: string;
  consumo: number;
  variacao: number;
  custo: number;
}

interface PaybackData {
  id: string;
  mes: string;
  economia: number;
  investimentoRestante: number;
  economiaAcumulada: number;
}

export default function App() {
  const [consumoBase, setConsumoBase] = useState<string>('');
  const [tarifa, setTarifa] = useState<string>('');
  const [gastoMensal, setGastoMensal] = useState<string>('');
  const [numMeses, setNumMeses] = useState<string>('12');
  const [dados, setDados] = useState<MonthData[]>([]);
  const [simulado, setSimulado] = useState(false);
  const [valorInvestimento, setValorInvestimento] = useState<string>('');
  const [dadosPayback, setDadosPayback] = useState<PaybackData[]>([]);
  const [paybackCalculado, setPaybackCalculado] = useState(false);
  const taxaEconomia = 0.18;

  const mesesNomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const gerarSimulacao = () => {
    const meses = parseInt(numMeses);

    // Validar número de meses
    if (!meses) {
      alert('Por favor, preencha o número de meses');
      return;
    }

    const dadosSimulados: MonthData[] = [];
    const hoje = new Date();

    // Opção 1: Simulação por Consumo em kWh
    if (consumoBase && parseFloat(consumoBase) > 0) {
      const base = parseFloat(consumoBase);
      const tarifaValor = parseFloat(tarifa);

      if (!tarifaValor) {
        alert('Para simular por Consumo (kWh), é necessário informar a Tarifa (R$/kWh)');
        return;
      }

      for (let i = 0; i < meses; i++) {
        const variacao = Math.random() * 15; // 0 a 15%
        const consumoMensal = base * (1 + variacao / 100);
        const mesIndex = (hoje.getMonth() + i) % 12;
        const ano = hoje.getFullYear() + Math.floor((hoje.getMonth() + i) / 12);

        dadosSimulados.push({
          id: `${ano}-${String(mesIndex + 1).padStart(2, '0')}-${i}`,
          mes: `${mesesNomes[mesIndex]}/${ano}`,
          consumo: parseFloat(consumoMensal.toFixed(2)),
          variacao: parseFloat(variacao.toFixed(2)),
          custo: parseFloat((consumoMensal * tarifaValor).toFixed(2))
        });
      }
    }
    // Opção 2: Simulação por Gasto Mensal em R$
    else if (gastoMensal && parseFloat(gastoMensal) > 0) {
      const baseGasto = parseFloat(gastoMensal);
      const tarifaValor = parseFloat(tarifa) || 0.85; // Tarifa padrão para calcular kWh

      for (let i = 0; i < meses; i++) {
        const variacao = Math.random() * 15; // 0 a 15%
        const custoMensal = baseGasto * (1 + variacao / 100);
        const consumoMensal = custoMensal / tarifaValor; // Calcula kWh aproximado
        const mesIndex = (hoje.getMonth() + i) % 12;
        const ano = hoje.getFullYear() + Math.floor((hoje.getMonth() + i) / 12);

        dadosSimulados.push({
          id: `${ano}-${String(mesIndex + 1).padStart(2, '0')}-${i}`,
          mes: `${mesesNomes[mesIndex]}/${ano}`,
          consumo: parseFloat(consumoMensal.toFixed(2)),
          variacao: parseFloat(variacao.toFixed(2)),
          custo: parseFloat(custoMensal.toFixed(2))
        });
      }
    } else {
      alert('Por favor, preencha o Consumo Mensal (kWh) OU o Gasto Mensal (R$)');
      return;
    }

    setDados(dadosSimulados);
    setSimulado(true);
  };

  const calcularTotais = () => {
    if (dados.length === 0) return { consumoTotal: 0, custoTotal: 0, consumoMedio: 0 };

    const consumoTotal = dados.reduce((acc, d) => acc + d.consumo, 0);
    const custoTotal = dados.reduce((acc, d) => acc + d.custo, 0);
    const consumoMedio = consumoTotal / dados.length;

    return {
      consumoTotal: consumoTotal.toFixed(2),
      custoTotal: custoTotal.toFixed(2),
      consumoMedio: consumoMedio.toFixed(2)
    };
  };

  const totais = calcularTotais();
  const indicePayback = dadosPayback.findIndex((dado) => dado.investimentoRestante <= 0);
  const mesesParaPayback = indicePayback >= 0 ? indicePayback + 1 : null;
  const mesQuitacao = indicePayback >= 0 ? dadosPayback[indicePayback].mes : null;

  const calcularPayback = () => {
    if (dados.length === 0) {
      alert('Por favor, gere a simulação primeiro');
      return;
    }

    const investimento = parseFloat(valorInvestimento);
    if (!investimento || investimento <= 0) {
      alert('Por favor, informe o valor do investimento');
      return;
    }

    // Criar dados com economia mensal de 18% sobre o valor do investimento
    const dadosComEconomia: PaybackData[] = [];
    let economiaAcumulada = 0;
    let investimentoRestante = investimento;

    dados.forEach((dado) => {
      // Economia mensal é 18% do valor do investimento
      const economiaMensal = investimento * taxaEconomia;
      economiaAcumulada += economiaMensal;
      investimentoRestante -= economiaMensal;

      dadosComEconomia.push({
        id: dado.id,
        mes: dado.mes,
        economia: parseFloat(economiaMensal.toFixed(2)),
        investimentoRestante: parseFloat(Math.max(0, investimentoRestante).toFixed(2)),
        economiaAcumulada: parseFloat(economiaAcumulada.toFixed(2))
      });
    });

    setDadosPayback(dadosComEconomia);
    setPaybackCalculado(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-12 h-12 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Simulação de Consumo Energético
            </h1>
          </div>
          <p className="text-gray-600">
            Sistema de simulação para instituições públicas
          </p>
        </div>

        {/* Formulário de Entrada */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            Parâmetros da Simulação
          </h2>

          <div className="space-y-6">
            {/* Opções de entrada */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-3">
                Escolha uma das opções abaixo para iniciar a simulação:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Opção 1: Consumo Mensal Base (kWh)
                  </label>
                  <input
                    type="number"
                    value={consumoBase}
                    onChange={(e) => setConsumoBase(e.target.value)}
                    placeholder="Ex: 5000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>

                <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Opção 2: Gasto Mensal em R$
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={gastoMensal}
                    onChange={(e) => setGastoMensal(e.target.value)}
                    placeholder="Ex: 4250.00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Campos adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarifa (R$/kWh) {consumoBase && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={tarifa}
                  onChange={(e) => setTarifa(e.target.value)}
                  placeholder="Ex: 0.85"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {consumoBase ? 'Obrigatório para simulação por kWh' : 'Opcional para simulação por R$'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Meses <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={numMeses}
                  onChange={(e) => setNumMeses(e.target.value)}
                  placeholder="Ex: 12"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={gerarSimulacao}
            className="mt-6 w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Gerar Simulação
          </button>
        </div>

        {/* Análise de Economia e Payback */}
        {simulado && dados.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Análise de Economia e Payback
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor do Investimento (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={valorInvestimento}
                  onChange={(e) => setValorInvestimento(e.target.value)}
                  placeholder="Ex: 50000.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Sistema calculará economia mensal de 18% sobre o valor do investimento
                </p>
              </div>

              <div>
                <button
                  onClick={calcularPayback}
                  className="w-full px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Calcular Economia e Payback
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resultados */}
        {simulado && dados.length > 0 && (
          <>
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Consumo Total</p>
                    <p className="text-3xl font-bold text-indigo-600">
                      {totais.consumoTotal}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">kWh</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-indigo-200" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Consumo Médio</p>
                    <p className="text-3xl font-bold text-green-600">
                      {totais.consumoMedio}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">kWh/mês</p>
                  </div>
                  <Zap className="w-10 h-10 text-green-200" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Custo Total</p>
                    <p className="text-3xl font-bold text-red-600">
                      R$ {totais.custoTotal}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">no período</p>
                  </div>
                  <Calculator className="w-10 h-10 text-red-200" />
                </div>
              </div>
            </div>

            {/* Gráfico */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Consumo ao Longo do Tempo
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dados}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="mes"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      if (name === 'consumo') return [`${value} kWh`, 'Consumo'];
                      if (name === 'custo') return [`R$ ${value}`, 'Custo'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="consumo"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    name="Consumo (kWh)"
                    dot={{ fill: '#4f46e5', r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="custo"
                    stroke="#ef4444"
                    strokeWidth={3}
                    name="Custo (R$)"
                    dot={{ fill: '#ef4444', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Resultados de Payback */}
            {paybackCalculado && dadosPayback.length > 0 && (
              <>
                {/* Cards de Resumo de Economia */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 mb-8">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border-2 border-green-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-700 mb-1">Economia Total</p>
                        <p className="text-3xl font-bold text-green-600">
                          R$ {dadosPayback[dadosPayback.length - 1].economiaAcumulada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-green-600 mt-1">no período</p>
                      </div>
                      <TrendingUp className="w-10 h-10 text-green-300" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border-2 border-blue-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-700 mb-1">Investimento Inicial</p>
                        <p className="text-3xl font-bold text-blue-600">
                          R$ {parseFloat(valorInvestimento).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-blue-600 mt-1">valor total</p>
                      </div>
                      <Calculator className="w-10 h-10 text-blue-300" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-lg p-6 border-2 border-orange-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-700 mb-1">Saldo Restante</p>
                        <p className="text-3xl font-bold text-orange-600">
                          R$ {dadosPayback[dadosPayback.length - 1].investimentoRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-orange-600 mt-1">
                          {dadosPayback[dadosPayback.length - 1].investimentoRestante === 0 ? 'Payback completo!' : 'a recuperar'}
                        </p>
                      </div>
                      <Zap className="w-10 h-10 text-orange-300" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl shadow-lg p-6 border-2 border-violet-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-violet-700 mb-1">Período de Payback</p>
                        <p className="text-3xl font-bold text-violet-600">
                          {mesesParaPayback ? `${mesesParaPayback} meses` : 'Não atingido'}
                        </p>
                        <p className="text-sm text-violet-600 mt-1">
                          {mesQuitacao ? `Quitação em ${mesQuitacao}` : 'Aumente o período da simulação'}
                        </p>
                      </div>
                      <TrendingUp className="w-10 h-10 text-violet-300" />
                    </div>
                  </div>
                </div>

                {/* Gráfico de Payback */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    Evolução do Payback
                  </h2>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={dadosPayback}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="mes"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number, name: string) => {
                          if (name === 'economia') return [`R$ ${value}`, 'Economia Mensal'];
                          if (name === 'economiaAcumulada') return [`R$ ${value}`, 'Economia Acumulada'];
                          if (name === 'investimentoRestante') return [`R$ ${value}`, 'Investimento Restante'];
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="economiaAcumulada"
                        stroke="#10b981"
                        strokeWidth={3}
                        name="Economia Acumulada (R$)"
                        dot={{ fill: '#10b981', r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="investimentoRestante"
                        stroke="#f97316"
                        strokeWidth={3}
                        name="Investimento Restante (R$)"
                        dot={{ fill: '#f97316', r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}