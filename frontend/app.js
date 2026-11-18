
// ELEMENTOS DA INTERFACE
const taskList = document.getElementById("task-list");
const addTaskBtn = document.getElementById("add-task-btn");
const filterButtons = document.querySelectorAll(".filter-btn");

const totalTasks = document.getElementById("total-tasks");
const pendingTasks = document.getElementById("pending-tasks");
const progressTasks = document.getElementById("progress-tasks");
const completedTasks = document.getElementById("completed-tasks");

// DADOS
let tasks = JSON.parse(localStorage.getItem("devcafe-tasks")) || [];
let currentFilter = "all";

// SALVAR TAREFAS
function saveTasks() {
    localStorage.setItem("devcafe-tasks", JSON.stringify(tasks));
}

// ATUALIZAR INDICADORES
function updateSummary() {
    totalTasks.textContent = tasks.length;

    pendingTasks.textContent = tasks.filter(
        task => task.status === "pending"
    ).length;

    progressTasks.textContent = tasks.filter(
        task => task.status === "progress"
    ).length;

    completedTasks.textContent = tasks.filter(
        task => task.status === "completed"
    ).length;
}

// CRIAR NOVA TAREFA
function addTask() {
    const title = prompt("Qual é o nome da tarefa?");

    if (!title || !title.trim()) {
        return;
    }

    const description = prompt("Adicione uma descrição para a tarefa:") || "";

    const priority = prompt(
        "Escolha a prioridade:\n1 - Baixa\n2 - Média\n3 - Alta",
        "2"
    );

    const priorities = {
        "1": "Baixa",
        "2": "Média",
        "3": "Alta"
    };

    if (!priorities[priority]) {
        alert("Prioridade inválida. Tente novamente.");
        return;
    }

    const newTask = {
        id: Date.now(),
        title: title.trim(),
        description: description.trim(),
        priority: priorities[priority],
        status: "pending"
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();
}

// ALTERAR STATUS
function changeStatus(id, status) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, status: status };
        }

        return task;
    });

    saveTasks();
    renderTasks();
}

// EDITAR TAREFA
function editTask(id) {
    const task = tasks.find(task => task.id === id);

    if (!task) return;

    const newTitle = prompt("Editar título:", task.title);

    if (newTitle === null) return;

    if (!newTitle.trim()) {
        alert("O título não pode ficar vazio.");
        return;
    }

    const newDescription = prompt(
        "Editar descrição:",
        task.description
    );

    if (newDescription === null) return;

    task.title = newTitle.trim();
    task.description = newDescription.trim();

    saveTasks();
    renderTasks();
}

// EXCLUIR TAREFA
function deleteTask(id) {
    const confirmed = confirm(
        "Tem certeza de que deseja excluir esta tarefa?"
    );

    if (!confirmed) return;

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();
}

// FILTRAR TAREFAS
function getFilteredTasks() {
    if (currentFilter === "all") {
        return tasks;
    }

    return tasks.filter(
        task => task.status === currentFilter
    );
}

// EXIBIR TAREFAS
function renderTasks() {
    taskList.innerHTML = "";

    const filteredTasks = getFilteredTasks();

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <span>☕</span>
                <h3>Nenhuma tarefa encontrada!</h3>
                <p>Adicione uma tarefa ou escolha outro filtro.</p>
            </div>
        `;

        updateSummary();
        return;
    }

    filteredTasks.forEach(task => {
        const taskCard = document.createElement("div");
        taskCard.className = "task-card";

        const statusLabels = {
            pending: "Pendente",
            progress: "Em andamento",
            completed: "Concluída"
        };

        const priorityClass = {
            Baixa: "low",
            Média: "medium",
            Alta: "high"
        };

        taskCard.innerHTML = `
            <div class="task-info">
                <h3>${escapeHTML(task.title)}</h3>
                <p>${escapeHTML(task.description)}</p>

                <div class="task-tags">
                    <span class="priority ${priorityClass[task.priority]}">
                        ${task.priority}
                    </span>

                    <span class="status">
                        ${statusLabels[task.status]}
                    </span>
                </div>
            </div>

            <div class="task-actions">
                <select class="status-select" aria-label="Alterar status">
                    <option value="pending" ${task.status === "pending" ? "selected" : ""}>
                        Pendente
                    </option>

                    <option value="progress" ${task.status === "progress" ? "selected" : ""}>
                        Em andamento
                    </option>

                    <option value="completed" ${task.status === "completed" ? "selected" : ""}>
                        Concluída
                    </option>
                </select>

                <button class="edit-btn">Editar</button>
                <button class="delete-btn">Excluir</button>
            </div>
        `;

        taskCard.querySelector(".status-select").addEventListener(
            "change",
            event => changeStatus(task.id, event.target.value)
        );

        taskCard.querySelector(".edit-btn").addEventListener(
            "click",
            () => editTask(task.id)
        );

        taskCard.querySelector(".delete-btn").addEventListener(
            "click",
            () => deleteTask(task.id)
        );

        taskList.appendChild(taskCard);
    });

    updateSummary();
}

// EVITAR INSERÇÃO DE HTML INDESEJADO
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

// EVENTO DO BOTÃO DE CADASTRO
addTaskBtn.addEventListener("click", addTask);

// EVENTOS DOS FILTROS
filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        filterButtons.forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        currentFilter = button.dataset.filter;

        renderTasks();
    });
});

// INICIALIZAÇÃO
renderTasks();
