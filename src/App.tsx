import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  chooseDatabaseDirectory,
  loadSavedDirectory,
  loadSavedMembers,
  readWorkbookMembers,
  saveDirectory,
  saveMembersLocally,
  supportsDatabaseFolder,
  writeWorkbookMembers,
  type DatabaseDirectoryHandle,
  type Member,
} from './database'
import './App.css'

type TabKey = 'overview' | 'savings' | 'loans' | 'profits' | 'data'
type ChartStyle = 'bar' | 'line' | 'curve'
const getMemberSavings = (member: Member) =>
  member.initialSavings
  + member.contributions.reduce((total, contribution) => total + contribution.amount, 0)
  - member.withdrawals.reduce((total, withdrawal) => total + withdrawal.amount, 0)

const summaryCards = [
  { label: 'Available funds', value: '₱32,480', delta: '+₱1,240', tone: 'positive' },
  { label: 'Total Savings', value: '₱8,420', delta: '+8.4%', tone: 'positive' },
  { label: 'Loans Proceeds', value: '₱5,420', delta: '-3.1%', tone: 'negative' },
  { label: 'Total Profits', value: '36%', delta: '+4.6 pts', tone: 'positive' },
]

const spendingTrend = [
  { month: 'Jan', value: 3600 },
  { month: 'Feb', value: 4800 },
  { month: 'Mar', value: 4200 },
  { month: 'Apr', value: 6100 },
  { month: 'May', value: 5800 },
  { month: 'Jun', value: 7300 },
  { month: 'Jul', value: 6700 },
  { month: 'Aug', value: 7800 },
  { month: 'Sep', value: 6400 },
  { month: 'Oct', value: 8200 },
  { month: 'Nov', value: 7500 },
  { month: 'Dec', value: 9100 },
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

const chartStyles: Array<{ value: ChartStyle; label: string }> = [
  { value: 'bar', label: 'Bars' },
  { value: 'line', label: 'Line' },
  { value: 'curve', label: 'Curve' },
]

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(amount)

const getLocalDate = () => {
  const date = new Date()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 10)
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
    .format(new Date(`${date}T00:00:00`))

const currentYear = new Date().getFullYear()

function OverviewPage({ totalSavings }: { totalSavings: number }) {
  const [chartStyle, setChartStyle] = useState<ChartStyle>('bar')
  const [isChartStyleMenuOpen, setIsChartStyleMenuOpen] = useState(false)
  const currentBudget = budgetCategories.reduce((sum, item) => sum + item.spent, 0)
  const totalCapacity = budgetCategories.reduce((sum, item) => sum + item.limit, 0)
  const budgetUsage = Math.round((currentBudget / totalCapacity) * 100)
  const maxMonthlyProfit = Math.max(...spendingTrend.map((bar) => bar.value))
  const chartPoints = spendingTrend.map((bar, index) => ({
    x: 20 + (index / (spendingTrend.length - 1)) * 1060,
    y: 90 - (bar.value / maxMonthlyProfit) * 76,
  }))
  const chartPath = chartPoints.slice(1).reduce((path, point, index) => {
    const previous = chartPoints[index]
    if (chartStyle === 'line') return `${path} L ${point.x} ${point.y}`
    const controlOffset = (point.x - previous.x) / 3
    return `${path} C ${previous.x + controlOffset} ${previous.y} ${point.x - controlOffset} ${point.y} ${point.x} ${point.y}`
  }, `M ${chartPoints[0].x} ${chartPoints[0].y}`)
  const selectedChartStyle = chartStyles.find((style) => style.value === chartStyle)!

  return (
    <main className="dashboard">
      <section className="summary-grid" aria-label="Summary cards">
        {summaryCards.map((card) => (
          <article key={card.label} className="summary-card">
            <p>{card.label}</p>
            <h2>{card.label === 'Total Savings' ? formatCurrency(totalSavings) : card.value}</h2>
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

          <div className={`chart chart-${chartStyle}`} aria-label="Monthly profit trend">
            {chartStyle === 'bar' ? (
              spendingTrend.map((bar) => (
                <div key={bar.month} className="bar-group">
                  <div
                    className="bar-track"
                    role="img"
                    aria-label={`${bar.month}: ${formatCurrency(bar.value)} profit`}
                    tabIndex={0}
                  >
                    <div
                      className="bar-fill"
                      data-value={formatCurrency(bar.value)}
                      style={{ height: `${(bar.value / maxMonthlyProfit) * 100}%` }}
                    />
                  </div>
                  <span>{bar.month}</span>
                </div>
              ))
            ) : (
              <>
                <div className="chart-plot">
                  <svg className="chart-line-svg" viewBox="0 0 1100 100" preserveAspectRatio="none" aria-hidden="true">
                    <path className="chart-line-path" d={chartPath} />
                    {chartPoints.map((point, index) => (
                      <circle key={spendingTrend[index].month} className="chart-line-dot" cx={point.x} cy={point.y} r="5" />
                    ))}
                  </svg>
                  {spendingTrend.map((bar, index) => (
                    <div
                      key={bar.month}
                      className="chart-point"
                      role="img"
                      aria-label={`${bar.month}: ${formatCurrency(bar.value)} profit`}
                      data-value={formatCurrency(bar.value)}
                      style={{
                        left: `${(index / (spendingTrend.length - 1)) * 100}%`,
                        bottom: `${5 + (bar.value / maxMonthlyProfit) * 80}%`,
                      }}
                      tabIndex={0}
                    />
                  ))}
                </div>
                <div className="chart-months" aria-hidden="true">
                  {spendingTrend.map((bar) => <span key={bar.month}>{bar.month}</span>)}
                </div>
              </>
            )}
          </div>

          <div
            className="chart-style-control"
            onKeyDown={(event) => {
              if (event.key === 'Escape') setIsChartStyleMenuOpen(false)
            }}
          >
            <button
              type="button"
              className="chart-style-button"
              aria-haspopup="true"
              aria-expanded={isChartStyleMenuOpen}
              aria-label={`Graph style: ${selectedChartStyle.label}`}
              onClick={() => setIsChartStyleMenuOpen((isOpen) => !isOpen)}
            >
              <span>Graph style: {selectedChartStyle.label}</span>
              <span className="chart-style-chevron" aria-hidden="true" />
            </button>
            {isChartStyleMenuOpen && (
              <div className="chart-style-menu" role="group" aria-label="Graph style">
                {chartStyles.map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    className={chartStyle === style.value ? 'selected' : ''}
                    aria-pressed={chartStyle === style.value}
                    onClick={() => {
                      setChartStyle(style.value)
                      setIsChartStyleMenuOpen(false)
                    }}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            )}
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
  onAddSavings: (memberName: string, amount: number, date: string) => void
  onPullOutSavings: (memberName: string, amount: number, date: string, reason: string) => void
}

function SavingsPage({
  members,
  selectedMember,
  onMemberChange,
  onAddMember,
  onAddSavings,
  onPullOutSavings,
}: SavingsPageProps) {
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [memberName, setMemberName] = useState('')
  const [initialSavings, setInitialSavings] = useState('')
  const [initialSavingsDate, setInitialSavingsDate] = useState(getLocalDate)
  const [memberError, setMemberError] = useState('')
  const [savingsMember, setSavingsMember] = useState('')
  const [savingsAmount, setSavingsAmount] = useState('')
  const [savingsDate, setSavingsDate] = useState(getLocalDate)
  const [savingsError, setSavingsError] = useState('')
  const [withdrawalMember, setWithdrawalMember] = useState('')
  const [withdrawalAmount, setWithdrawalAmount] = useState('')
  const [withdrawalDate, setWithdrawalDate] = useState(getLocalDate)
  const [withdrawalReason, setWithdrawalReason] = useState('')
  const [withdrawalError, setWithdrawalError] = useState('')
  const selectedWithdrawalMember = members.find((member) =>
    member.name === (withdrawalMember || (selectedMember !== 'all' ? selectedMember : '')),
  )
  const parsedWithdrawalAmount = Number(withdrawalAmount)
  const withdrawalFee = Number.isFinite(parsedWithdrawalAmount) && parsedWithdrawalAmount > 0
    ? parsedWithdrawalAmount * 0.1
    : 0

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

    if (!initialSavingsDate) {
      setMemberError('Choose a date for the initial savings.')
      return
    }

    onAddMember({
      name,
      initialSavings: savings,
      initialSavingsDate,
      contributions: [],
      withdrawals: [],
    })
    setMemberName('')
    setInitialSavings('')
    setInitialSavingsDate(getLocalDate())
    setMemberError('')
    setIsAddingMember(false)
  }

  const handleAddSavings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const memberName = savingsMember || (selectedMember !== 'all' ? selectedMember : '')
    const amount = Number(savingsAmount)

    if (!members.some((member) => member.name === memberName)) {
      setSavingsError('Select a member to add savings to.')
      return
    }

    if (savingsAmount === '' || !Number.isFinite(amount) || amount <= 0) {
      setSavingsError('Enter a savings amount greater than zero.')
      return
    }

    if (!savingsDate) {
      setSavingsError('Choose a date for this savings entry.')
      return
    }

    onAddSavings(memberName, amount, savingsDate)
    setSavingsAmount('')
    setSavingsDate(getLocalDate())
    setSavingsError('')
  }

  const handlePullOutSavings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const memberName = withdrawalMember || (selectedMember !== 'all' ? selectedMember : '')
    const amount = Number(withdrawalAmount)
    const member = members.find((entry) => entry.name === memberName)

    if (!member) {
      setWithdrawalError('Select a member to pull savings from.')
      return
    }

    if (withdrawalAmount === '' || !Number.isFinite(amount) || amount <= 0) {
      setWithdrawalError('Enter a pull-out amount greater than zero.')
      return
    }

    if (amount > getMemberSavings(member)) {
      setWithdrawalError('The pull-out amount cannot exceed this member’s savings.')
      return
    }

    if (!withdrawalDate || !withdrawalReason.trim()) {
      setWithdrawalError('Enter a date and reason for the pull-out.')
      return
    }

    onPullOutSavings(memberName, amount, withdrawalDate, withdrawalReason.trim())
    setWithdrawalAmount('')
    setWithdrawalDate(getLocalDate())
    setWithdrawalReason('')
    setWithdrawalError('')
  }

  const displayedInitialSavings = members
    .filter((member) => selectedMember === 'all' || member.name === selectedMember)
    .reduce((total, member) => total + getMemberSavings(member), 0)
  const selectedMemberDetails = members.find((member) => member.name === selectedMember)
  const totalSavings = members.reduce((total, member) => total + getMemberSavings(member), 0)
  const savingsHistory: Array<{
    id: string
    member: string
    type: string
    amount: number
    date: string
    reason?: string
    fee?: number
  }> = members
    .filter((member) => selectedMember === 'all' || member.name === selectedMember)
    .flatMap((member) => [
      {
        id: `${member.name}-initial`,
        member: member.name,
        type: 'Initial savings',
        amount: member.initialSavings,
        date: member.initialSavingsDate,
      },
      ...member.contributions.map((contribution, index) => ({
        id: `${member.name}-contribution-${index}`,
        member: member.name,
        type: 'Added savings',
        amount: contribution.amount,
        date: contribution.date,
      })),
      ...member.withdrawals.map((withdrawal, index) => ({
        id: `${member.name}-withdrawal-${index}`,
        member: member.name,
        type: 'Pull out savings',
        amount: -withdrawal.amount,
        date: withdrawal.date,
        reason: withdrawal.reason,
        fee: withdrawal.amount * 0.1,
      })),
    ])
    .sort((first, second) => second.date.localeCompare(first.date))

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
          <label>
            Initial savings date
            <input
              id="initial-savings-date"
              type="date"
              required
              value={initialSavingsDate}
              onChange={(event) => {
                setInitialSavingsDate(event.target.value)
                setMemberError('')
              }}
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
            <span>{selectedMemberDetails?.name ?? 'Total savings'}</span>
            <strong>{formatCurrency(selectedMemberDetails ? getMemberSavings(selectedMemberDetails) : totalSavings)}</strong>
          </div>
          <small>{selectedMemberDetails ? 'Current savings' : 'Combined savings across all members'}</small>
          {selectedMemberDetails && (
            <div className="total-savings-summary">
              <span>All members total</span>
              <strong>{formatCurrency(totalSavings)}</strong>
            </div>
          )}
        </article>
        {savingsPlans.map((goal) => (
          <article
            key={goal.name}
            className={`panel stat-panel ${goal.name === 'Home down payment' ? 'member-savings-card' : ''}`}
          >
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
            {goal.name === 'Home down payment' && (
              <div className="member-savings-actions">
                <form className="add-savings-form" noValidate onSubmit={handleAddSavings}>
                <label>
                  Member
                  <select
                    value={savingsMember || (selectedMember !== 'all' ? selectedMember : '')}
                    onChange={(event) => {
                      setSavingsMember(event.target.value)
                      setSavingsError('')
                    }}
                  >
                    <option value="">Select a member</option>
                    {members.map((member) => (
                      <option key={member.name} value={member.name}>{member.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Amount (PHP)
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={savingsAmount}
                    onChange={(event) => {
                      setSavingsAmount(event.target.value)
                      setSavingsError('')
                    }}
                    placeholder="0"
                  />
                </label>
                <label>
                  Date
                  <input
                    type="date"
                    required
                    value={savingsDate}
                    onChange={(event) => {
                      setSavingsDate(event.target.value)
                      setSavingsError('')
                    }}
                  />
                </label>
                <button type="submit" className="primary-button" disabled={members.length === 0}>
                  Add savings
                </button>
                {savingsError && <p className="member-error" role="alert">{savingsError}</p>}
                </form>
              </div>
            )}
          </article>
        ))}
        <article className="panel stat-panel pull-out-card">
          <div>
            <p className="eyebrow">Withdrawal</p>
            <h3>Pull out savings</h3>
          </div>
          <form className="pull-out-form" noValidate onSubmit={handlePullOutSavings}>
            <label>
              Member
              <select
                value={withdrawalMember || (selectedMember !== 'all' ? selectedMember : '')}
                onChange={(event) => {
                  setWithdrawalMember(event.target.value)
                  setWithdrawalError('')
                }}
              >
                <option value="">Select a member</option>
                {members.map((member) => (
                  <option key={member.name} value={member.name}>{member.name}</option>
                ))}
              </select>
            </label>
            <label>
              Amount (PHP)
              <input
                type="number"
                min="0"
                step="any"
                value={withdrawalAmount}
                onChange={(event) => {
                  setWithdrawalAmount(event.target.value)
                  setWithdrawalError('')
                }}
                placeholder="0"
              />
            </label>
            <label>
              Date
              <input
                type="date"
                required
                value={withdrawalDate}
                onChange={(event) => {
                  setWithdrawalDate(event.target.value)
                  setWithdrawalError('')
                }}
              />
            </label>
            <label>
              Reason
              <input
                type="text"
                value={withdrawalReason}
                onChange={(event) => {
                  setWithdrawalReason(event.target.value)
                  setWithdrawalError('')
                }}
                placeholder="Reason for pull-out"
              />
            </label>
            <div className="withdrawal-summary">
              <span>10% deduction: {formatCurrency(withdrawalFee)}</span>
              <strong>
                Payout: {formatCurrency(Math.max(parsedWithdrawalAmount - withdrawalFee, 0))}
              </strong>
              {selectedWithdrawalMember && (
                <small>Available: {formatCurrency(getMemberSavings(selectedWithdrawalMember))}</small>
              )}
            </div>
            <button type="submit" className="secondary-button" disabled={members.length === 0}>
              Pull out savings
            </button>
            {withdrawalError && <p className="member-error" role="alert">{withdrawalError}</p>}
          </form>
        </article>
      </section>

      <section className="panel full-width-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Savings History</p>
            <h3>Savings transactions</h3>
          </div>
        </div>
        {savingsHistory.length > 0 ? (
          <ul className="transaction-list savings-history-list">
            {savingsHistory.map((transaction) => (
              <li key={transaction.id} className="transaction-item">
                <div>
                  <strong>{transaction.type} · {transaction.member}</strong>
                  <small>
                    {formatDate(transaction.date)}
                    {transaction.reason && ` · ${transaction.reason}`}
                    {transaction.fee !== undefined && ` · 10% fee: ${formatCurrency(transaction.fee)}`}
                  </small>
                </div>
                <span className={transaction.amount < 0 ? 'negative' : 'positive'}>
                  {transaction.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="savings-history-empty">No savings transactions for this selection yet.</p>
        )}
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

type DataPageProps = {
  databaseMessage: string
  isDatabaseConnecting: boolean
  canChooseDatabaseFolder: boolean
  onChooseDatabaseFolder: () => void
}

function DataPage({
  databaseMessage,
  isDatabaseConnecting,
  canChooseDatabaseFolder,
  onChooseDatabaseFolder,
}: DataPageProps) {
  return (
    <main className="page-view">
      <section className="page-header">
        <div>
          <p className="eyebrow">Data</p>
          <h2>Financial insights</h2>
          <p className="database-status" role="status">{databaseMessage}</p>
        </div>
        <button
          type="button"
          className="primary-button"
          disabled={isDatabaseConnecting || !canChooseDatabaseFolder}
          onClick={onChooseDatabaseFolder}
        >
          {isDatabaseConnecting ? 'Connecting…' : 'Choose database folder'}
        </button>
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
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [members, setMembers] = useState<Member[]>(loadSavedMembers)
  const [selectedMember, setSelectedMember] = useState('all')
  const [databaseMessage, setDatabaseMessage] = useState('Loading saved data…')
  const [isDatabaseConnecting, setIsDatabaseConnecting] = useState(false)
  const [canChooseDatabaseFolder, setCanChooseDatabaseFolder] = useState(supportsDatabaseFolder)
  const databaseDirectory = useRef<DatabaseDirectoryHandle | null>(null)
  const initialMembers = useRef(members)
  const totalSavings = members.reduce((total, member) => total + getMemberSavings(member), 0)

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light'
  }, [isDarkMode])

  useEffect(() => {
    let isActive = true

    const restoreDatabase = async () => {
      if (!supportsDatabaseFolder()) {
        setCanChooseDatabaseFolder(false)
        setDatabaseMessage('Your data is saved on this device. Folder-based Excel sync requires Chrome or Edge.')
        return
      }

      try {
        const directory = await loadSavedDirectory()
        if (!isActive) return
        if (!directory) {
          setDatabaseMessage('Your data is saved on this device. Choose a folder to create an Excel database.')
          return
        }

        databaseDirectory.current = directory
        const permission = await directory.queryPermission({ mode: 'readwrite' })
        if (!isActive) return
        if (permission !== 'granted') {
          setDatabaseMessage(`Excel database folder: ${directory.name}. Select the folder again to reconnect.`)
          return
        }

        const workbookMembers = await readWorkbookMembers(directory)
        if (!isActive) return
        if (workbookMembers) {
          setMembers(workbookMembers)
        } else {
          await writeWorkbookMembers(directory, initialMembers.current)
        }
        setDatabaseMessage(`Excel database connected: ${directory.name}`)
      } catch (error) {
        if (!isActive) return
        setDatabaseMessage(`Saved data is safe on this device. Excel database could not be opened: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    void restoreDatabase()
    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    saveMembersLocally(members)
    const directory = databaseDirectory.current
    if (!directory) return

    let isActive = true
    setDatabaseMessage(`Saving Excel database: ${directory.name}…`)
    void writeWorkbookMembers(directory, members)
      .then(() => {
        if (isActive) setDatabaseMessage(`Excel database connected: ${directory.name}`)
      })
      .catch((error: unknown) => {
        if (isActive) {
          setDatabaseMessage(`Saved data is safe on this device. Excel sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      })

    return () => {
      isActive = false
    }
  }, [members])

  const handleChooseDatabaseFolder = async () => {
    setIsDatabaseConnecting(true)
    try {
      let directory = databaseDirectory.current
      if (directory) {
        const permission = await directory.requestPermission({ mode: 'readwrite' })
        if (permission !== 'granted') throw new Error('Permission to write to the selected folder was not granted.')
      } else {
        directory = await chooseDatabaseDirectory()
      }

      databaseDirectory.current = directory
      await saveDirectory(directory)
      const workbookMembers = await readWorkbookMembers(directory)
      if (workbookMembers) {
        setMembers(workbookMembers)
      } else {
        await writeWorkbookMembers(directory, members)
      }
      setDatabaseMessage(`Excel database connected: ${directory.name}`)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setDatabaseMessage('Folder selection cancelled. Your data remains saved on this device.')
      } else {
        setDatabaseMessage(`Saved data is safe on this device. Excel database could not be connected: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } finally {
      setIsDatabaseConnecting(false)
    }
  }

  const addMember = (member: Member) => {
    setMembers((currentMembers) => [...currentMembers, member])
    setSelectedMember(member.name)
  }

  const addSavings = (memberName: string, amount: number, date: string) => {
    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.name === memberName
          ? { ...member, contributions: [...member.contributions, { amount, date }] }
          : member,
      ),
    )
  }

  const pullOutSavings = (memberName: string, amount: number, date: string, reason: string) => {
    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.name === memberName
          ? { ...member, withdrawals: [...member.withdrawals, { amount, date, reason }] }
          : member,
      ),
    )
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
            onAddSavings={addSavings}
            onPullOutSavings={pullOutSavings}
          />
        )
      case 'loans':
        return <LoansPage />
      case 'profits':
        return <ProfitsPage />
      case 'data':
        return (
          <DataPage
            databaseMessage={databaseMessage}
            isDatabaseConnecting={isDatabaseConnecting}
            canChooseDatabaseFolder={canChooseDatabaseFolder}
            onChooseDatabaseFolder={handleChooseDatabaseFolder}
          />
        )
      case 'overview':
      default:
        return <OverviewPage totalSavings={totalSavings} />
    }
  }

  return (
    <div className="app-shell" data-theme={isDarkMode ? 'dark' : 'light'}>
      <button
        type="button"
        className="theme-toggle"
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        onClick={() => setIsDarkMode((currentMode) => !currentMode)}
      >
        <span aria-hidden="true">{isDarkMode ? '☼' : '☾'}</span>
      </button>
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

      </header>

      {renderPage()}
    </div>
  )
}

export default App
