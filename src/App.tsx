import './App.css'

const summaryCards = [
  { label: 'Total balance', value: '$32,480', delta: '+$1,240', tone: 'positive' },
  { label: 'Monthly income', value: '$8,420', delta: '+8.4%', tone: 'positive' },
  { label: 'Monthly spending', value: '$5,420', delta: '-3.1%', tone: 'negative' },
  { label: 'Savings rate', value: '36%', delta: '+4.6 pts', tone: 'positive' },
]

const spendingTrend = [
  { month: 'Jan', value: 36 },
  { month: 'Feb', value: 48 },
  { month: 'Mar', value: 42 },
  { month: 'Apr', value: 61 },
  { month: 'May', value: 58 },
  { month: 'Jun', value: 73 },
]

const budgetCategories = [
  { name: 'Housing', spent: 1480, limit: 1800, color: 'teal' },
  { name: 'Food', spent: 760, limit: 900, color: 'blue' },
  { name: 'Transport', spent: 420, limit: 600, color: 'orange' },
  { name: 'Entertainment', spent: 390, limit: 500, color: 'pink' },
]

const transactions = [
  { merchant: 'Northwind Payroll', type: 'Income', amount: '+$2,950', date: 'Today', tone: 'positive' },
  { merchant: 'Fresh Market', type: 'Groceries', amount: '-$148', date: 'Yesterday', tone: 'negative' },
  { merchant: 'City Transport', type: 'Transit', amount: '-$64', date: 'Mon', tone: 'negative' },
  { merchant: 'Apex Studio', type: 'Subscription', amount: '-$29', date: 'Sun', tone: 'negative' },
]

const upcomingBills = [
  { name: 'Rent', due: 'Due in 3 days', amount: '$1,520' },
  { name: 'Utilities', due: 'Due in 6 days', amount: '$210' },
  { name: 'Insurance', due: 'Due in 11 days', amount: '$180' },
]

const goals = [
  { name: 'Emergency fund', value: '$8,200', target: '$10,000', progress: 82 },
  { name: 'Vacation', value: '$2,640', target: '$5,000', progress: 53 },
]

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)

function App() {
  const currentBudget = budgetCategories.reduce((sum, item) => sum + item.spent, 0)
  const totalCapacity = budgetCategories.reduce((sum, item) => sum + item.limit, 0)
  const budgetUsage = Math.round((currentBudget / totalCapacity) * 100)

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1>Funds Organizer</h1>
        </div>

        <nav className="main-nav" aria-label="Primary navigation">
          <button type="button" className="nav-link active">Overview</button>
          <button type="button" className="nav-link">Savings</button>
          <button type="button" className="nav-link">Loans</button>
          <button type="button" className="nav-link">Profits</button>
          <button type="button" className="nav-link">Data</button>
        </nav>

        <button type="button" className="primary-button">+ Add record</button>
      </header>

      <main className="dashboard">
        <section className="summary-grid" aria-label="Summary cards">
          {summaryCards.map((card) => (
            <article key={card.label} className="summary-card">
              <p>{card.label}</p>
              <h2>{card.value}</h2>
              <span className={card.tone}>{card.delta}</span>
            </article>
          ))}
        </section>

        <section className="content-grid">
          <article className="panel chart-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Cash flow</p>
                <h3>Monthly overview</h3>
              </div>
              <button type="button" className="secondary-button">This year</button>
            </div>

            <div className="chart" aria-label="Monthly spending trend">
              {spendingTrend.map((bar) => (
                <div key={bar.month} className="bar-group">
                  <div className="bar-track">
                    <div className="bar-fill" style={{ height: `${bar.value}%` }} />
                  </div>
                  <span>{bar.month}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel snapshot-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Accounts</p>
                <h3>Quick snapshot</h3>
              </div>
            </div>

            <div className="account-card accent">
              <div className="account-meta">
                <span>Primary</span>
                <strong>•••• 4829</strong>
              </div>
              <div className="account-balance">
                <small>Available</small>
                <strong>{formatCurrency(18240)}</strong>
              </div>
            </div>

            <div className="account-card muted">
              <div className="account-meta">
                <span>Savings</span>
                <strong>•••• 2198</strong>
              </div>
              <div className="account-balance">
                <small>Growth</small>
                <strong>{formatCurrency(14680)}</strong>
              </div>
            </div>
          </article>
        </section>

        <section className="detail-grid">
          <article className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Budgets</p>
                <h3>Spending plan</h3>
              </div>
              <span className="meta-pill">{budgetUsage}% used</span>
            </div>

            <div className="budget-list">
              {budgetCategories.map((category) => {
                const ratio = Math.min((category.spent / category.limit) * 100, 100)
                return (
                  <div key={category.name} className="budget-item">
                    <div className="budget-header">
                      <span>{category.name}</span>
                      <strong>
                        {formatCurrency(category.spent)} / {formatCurrency(category.limit)}
                      </strong>
                    </div>
                    <div className="progress-bar" aria-label={`${category.name} budget use`}>
                      <span className={`progress-fill ${category.color}`} style={{ width: `${ratio}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Recent</p>
                <h3>Transactions</h3>
              </div>
              <button type="button" className="secondary-button">View all</button>
            </div>

            <ul className="transaction-list">
              {transactions.map((item) => (
                <li key={`${item.merchant}-${item.date}`} className="transaction-item">
                  <div>
                    <strong>{item.merchant}</strong>
                    <small>
                      {item.type} · {item.date}
                    </small>
                  </div>
                  <span className={item.tone}>{item.amount}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="panel side-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Planning</p>
                <h3>Upcoming</h3>
              </div>
            </div>

            <ul className="bill-list">
              {upcomingBills.map((bill) => (
                <li key={bill.name} className="bill-item">
                  <div>
                    <strong>{bill.name}</strong>
                    <small>{bill.due}</small>
                  </div>
                  <span>{bill.amount}</span>
                </li>
              ))}
            </ul>

            <div className="divider" />

            <div className="goal-section">
              <h4>Goals</h4>
              {goals.map((goal) => (
                <div key={goal.name} className="goal-item">
                  <div className="goal-header">
                    <span>{goal.name}</span>
                    <strong>{goal.value}</strong>
                  </div>
                  <div className="progress-bar tiny" aria-label={`${goal.name} progress`}>
                    <span className="progress-fill blue" style={{ width: `${goal.progress}%` }} />
                  </div>
                  <small>{goal.target} target</small>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}

export default App
