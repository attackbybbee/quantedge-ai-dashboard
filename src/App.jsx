import { useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import './App.css'

const stocks = {
  NVDA: {
    name: 'NVIDIA Corp.',
    price: 154.38,
    change: '+3.82%',
    sector: 'AI Semiconductor',
    base: 154,
  },
  TSLA: {
    name: 'Tesla Inc.',
    price: 286.12,
    change: '-1.24%',
    sector: 'EV & Robotics',
    base: 286,
  },
  TSM: {
    name: 'Taiwan Semiconductor',
    price: 231.54,
    change: '+2.18%',
    sector: 'Foundry',
    base: 231,
  },
  AAPL: {
    name: 'Apple Inc.',
    price: 214.87,
    change: '+0.76%',
    sector: 'Consumer Tech',
    base: 214,
  },
}

const signalPresets = {
  BUY: {
    label: 'BUY',
    tone: 'positive',
    confidence: 88,
    forecast: '+4.8%',
    risk: 'Medium',
    metrics: {
      winRate: '78.6%',
      sharpe: '2.14',
      drawdown: '-6.9%',
      backtest: '+38.2%',
    },
    reason:
      'AI detected a momentum breakout above the short-term moving average, supported by expanding volume and controlled volatility.',
  },
  SELL: {
    label: 'SELL',
    tone: 'negative',
    confidence: 81,
    forecast: '-3.1%',
    risk: 'High',
    metrics: {
      winRate: '61.8%',
      sharpe: '1.21',
      drawdown: '-13.7%',
      backtest: '+12.4%',
    },
    reason:
      'AI detected weakening price momentum, rising downside volatility and a failed recovery near resistance.',
  },
  HOLD: {
    label: 'HOLD',
    tone: 'neutral',
    confidence: 74,
    forecast: '+0.9%',
    risk: 'Low',
    metrics: {
      winRate: '72.4%',
      sharpe: '1.86',
      drawdown: '-8.3%',
      backtest: '+31.6%',
    },
    reason:
      'AI identified a balanced market structure with limited upside confirmation and stable risk-adjusted return.',
  },
}

function createSeries(base, signalType = 'HOLD', timeframe = '1M') {
  const frameConfig = {
    '1D': {
      labels: [
        '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
        '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
      ],
      volatility: 0.8,
    },
    '1W': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      volatility: 1.1,
    },
    '1M': {
      labels: ['W1', 'W2', 'W3', 'W4'],
      volatility: 1.6,
    },
    '6M': {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      volatility: 2.2,
    },
  }

  const config = frameConfig[timeframe]
  const labels = config.labels
  const values = []
  const signalIndex = Math.max(1, Math.floor(labels.length * 0.7))

  let price = base

  for (let i = 0; i < labels.length; i += 1) {
    const drift =
      signalType === 'BUY'
        ? 0.7
        : signalType === 'SELL'
          ? -0.62
          : 0.12

    const wave = Math.sin(i / 1.4) * config.volatility
    const pulse = Math.cos(i / 1.8) * (config.volatility * 0.45)

    price = price + drift + wave * 0.28 + pulse * 0.18
    values.push(Number(price.toFixed(2)))
  }

  return {
    labels,
    values,
    signalIndex,
    signalPoint: values[signalIndex],
  }
}

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState('NVDA')
  const [timeframe, setTimeframe] = useState('1M')
  const [signal, setSignal] = useState(signalPresets.HOLD)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [toast, setToast] = useState('')
  const [logs, setLogs] = useState([
    {
      time: '14:21:08',
      text: 'Model initialized with momentum, volatility and drawdown filters.',
    },
    {
      time: '14:22:31',
      text: 'Market simulation loaded. Awaiting AI strategy execution.',
    },
  ])

  const stock = stocks[selectedSymbol]

  const chartData = useMemo(
  () => createSeries(stock.base, signal.label, timeframe),
  [stock.base, signal.label, timeframe],
)

  const chartOption = useMemo(
    () => ({
      backgroundColor: 'transparent',
      grid: {
        top: 34,
        right: 22,
        bottom: 34,
        left: 42,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(9, 14, 27, 0.96)',
        borderColor: 'rgba(56, 189, 248, 0.25)',
        textStyle: {
          color: '#dbeafe',
        },
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: chartData.labels,
        axisLine: {
          lineStyle: {
            color: 'rgba(148, 163, 184, 0.25)',
          },
        },
        axisLabel: {
          color: '#64748b',
        },
      },
      yAxis: {
        type: 'value',
        scale: true,
        splitLine: {
          lineStyle: {
            color: 'rgba(148, 163, 184, 0.12)',
          },
        },
        axisLabel: {
          color: '#64748b',
        },
      },
      series: [
        {
          name: selectedSymbol,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          data: chartData.values,
          lineStyle: {
            width: 3,
            color: signal.label === 'SELL' ? '#ef4444' : '#22c55e',
          },
          itemStyle: {
            color: signal.label === 'SELL' ? '#ef4444' : '#22c55e',
          },
          areaStyle: {
            color:
              signal.label === 'SELL'
                ? 'rgba(239, 68, 68, 0.12)'
                : 'rgba(34, 197, 94, 0.12)',
          },
          markPoint: {
            symbolSize: 64,
            label: {
              color: '#020617',
              fontWeight: 800,
              formatter: signal.label,
            },
            data: [
              {
                name: signal.label,
                coord: [chartData.signalIndex, chartData.signalPoint],
                itemStyle: {
                  color:
                    signal.label === 'BUY'
                      ? '#22c55e'
                      : signal.label === 'SELL'
                        ? '#ef4444'
                        : '#f59e0b',
                },
              },
            ],
          },
        },
      ],
    }),
    [chartData, selectedSymbol, signal.label],
  )

  function runStrategy() {
    setIsAnalyzing(true)
    setToast('AI model analyzing market structure...')

    window.setTimeout(() => {
      const sequence = ['BUY', 'SELL', 'HOLD']
      const currentIndex = sequence.indexOf(signal.label)
      const nextSignal = signalPresets[sequence[(currentIndex + 1) % sequence.length]]

      const now = new Date()
      const time = now.toLocaleTimeString('en-US', { hour12: false })

      setSignal(nextSignal)
      setLogs((currentLogs) => [
        {
          time,
          text: `${nextSignal.label} signal generated for ${selectedSymbol}. Confidence ${nextSignal.confidence}%.`,
        },
        ...currentLogs.slice(0, 5),
      ])
      setToast(`AI ${nextSignal.label} Signal Generated`)
      setIsAnalyzing(false)

      window.setTimeout(() => {
        setToast('')
      }, 2600)
    }, 1100)
  }

  return (
    <main className="app-shell">
      <section className="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">Live Market Simulation</p>
            <h1>QuantEdge AI Strategy Dashboard</h1>
          </div>

          <div className="topbar-actions">
            <select
              value={selectedSymbol}
              onChange={(event) => setSelectedSymbol(event.target.value)}
              aria-label="Select stock symbol"
            >
              {Object.keys(stocks).map((symbol) => (
                <option key={symbol} value={symbol}>
                  {symbol}
                </option>
              ))}
            </select>

            <button onClick={runStrategy} disabled={isAnalyzing}>
              {isAnalyzing ? 'Analyzing...' : 'Run AI Strategy'}
            </button>
          </div>
        </header>

        <section className="hero-grid">
          <article className="market-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{stock.sector}</p>
                <h2>
                  {selectedSymbol}
                  <span>{stock.name}</span>
                </h2>
              </div>

              <div className="price-block">
                <strong>${stock.price}</strong>
                <span className={stock.change.includes('-') ? 'down' : 'up'}>
                  {stock.change}
                </span>
              </div>
            </div>

            <div className="timeframe-row">
              {['1D', '1W', '1M', '6M'].map((item) => (
                <button
                  key={item}
                  className={timeframe === item ? 'active' : ''}
                  onClick={() => setTimeframe(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="chart-wrap">
              <ReactECharts option={chartOption} style={{ height: 390 }} />
            </div>
          </article>

          <aside className="signal-panel">
            <p className="eyebrow">AI Strategy Indicator</p>
            <div className={`signal-badge ${signal.tone}`}>{signal.label}</div>

            <div className="confidence">
              <div>
                <span>Model Confidence</span>
                <strong>{signal.confidence}%</strong>
              </div>
              <div className="meter">
                <span style={{ width: `${signal.confidence}%` }} />
              </div>
            </div>

            <div className="mini-grid">
              <div>
                <span>Forecast Return</span>
                <strong>{signal.forecast}</strong>
              </div>
              <div>
                <span>Risk Level</span>
                <strong>{signal.risk}</strong>
              </div>
            </div>

            <div className="strategy-copy">
              <span>Strategy Reasoning</span>
              <p>{signal.reason}</p>
            </div>
          </aside>
        </section>

        <section className="metric-grid">
          <article>
            <span>Win Rate</span>
            <strong>{signal.metrics.winRate}</strong>
            <small>Rolling 90-day model</small>
          </article>
          <article>
            <span>Sharpe Ratio</span>
            <strong>{signal.metrics.sharpe}</strong>
            <small>Risk-adjusted return</small>
          </article>
          <article>
            <span>Max Drawdown</span>
            <strong>{signal.metrics.drawdown}</strong>
            <small>Backtest risk floor</small>
          </article>
          <article>
            <span>Backtest Return</span>
            <strong>{signal.metrics.backtest}</strong>
            <small>Simulated strategy P/L</small>
          </article>
        </section>

        <section className="log-panel">
          <div>
            <p className="eyebrow">Strategy Log</p>
            <h2>Real-time AI Decision Trail</h2>
          </div>

          <div className="log-list">
            {logs.map((log, index) => (
              <div key={`${log.time}-${index}`} className="log-item">
                <span>{log.time}</span>
                <p>{log.text}</p>
              </div>
            ))}
          </div>
        </section>
      </section>

      {toast && <div className="toast">{toast}</div>}
    </main>
  )
}

export default App