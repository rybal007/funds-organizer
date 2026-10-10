import { useState, type FormEvent } from 'react'
import './App.css'

type TabKey = 'overview' | 'savings' | 'loans' | 'profits' | 'data'
type Member = { name: string; initialSavings: number }

const summaryCards = [
  { label: 'Available funds', value: '₱32,480', delta: '+₱1,240', tone: 'positive' },
  { label: 'Total Savings', value: '₱8,420', delta: '+8.4%', tone: 'positive' },
  { label: 'Loans Proceeds', value: '₱5,420', delta: '-3.1%', tone: 'negative' },
  { label: 'Total Profits', value: '36%', delta: '+4.6 pts', tone: 'positive' },
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
  { merchant: 'Northwind Payroll', type: 'Income', amount: '+₱2,950', date: 'Today', tone: 'positive' },
  { merchant: 'Fresh Market', type: 'Groceries', amount: '-₱148', date: 'Yesterday', tone: 'negative' },
  { merchant: 'City Transport', type: 'Transit', amount: '-₱64', date: 'Mon', tone: 'negative' },
  { merchant: 'Apex Studio', type: 'Subscription', amount: '-₱29', date: 'Sun', tone: 'negative' },
]

const upcomingBills = [
  { name: 'Rent', due: 'Due in 3 days', amount: '₱1,520' },
  { name: 'Utilities', due: 'Due in 6 days', amount: '₱210' },
  { name: 'Insurance', due: 'Due in 11 days', amount: '₱180' },
]

const goals = [
  { name: 'Emergency fund', value: '₱8,200', target: '₱10,000', progress: 82 },
  { name: 'Vacation', value: '₱2,640', target: '₱5,000', progress: 53 },
]

const homeDownPaymentTarget = 30000

const savingsPlans = [
  { name: 'Home down payment', value: '₱15,600', target: '₱30,000', rate: 52 },
  { name: 'Travel reserve', value: '₱2,640', target: '₱5,000', rate: 53 },
]

const loanOverview = [
  { name: 'Mortgage', balance: '₱184,500', rate: '4.2%', payment: '₱1,280' },
  { name: 'Car loan', balance: '₱12,400', rate: '3.6%', payment: '₱410' },
  { name: 'Student loan', balance: '₱8,200', rate: '2.9%', payment: '₱220' },
]

const profitsData = [
  { label: 'Net profit', value: '₱11,240', tone: 'positive' },
  { label: 'YTD margin', value: '23.8%', tone: 'positive' },
  { label: 'Capital gains', value: '₱2,960', tone: 'positive' },
  { label: 'Operating costs', value: '₱7,540', tone: 'negative' },
]

const dataBreakdown = [
  { label: 'Housing', value: '29%' },
  { label: 'Food', value: '18%' },
  { label: 'Transport', value: '11%' },
  { label: 'Investments', value: '24%' },
  { label: 'Other', value: '18%' },
]

const tabs: Array<{ id: TabKey; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'savings', label: 'Savings' },
  { id: 'loans', label: 'Loans' },
  { id: 'profits', label: 'Profits' },
  { id: 'data', label: 'Data' },
]

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(amount)

const currentYear = new Date().getFullYear()

function OverviewPage() {
  const currentBudget = budgetCategories.reduce((sum, item) => sum + item.spent, 0)
  const totalCapacity = budgetCategories.reduce((sum, item) => sum + item.limit, 0)
  const budgetUsage = Math.round((currentBudget / totalCapacity) * 100)

  return (
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
              <p className="eyebrow">PROFIT</p>
              <h3>Monthly Profit</h3>
            </div>
            <button type="button" className="secondary-button">{currentYear}</button>
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
              <p className="eyebrow">Announcements</p>
              <h3>New Update</h3>
            </div>
          </div>

          <div className="account-card accent">
            <div className="account-meta">
              <span>Budget note</span>
              <strong>New</strong>
            </div>
            <div className="account-balance">
              <small>Focus</small>
              <strong>{formatCurrency(18240)}</strong>
            </div>
          </div>

          <div className="account-card muted">
            <div className="account-meta">
              <span>Goal check</span>
              <strong>On track</strong>
            </div>
            <div className="account-balance">
              <small>Saved this month</small>
              <strong>{formatCurrency(14680)}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="detail-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Recent</p>
              <h3>Transactions</h3>
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
              <p className="eyebrow">CASH-IN</p>
              <h3>Transactions</h3>
            </div>
            <span className="meta-pill">Last 7 days</span>
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
              <p className="eyebrow">CASH-OUT</p>
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
  )
}

type SavingsPageProps = {
  members: Member[]
  selectedMember: string
  onMemberChange: (member: string) => void
  onAddMember: (member: Member) => void
}

function SavingsPage({ members, selectedMember, onMemberChange, onAddMember }: SavingsPageProps) {
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [memberName, setMemberName] = useState('')
  const [initialSavings, setInitialSavings] = useState('')
  const [memberError, setMemberError] = useState('')

  const handleAddMember = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = memberName.trim()
    const savings = Number(initialSavings)

    if (!name) {
      setMemberError('Enter a member name.')
      return
    }

    if (name.toLowerCase() === 'all' || members.some((member) => member.name.toLowerCase() === name.toLowerCase())) {
      setMemberError('Choose a unique member name other than All.')
      return
    }

    if (initialSavings === '' || !Number.isFinite(savings) || savings < 0) {
      setMemberError('Enter an initial savings amount of zero or more.')
      return
    }

    onAddMember({ name, initialSavings: savings })
    setMemberName('')
    setInitialSavings('')
    setMemberError('')
    setIsAddingMember(false)
  }

  const displayedInitialSavings = members
    .filter((member) => selectedMember === 'all' || member.name === selectedMember)
    .reduce((total, member) => total + member.initialSavings, 0)
  const totalSavings = members.reduce((total, member) => total + member.initialSavings, 0)

  return (
    <main className="page-view">
      <section className="page-header">
        <div>
          <p className="eyebrow">Savings</p>
          <h2>Growth tracker</h2>
        </div>
        <div className="member-controls">
          <label className="member-select-label">
            Member
            <select
              value={selectedMember}
              onChange={(event) => onMemberChange(event.target.value)}
            >
              <option value="all">All</option>
              {members.map((member) => (
                <option key={member.name} value={member.name}>{member.name}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setIsAddingMember((isAdding) => !isAdding)
              setMemberError('')
            }}
          >
            Add members
          </button>
        </div>
      </section>

      {isAddingMember && (
        <form className="add-member-form" noValidate onSubmit={handleAddMember}>
          <label>
            Member name
            <input
              id="new-member-name"
              value={memberName}
              onChange={(event) => {
                setMemberName(event.target.value)
                setMemberError('')
              }}
              placeholder="Enter a name"
              autoFocus
            />
          </label>
          <label>
            Initial savings (PHP)
            <input
              id="initial-savings"
              type="number"
              min="0"
              step="any"
              required
              value={initialSavings}
              onChange={(event) => {
                setInitialSavings(event.target.value)
                setMemberError('')
              }}
              placeholder="0"
            />
          </label>
          <button type="submit" className="secondary-button">Add member</button>
          <button type="button" className="secondary-button" onClick={() => setIsAddingMember(false)}>
            Cancel
          </button>
          {memberError && <p className="member-error" role="alert">{memberError}</p>}
        </form>
      )}

      <section className="card-grid">
        <article className="panel stat-panel total-savings-card">
          <div className="mini-header">
            <span>Total savings</span>
            <strong>{formatCurrency(totalSavings)}</strong>
          </div>
          <small>Combined savings across all members</small>
        </article>
        {savingsPlans.map((goal) => (
          <article key={goal.name} className="panel stat-panel">
            <div className="mini-header">
              <span>{goal.name === 'Home down payment' ? 'Member Savings' : goal.name}</span>
              <strong>
                {goal.name === 'Home down payment' ? formatCurrency(displayedInitialSavings) : goal.value}
              </strong>
            </div>
            <div className="progress-bar" aria-label={`${goal.name} progress`}>
              <span
                className="progress-fill teal"
                style={{
                  width: `${goal.name === 'Home down payment'
                    ? Math.min((displayedInitialSavings / homeDownPaymentTarget) * 100, 100)
                    : goal.rate}%`,
                }}
              />
            </div>
            <small>{goal.target} target</small>
          </article>
        ))}
      </section>

      <section className="panel full-width-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Strategy</p>
            <h3>Monthly contributions</h3>
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-box">
            <span>Cash savings</span>
            <strong>₱9,840</strong>
          </div>
          <div className="stat-box">
            <span>Investments</span>
            <strong>₱14,200</strong>
          </div>
          <div className="stat-box">
            <span>Auto-save</span>
            <strong>₱640 / month</strong>
          </div>
        </div>
      </section>
    </main>
  )
}

function LoansPage() {
  return (
    <main className="page-view">
      <section className="page-header">
        <div>
          <p className="eyebrow">Loans</p>
          <h2>Debt overview</h2>
        </div>
        <button type="button" className="secondary-button">Pay schedule</button>
      </section>

      <section className="card-grid">
        {loanOverview.map((loan) => (
          <article key={loan.name} className="panel stat-panel">
            <div className="mini-header">
              <span>{loan.name}</span>
              <strong>{loan.balance}</strong>
            </div>
            <div className="info-row">
              <small>Rate</small>
              <span>{loan.rate}</span>
            </div>
            <div className="info-row">
              <small>Monthly payment</small>
              <span>{loan.payment}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="panel full-width-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Projection</p>
            <h3>Debt payoff timing</h3>
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-box">
            <span>Total debt</span>
            <strong>₱205,100</strong>
          </div>
          <div className="stat-box">
            <span>Interest saved</span>
            <strong>₱4,820</strong>
          </div>
          <div className="stat-box">
            <span>Payoff date</span>
            <strong>2029-07</strong>
          </div>
        </div>
      </section>
    </main>
  )
}

function ProfitsPage() {
  return (
    <main className="page-view">
      <section className="page-header">
        <div>
          <p className="eyebrow">Profits</p>
          <h2>Performance summary</h2>
        </div>
      </section>

      <section className="summary-grid">
        {profitsData.map((item) => (
          <article key={item.label} className="summary-card">
            <p>{item.label}</p>
            <h2>{item.value}</h2>
            <span className={item.tone}>vs last month</span>
          </article>
        ))}
      </section>

      <section className="panel full-width-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Earnings</p>
            <h3>Revenue mix</h3>
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-box">
            <span>Salary</span>
            <strong>₱42,400</strong>
          </div>
          <div className="stat-box">
            <span>Investments</span>
            <strong>₱13,600</strong>
          </div>
          <div className="stat-box">
            <span>Side income</span>
            <strong>₱7,900</strong>
          </div>
        </div>
      </section>
    </main>
  )
}

function DataPage() {
  return (
    <main className="page-view">
      <section className="page-header">
        <div>
          <p className="eyebrow">Data</p>
          <h2>Financial insights</h2>
        </div>
        <button type="button" className="primary-button">Export report</button>
      </section>

      <section className="card-grid">
        {dataBreakdown.map((entry) => (
          <article key={entry.label} className="panel stat-panel">
            <div className="mini-header">
              <span>{entry.label}</span>
              <strong>{entry.value}</strong>
            </div>
            <div className="progress-bar">
              <span className="progress-fill blue" style={{ width: entry.value }} />
            </div>
          </article>
        ))}
      </section>

      <section className="panel full-width-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Sync</p>
            <h3>Connected sources</h3>
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-box">
            <span>Bank accounts</span>
            <strong>4 linked</strong>
          </div>
          <div className="stat-box">
            <span>Cards</span>
            <strong>3 active</strong>
          </div>
          <div className="stat-box">
            <span>Data freshness</span>
            <strong>Updated 4 min ago</strong>
          </div>
        </div>
      </section>
    </main>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [members, setMembers] = useState<Member[]>([])
  const [selectedMember, setSelectedMember] = useState('all')

  const addMember = (member: Member) => {
    setMembers((currentMembers) => [...currentMembers, member])
    setSelectedMember(member.name)
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'savings':
        return (
          <SavingsPage
            members={members}
            selectedMember={selectedMember}
            onMemberChange={setSelectedMember}
            onAddMember={addMember}
          />
        )
      case 'loans':
        return <LoansPage />
      case 'profits':
        return <ProfitsPage />
      case 'data':
        return <DataPage />
      case 'overview':
      default:
        return <OverviewPage />
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1>Savings</h1>
        </div>

        <nav className="main-nav" aria-label="Primary navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab !== 'overview' && (
          <button type="button" className="primary-button">+ Add record</button>
        )}
      </header>

      {renderPage()}
    </div>
  )
}

export default App
