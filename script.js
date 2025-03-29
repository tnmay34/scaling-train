document.addEventListener('DOMContentLoaded', function() {
      // Set today's date as default
      const today = new Date();
      const formattedDate = today.toISOString().substr(0, 10);
      document.getElementById('date').value = formattedDate;
      
      // Load expenses from localStorage
      let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
      
      // DOM elements
      const amountInput = document.getElementById('amount');
      const categorySelect = document.getElementById('category');
      const descriptionInput = document.getElementById('description');
      const dateInput = document.getElementById('date');
      const addBtn = document.getElementById('add-btn');
      const expensesList = document.getElementById('expenses-list');
      const noExpensesMsg = document.getElementById('no-expenses');
      const categorySummary = document.getElementById('category-summary');
      const totalExpenses = document.getElementById('total-expenses');
      const filterButtons = document.querySelectorAll('.filter-btn');
      const editModal = document.getElementById('edit-modal');
      const modalContent = document.getElementById('modal-content');
      const editAmount = document.getElementById('edit-amount');
      const editCategory = document.getElementById('edit-category');
      const editDescription = document.getElementById('edit-description');
      const editDate = document.getElementById('edit-date');
      const cancelEditBtn = document.getElementById('cancel-edit');
      const saveEditBtn = document.getElementById('save-edit');
      
      // Current filter and edit index
      let currentFilter = 'all';
      let currentEditIndex = -1;
      
      // Add expense
      addBtn.addEventListener('click', function() {
        const amount = parseFloat(amountInput.value);
        const category = categorySelect.value;
        const description = descriptionInput.value;
        const date = dateInput.value;
        
        if (isNaN(amount) || amount <= 0) {
          showAlert('Please enter a valid amount', 'error');
          amountInput.focus();
          return;
        }
        
        if (!date) {
          showAlert('Please select a date', 'error');
          return;
        }
        
        const expense = {
          amount: amount,
          category: category,
          description: description,
          date: date,
          id: Date.now() // Add unique ID for better management
        };
        
        expenses.push(expense);
        saveExpenses();
        renderExpenses();
        renderSummary();
        
        // Clear form
        amountInput.value = '';
        descriptionInput.value = '';
        dateInput.value = formattedDate;
        amountInput.focus();
        
        showAlert('Expense added successfully!', 'success');
      });
      
      // Delete expense
      function deleteExpense(index) {
        showConfirmation('Delete Expense', 'Are you sure you want to delete this expense?', () => {
          const deletedExpense = expenses.splice(index, 1);
          saveExpenses();
          renderExpenses();
          renderSummary();
          showAlert('Expense deleted', 'success');
        });
      }
      
      // Edit expense
      function editExpense(index) {
        currentEditIndex = index;
        const expense = expenses[index];
        
        editAmount.value = expense.amount;
        editCategory.value = expense.category;
        editDescription.value = expense.description || '';
        editDate.value = expense.date;
        
        editModal.style.display = 'flex';
        setTimeout(() => {
          modalContent.classList.add('show');
        }, 10);
      }
      
      // Save edited expense
      saveEditBtn.addEventListener('click', function() {
        const amount = parseFloat(editAmount.value);
        const category = editCategory.value;
        const description = editDescription.value;
        const date = editDate.value;
        
        if (isNaN(amount) || amount <= 0) {
          showAlert('Please enter a valid amount', 'error');
          return;
        }
        
        if (!date) {
          showAlert('Please select a date', 'error');
          return;
        }
        
        expenses[currentEditIndex] = {
          ...expenses[currentEditIndex],
          amount: amount,
          category: category,
          description: description,
          date: date
        };
        
        saveExpenses();
        renderExpenses();
        renderSummary();
        closeEditModal();
        
        showAlert('Expense updated successfully!', 'success');
      });
      
      // Cancel edit
      cancelEditBtn.addEventListener('click', closeEditModal);
      
      // Close modal when clicking outside
      editModal.addEventListener('click', function(e) {
        if (e.target === editModal) {
          closeEditModal();
        }
      });
      
      function closeEditModal() {
        modalContent.classList.remove('show');
        setTimeout(() => {
          editModal.style.display = 'none';
        }, 300);
        currentEditIndex = -1;
      }
      
      // Save to localStorage
      function saveExpenses() {
        localStorage.setItem('expenses', JSON.stringify(expenses));
      }
      
      // Format date to DD/MM/YYYY
      function formatDate(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
      }
      
      // Format currency in Indian Rupees
      function formatCurrency(amount) {
        return '₹' + amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
      }
      
      // Filter expenses by category
      function filterExpenses(category) {
        currentFilter = category;
        renderExpenses();
        
        // Update active button
        filterButtons.forEach(btn => {
          if (btn.dataset.category === category) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
      }
      
      // Add event listeners to filter buttons
      filterButtons.forEach(button => {
        button.addEventListener('click', function() {
          filterExpenses(this.dataset.category);
        });
      });
      
      // Render expenses list
      function renderExpenses() {
        expensesList.innerHTML = '';
        
        // Filter expenses if needed
        let filteredExpenses = [...expenses];
        if (currentFilter !== 'all') {
          filteredExpenses = expenses.filter(exp => exp.category === currentFilter);
        }
        
        if (filteredExpenses.length === 0) {
          noExpensesMsg.style.display = 'block';
          return;
        }
        
        noExpensesMsg.style.display = 'none';
        
        // Sort by date (newest first)
        const sortedExpenses = filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedExpenses.forEach((expense, index) => {
          const originalIndex = expenses.findIndex(exp => exp.id === expense.id);
          
          const row = document.createElement('tr');
          row.className = 'fade-in';
          
          row.innerHTML = `
            <td class="expense-date">${formatDate(expense.date)}</td>
            <td>${formatCurrency(expense.amount)}</td>
            <td><span class="category-tag category-${expense.category}">${expense.category}</span></td>
            <td class="expense-desc">${expense.description || '-'}</td>
            <td>
              <button class="edit-btn" data-index="${originalIndex}">Edit</button>
              <button class="delete-btn" data-index="${originalIndex}">Delete</button>
            </td>
          `;
          
          expensesList.appendChild(row);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
          button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            deleteExpense(index);
          });
        });
        
        document.querySelectorAll('.edit-btn').forEach(button => {
          button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            editExpense(index);
          });
        });
      }
      
      // Render summary
      function renderSummary() {
        const summary = {};
        let total = 0;
        
        expenses.forEach(expense => {
          if (!summary[expense.category]) {
            summary[expense.category] = 0;
          }
          summary[expense.category] += expense.amount;
          total += expense.amount;
        });
        
        let summaryHTML = '';
        
        if (Object.keys(summary).length === 0) {
          summaryHTML = `
            <div class="no-expenses">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p>Add expenses to see your spending summary</p>
            </div>
          `;
        } else {
          // Sort categories by amount (highest first)
          const sortedCategories = Object.keys(summary).sort((a, b) => summary[b] - summary[a]);
          
          sortedCategories.forEach(category => {
            const percentage = (summary[category] / total * 100).toFixed(1);
            summaryHTML += `
              <div class="summary-item slide-in">
                <div>
                  <span>${category}</span>
                  <div class="progress-bar">
                    <div class="progress" style="width: ${percentage}%"></div>
                  </div>
                </div>
                <span>${formatCurrency(summary[category])} (${percentage}%)</span>
              </div>
            `;
          });
        }
        
        categorySummary.innerHTML = summaryHTML;
        totalExpenses.textContent = `Total: ${formatCurrency(total)}`;
      }
      
      // Show alert message
      function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert ${type}`;
        alert.textContent = message;
        document.body.appendChild(alert);
        
        setTimeout(() => {
          alert.classList.add('show');
        }, 10);
        
        setTimeout(() => {
          alert.classList.remove('show');
          setTimeout(() => {
            document.body.removeChild(alert);
          }, 300);
        }, 3000);
      }
      
      // Show confirmation dialog
      function showConfirmation(title, message, confirmCallback) {
        const confirmModal = document.createElement('div');
        confirmModal.className = 'edit-modal';
        confirmModal.style.display = 'flex';
        
        confirmModal.innerHTML = `
          <div class="modal-content show">
            <h2>${title}</h2>
            <p>${message}</p>
            <div class="modal-buttons">
              <button id="confirm-cancel" style="background-color: var(--text-light)">Cancel</button>
              <button id="confirm-ok" style="background-color: var(--danger-color)">Delete</button>
            </div>
          </div>
        `;
        
        document.body.appendChild(confirmModal);
        
        confirmModal.querySelector('#confirm-cancel').addEventListener('click', () => {
          document.body.removeChild(confirmModal);
        });
        
        confirmModal.querySelector('#confirm-ok').addEventListener('click', () => {
          document.body.removeChild(confirmModal);
          confirmCallback();
        });
        
        confirmModal.addEventListener('click', (e) => {
          if (e.target === confirmModal) {
            document.body.removeChild(confirmModal);
          }
        });
      }
      
      // Initial render
      renderExpenses();
      renderSummary();
      
      // Add some demo data if empty (for demonstration)
      if (expenses.length === 0 && localStorage.getItem('demoDataAdded') !== 'true') {
        const demoExpenses = [
          { amount: 350, category: 'Food', description: 'Lunch with friends', date: formattedDate, id: Date.now() + 1 },
          { amount: 1200, category: 'Shopping', description: 'New shoes', date: formattedDate, id: Date.now() + 2 },
          { amount: 500, category: 'Transport', description: 'Monthly metro pass', date: formattedDate, id: Date.now() + 3 }
        ];
        
        expenses = demoExpenses;
        saveExpenses();
        localStorage.setItem('demoDataAdded', 'true');
        renderExpenses();
        renderSummary();
      }
    });
