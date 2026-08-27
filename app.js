// تطبيق قائمة المهام - التخزين المحلي والوظائف

class TodoApp {
    constructor() {
        // عناصر DOM
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.emptyMessage = document.getElementById('emptyMessage');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.totalTodos = document.getElementById('totalTodos');
        this.completedTodos = document.getElementById('completedTodos');
        this.remainingTodos = document.getElementById('remainingTodos');

        // البيانات
        this.todos = [];
        this.currentFilter = 'all';
        this.editingId = null;

        // تهيئة التطبيق
        this.init();
    }

    init() {
        // تحميل البيانات من التخزين المحلي
        this.loadTodos();

        // إضافة مستمعي الأحداث
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());

        // مستمعي الفلاتر
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // تحديث العرض
        this.render();
    }

    // إضافة مهمة جديدة
    addTodo() {
        const text = this.todoInput.value.trim();

        if (text === '') {
            alert('الرجاء إدخال مهمة!');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString('ar-SA')
        };

        this.todos.push(todo);
        this.saveTodos();
        this.todoInput.value = '';
        this.todoInput.focus();
        this.render();
    }

    // حذف مهمة
    deleteTodo(id) {
        if (confirm('هل تريد حذف هذه المهمة؟')) {
            this.todos = this.todos.filter(todo => todo.id !== id);
            this.saveTodos();
            this.render();
        }
    }

    // تحديد المهمة كمكتملة
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    // تعديل مهمة
    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        const newText = prompt('عدّل المهمة:', todo.text);
        if (newText && newText.trim()) {
            todo.text = newText.trim();
            this.saveTodos();
            this.render();
        }
    }

    // مسح المهام المكتملة
    clearCompleted() {
        if (confirm('هل تريد حذف جميع المهام المكتملة؟')) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveTodos();
            this.render();
        }
    }

    // حذف جميع المهام
    clearAll() {
        if (confirm('هل تريد حذف جميع المهام؟ هذا الإجراء لا يمكن التراجع عنه!')) {
            this.todos = [];
            this.saveTodos();
            this.render();
        }
    }

    // تعيين الفلتر الحالي
    setFilter(filter) {
        this.currentFilter = filter;

        // تحديث الأزرار النشطة
        this.filterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        this.render();
    }

    // الحصول على المهام المفلترة
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            case 'all':
            default:
                return this.todos;
        }
    }

    // تحديث الإحصائيات
    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(todo => todo.completed).length;
        const remaining = total - completed;

        this.totalTodos.textContent = total;
        this.completedTodos.textContent = completed;
        this.remainingTodos.textContent = remaining;
    }

    // رسم القائمة
    render() {
        const filteredTodos = this.getFilteredTodos();

        // تفريغ القائمة
        this.todoList.innerHTML = '';

        if (filteredTodos.length === 0) {
            this.emptyMessage.classList.add('show');
        } else {
            this.emptyMessage.classList.remove('show');
        }

        // إضافة المهام
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="app.toggleTodo(${todo.id})"
                >
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <div class="todo-actions">
                    <button class="todo-btn edit-btn" onclick="app.editTodo(${todo.id})">✏️ تعديل</button>
                    <button class="todo-btn delete-btn" onclick="app.deleteTodo(${todo.id})">🗑️ حذف</button>
                </div>
            `;
            this.todoList.appendChild(li);
        });

        // تحديث الإحصائيات
        this.updateStats();
    }

    // حفظ المهام في التخزين المحلي
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
        console.log('✓ تم حفظ المهام في التخزين المحلي');
    }

    // تحميل المهام من التخزين المحلي
    loadTodos() {
        const stored = localStorage.getItem('todos');
        if (stored) {
            try {
                this.todos = JSON.parse(stored);
                console.log(`✓ تم تحميل ${this.todos.length} مهام من التخزين المحلي`);
            } catch (e) {
                console.error('خطأ في تحميل البيانات:', e);
                this.todos = [];
            }
        }
    }

    // تجنب XSS - تحويل الأحرف الخاصة
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// تهيئة التطبيق عند تحميل الصفحة
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TodoApp();
    console.log('✓ تم تهيئة تطبيق قائمة المهام');
});