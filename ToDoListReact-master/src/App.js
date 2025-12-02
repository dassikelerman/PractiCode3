import React, { useEffect, useState } from 'react';
import service from './service.js';

function App() {
  const [newTodo, setNewTodo] = useState("");
  const [todos, setTodos] = useState([]);

  // טעינת משימות ראשונית
  async function getTodos() {
    try {
      const todos = await service.getTasks();
      setTodos(todos);
    } catch (err) {
      console.error("Failed to fetch todos:", err);
    }
  }

  // הוספת משימה חדשה
  async function createTodo(e) {
    e.preventDefault();
    const trimmedName = newTodo.trim();
    if (!trimmedName) return; 

    try {
      const addedTodo = await service.addTask(trimmedName);
      setNewTodo(""); 
      
      // עדכון מקומי של ה-State
      setTodos(prevTodos => [...prevTodos, addedTodo]); 
    } catch (err) {
      console.error("Failed to add todo:", err);
    }
  }

  // 🚨 תיקון קריטי: עדכון סטטוס משימה (PUT) 🚨
  async function updateCompleted(todo, isComplete) {
    try {
      // 👈 יוצרים אובייקט חדש המכיל את ה-ID, ה-NAME, וה-isComplete
      const updatedTodo = { 
            id: todo.id, 
            name: todo.name, // חיוני! זה מה שמנע את ה-500 ב-C#
            isComplete: isComplete 
        }; 
      
      // שולחים את האובייקט המלא ל-API (זה תואם ל-service.js!)
      await service.setCompleted(updatedTodo); 
      
      // מעדכנים את ה-State המקומי: מחליפים את המשימה הישנה בחדשה
      setTodos(prevTodos => 
        prevTodos.map(t => (t.id === todo.id ? updatedTodo : t))
      );
    } catch (err) {
      console.error("Failed to update todo:", err);
    }
  }

  // מחיקת משימה
  async function deleteTodo(id) {
    try {
      await service.deleteTask(id);
      
      // מסננים את המשימה שנמחקה מה-State
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    } catch (err) {
      console.error("Failed to delete todo:", err);
    }
  }

  useEffect(() => {
    getTodos();
  }, []);

  // ----------------------------------------------------
  // חישוב סטטיסטיקה
  const totalCount = todos.length;
  const completedCount = todos.filter(todo => todo.isComplete).length;
  const openCount = totalCount - completedCount;
  // ----------------------------------------------------

  return (
    <section className="todoapp">
      <header className="header">
        <h1>todos</h1>
        <form onSubmit={createTodo}>
          <input
            className="new-todo"
            placeholder="Well, let's take on the day"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
        </form>
      </header>
      
      <section className="main" style={{ display: todos.length > 0 ? "block" : "none" }}>
        <ul className="todo-list">
          {todos.map(todo => (
            <li className={todo.isComplete ? "completed" : ""} key={todo.id}>
              <div className="view">
                <input
                  className="toggle"
                  type="checkbox"
                  checked={!!todo.isComplete}
                  onChange={(e) => updateCompleted(todo, e.target.checked)}
                />
                <label>{todo.name}</label>
                <button className="destroy" onClick={() => deleteTodo(todo.id)}></button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* תצוגת הסטטיסטיקה */}
      <div className="statistics">
          <div className="stat-item stat-total">
              <strong>{totalCount}</strong>
              <span>סה"כ משימות</span>
          </div>
          <div className="stat-item stat-completed">
              <strong>{completedCount}</strong>
              <span>הושלמו</span>
          </div>
          <div className="stat-item stat-open">
              <strong>{openCount}</strong>
              <span>פתוחות</span>
          </div>
      </div>
    </section>
  );
}

export default App;
