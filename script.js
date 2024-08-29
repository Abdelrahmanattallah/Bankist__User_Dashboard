'use strict';
// BANKIST APP

/////////////////////////////////////////////////
// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];
/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// functions
const createUserNames = function (accs = []) {
  accs.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0])
      .join('');
  });
};
createUserNames(accounts);

const displayMovements = function (movements = [], sort = false) {
  const isMovmentsSorted = sort
    ? movements.slice().sort((a, b) => a - b)
    : movements;

  containerMovements.innerHTML = '';

  isMovmentsSorted.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = ` 
    <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__value">${mov.toFixed(2)}€</div>
        </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance.toFixed(2)}€`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${-out.toFixed(2)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

const updateUI = function (acc) {
  // Display Movements
  displayMovements(acc.movements);

  // Display Balance
  calcDisplayBalance(acc);

  // Display Summary
  calcDisplaySummary(acc);
};

const hideUI = function () {
  // Hide UI and welcome Message
  containerApp.classList.remove('show');
  labelWelcome.textContent = 'Log in to get started';
};
/////////////////////////////////////////////////
// Event Handlers
let currentAccount;

// Login Account Function Handler
const handleLoginBtn = function (e) {
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display ui and welcome Message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.classList.add('show');
    // Update UI
    updateUI(currentAccount);
  } else {
    // Hide UI and welcome Message
    hideUI();
  }

  // Clear Input Fields
  inputLoginUsername.value = inputLoginPin.value = '';
  inputLoginPin.blur();
};
btnLogin.addEventListener('click', handleLoginBtn);

// Transfer Money Function Handler
const handleTransferBtn = function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  const checkAvailTransfer =
    amount > 0 &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username &&
    receiverAcc?.username !== undefined;

  if (checkAvailTransfer) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Update UI
    updateUI(currentAccount);

    // Clear input fields
    inputTransferAmount.value = inputTransferTo.value = '';
  }
};
btnTransfer.addEventListener('click', handleTransferBtn);

//  Loan Function Handler
const handleLoanBtn = function (e) {
  e.preventDefault();
  const currentAccMovs = currentAccount.movements.filter(mov => {
    return mov > 0;
  });
  const requestedLoan = Math.floor(inputLoanAmount.value);
  const checkAvailLoan =
    requestedLoan > 0 && currentAccMovs.some(mov => mov >= requestedLoan / 10);

  if (checkAvailLoan) {
    // Adding the loan
    currentAccount.movements.push(requestedLoan);

    // Update Ui
    updateUI(currentAccount);
  } else {
    console.log('NOT! Available to Loan');
  }

  // Clear Input Field
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
};
btnLoan.addEventListener('click', handleLoanBtn);

// Close Account Function Handler
const handleCloseBtn = function (e) {
  e.preventDefault();
  const checkCredentials =
    currentAccount?.username === inputCloseUsername.value &&
    currentAccount.pin === +inputClosePin.value;

  if (checkCredentials) {
    // Find Account Index
    const findAccIndex = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    // Delete the account
    accounts.splice(findAccIndex, 1);

    // Hide UI and welcome Message
    hideUI();
  }

  // Clear Input Fields
  inputCloseUsername.value = inputClosePin.value = '';
  inputClosePin.blur();
};
btnClose.addEventListener('click', handleCloseBtn);

// Sort Movements Function Handler
let sorted = false;
const handleSortBtn = function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
};
btnSort.addEventListener('click', handleSortBtn);
/////////////////////////////////////////////////
