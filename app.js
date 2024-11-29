const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

let groups = [];

app.get('/', (req, res) => {
  res.render('index', { groups });
});

app.post('/create-group', (req, res) => {
  const { groupName } = req.body;
  groups.push({ name: groupName, members: [], expenses: [] });
  res.redirect('/');
});

app.get('/group/:id', (req, res) => {
  const group = groups[req.params.id];
  res.render('group', { group, groupId: req.params.id });
});

app.post('/group/:id/add-member', (req, res) => {
  const { memberName } = req.body;
  groups[req.params.id].members.push(memberName);
  res.redirect(`/group/${req.params.id}`);
});

app.post('/group/:id/add-expense', (req, res) => {
  const { description, amount, paidBy, splitBetween } = req.body;
  const expense = {
    description,
    amount: parseFloat(amount),
    paidBy,
    splitBetween: splitBetween.split(',').map(name => name.trim()),
  };
  groups[req.params.id].expenses.push(expense);
  res.redirect(`/group/${req.params.id}`);
});

app.get('/group/:id/summary', (req, res) => {
  const group = groups[req.params.id];
  const balances = calculateBalances(group);
  res.render('summary', { group, balances, groupId: req.params.id });
});


function calculateBalances(group) {
  const balances = {};
  group.members.forEach(member => (balances[member] = 0));

  group.expenses.forEach(expense => {
    const splitAmount = expense.amount / expense.splitBetween.length;
    expense.splitBetween.forEach(member => {
      balances[member] -= splitAmount;
    });
    balances[expense.paidBy] += expense.amount;
  });

  return balances;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
