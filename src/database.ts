import type ExcelJS from 'exceljs'

export type SavingsContribution = { amount: number; date: string }
export type SavingsWithdrawal = { amount: number; date: string; reason: string }
export type Member = {
  name: string
  initialSavings: number
  initialSavingsDate: string
  contributions: SavingsContribution[]
  withdrawals: SavingsWithdrawal[]
}

export type DirectoryPermission = 'granted' | 'denied' | 'prompt'
export type DatabaseFileHandle = {
  getFile: () => Promise<File>
  createWritable: () => Promise<{ write: (data: Blob | ArrayBuffer | ArrayBufferView) => Promise<void>; close: () => Promise<void> }>
}
export type DatabaseDirectoryHandle = {
  name: string
  queryPermission: (options: { mode: 'readwrite' }) => Promise<DirectoryPermission>
  requestPermission: (options: { mode: 'readwrite' }) => Promise<DirectoryPermission>
  getFileHandle: (name: string, options?: { create?: boolean }) => Promise<DatabaseFileHandle>
}

const LOCAL_STORAGE_KEY = 'funds-organizer-members-v1'
const DATABASE_FILE_NAME = 'funds-organizer-database.xlsx'
const DIRECTORY_DATABASE_NAME = 'funds-organizer-directory'
const DIRECTORY_STORE_NAME = 'settings'
const DIRECTORY_HANDLE_KEY = 'database-folder'

type DirectoryPickerWindow = Window & {
  showDirectoryPicker?: (options: { mode: 'readwrite' }) => Promise<DatabaseDirectoryHandle>
}

export const supportsDatabaseFolder = () =>
  typeof (window as DirectoryPickerWindow).showDirectoryPicker === 'function'

export const loadSavedMembers = (): Member[] => {
  try {
    const savedMembers = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!savedMembers) return []
    const parsed: unknown = JSON.parse(savedMembers)
    return Array.isArray(parsed) ? parsed as Member[] : []
  } catch {
    return []
  }
}

export const saveMembersLocally = (members: Member[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(members))
  } catch {
    // Keep the application usable when browser storage is unavailable.
  }
}

const openDirectoryDatabase = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(DIRECTORY_DATABASE_NAME, 1)
  request.onupgradeneeded = () => {
    request.result.createObjectStore(DIRECTORY_STORE_NAME)
  }
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error ?? new Error('Could not open saved folder settings.'))
})

export const loadSavedDirectory = async (): Promise<DatabaseDirectoryHandle | null> => {
  const database = await openDirectoryDatabase()
  return new Promise((resolve, reject) => {
    const request = database
      .transaction(DIRECTORY_STORE_NAME, 'readonly')
      .objectStore(DIRECTORY_STORE_NAME)
      .get(DIRECTORY_HANDLE_KEY)
    request.onsuccess = () => resolve((request.result as DatabaseDirectoryHandle | undefined) ?? null)
    request.onerror = () => reject(request.error ?? new Error('Could not read saved folder settings.'))
  })
}

export const saveDirectory = async (directory: DatabaseDirectoryHandle) => {
  const database = await openDirectoryDatabase()
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(DIRECTORY_STORE_NAME, 'readwrite')
    transaction.objectStore(DIRECTORY_STORE_NAME).put(directory, DIRECTORY_HANDLE_KEY)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error('Could not save the database folder.'))
    transaction.onabort = () => reject(transaction.error ?? new Error('Could not save the database folder.'))
  })
}

export const chooseDatabaseDirectory = async () => {
  const picker = (window as DirectoryPickerWindow).showDirectoryPicker
  if (!picker) throw new Error('Folder selection is supported in current versions of Chrome and Edge.')
  return picker({ mode: 'readwrite' })
}

const getCellDate = (value: ExcelJS.CellValue): string => {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value ?? '').trim()
}

const getCellNumber = (value: ExcelJS.CellValue, context: string): number => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) throw new Error(`Invalid amount in the Excel database (${context}).`)
  return amount
}

export const readWorkbookMembers = async (directory: DatabaseDirectoryHandle): Promise<Member[] | null> => {
  const ExcelJS = (await import('exceljs')).default
  let fileHandle: DatabaseFileHandle
  try {
    fileHandle = await directory.getFileHandle(DATABASE_FILE_NAME)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotFoundError') return null
    throw error
  }

  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(await (await fileHandle.getFile()).arrayBuffer())
  const membersSheet = workbook.getWorksheet('Members')
  if (!membersSheet) throw new Error('The selected folder contains an Excel file without a Members sheet.')

  const members = new Map<string, Member>()
  membersSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const name = String(row.getCell(1).value ?? '').trim()
    if (!name) return
    members.set(name, {
      name,
      initialSavings: getCellNumber(row.getCell(2).value, `${name}, initial savings`),
      initialSavingsDate: getCellDate(row.getCell(3).value),
      contributions: [],
      withdrawals: [],
    })
  })

  const contributionsSheet = workbook.getWorksheet('Contributions')
  contributionsSheet?.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const name = String(row.getCell(1).value ?? '').trim()
    if (!name) return
    const member = members.get(name)
    if (!member) throw new Error(`Excel contribution refers to unknown member "${name}".`)
    member.contributions.push({
      date: getCellDate(row.getCell(2).value),
      amount: getCellNumber(row.getCell(3).value, `${name}, contribution`),
    })
  })

  const withdrawalsSheet = workbook.getWorksheet('Withdrawals')
  withdrawalsSheet?.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const name = String(row.getCell(1).value ?? '').trim()
    if (!name) return
    const member = members.get(name)
    if (!member) throw new Error(`Excel withdrawal refers to unknown member "${name}".`)
    member.withdrawals.push({
      date: getCellDate(row.getCell(2).value),
      amount: getCellNumber(row.getCell(3).value, `${name}, withdrawal`),
      reason: String(row.getCell(4).value ?? ''),
    })
  })

  return [...members.values()]
}

export const writeWorkbookMembers = async (directory: DatabaseDirectoryHandle, members: Member[]) => {
  const ExcelJS = (await import('exceljs')).default
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Funds Organizer'

  const membersSheet = workbook.addWorksheet('Members')
  membersSheet.addRow(['Name', 'Initial Savings', 'Initial Savings Date'])
  members.forEach((member) => membersSheet.addRow([
    member.name,
    member.initialSavings,
    member.initialSavingsDate,
  ]))

  const contributionsSheet = workbook.addWorksheet('Contributions')
  contributionsSheet.addRow(['Member', 'Date', 'Amount'])
  members.forEach((member) => member.contributions.forEach((contribution) => {
    contributionsSheet.addRow([member.name, contribution.date, contribution.amount])
  }))

  const withdrawalsSheet = workbook.addWorksheet('Withdrawals')
  withdrawalsSheet.addRow(['Member', 'Date', 'Amount', 'Reason'])
  members.forEach((member) => member.withdrawals.forEach((withdrawal) => {
    withdrawalsSheet.addRow([member.name, withdrawal.date, withdrawal.amount, withdrawal.reason])
  }))

  const fileHandle = await directory.getFileHandle(DATABASE_FILE_NAME, { create: true })
  const writable = await fileHandle.createWritable()
  try {
    await writable.write(await workbook.xlsx.writeBuffer())
    await writable.close()
  } catch (error) {
    await writable.close()
    throw error
  }
}