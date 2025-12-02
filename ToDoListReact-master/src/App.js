// import React, { useEffect, useState } from 'react';
// import service from './service.js';

// function App() {
//   const [newTodo, setNewTodo] = useState("");
//   const [todos, setTodos] = useState([]);

//   async function getTodos() {
//     try {
//       const todos = await service.getTasks();
//       setTodos(todos);
//     } catch (err) {
//       console.error("Failed to fetch todos:", err);
//     }
//   }

//   async function createTodo(e) {
//     e.preventDefault();
//     if (!newTodo.trim()) return; // לא מוסיף אם השורה ריקה
//     try {
//       await service.addTask(newTodo);
//       setNewTodo(""); // לנקות את השורה
//       await getTodos(); // ריענון רשימת משימות
//     } catch (err) {
//       console.error("Failed to add todo:", err);
//     }
//   }

//   async function updateCompleted(todo, isComplete) {
//     try {
//       await service.setCompleted(todo.id, isComplete);
//       await getTodos();
//     } catch (err) {
//       console.error("Failed to update todo:", err);
//     }
//   }

//   async function deleteTodo(id) {
//     try {
//       await service.deleteTask(id);
//       await getTodos();
//     } catch (err) {
//       console.error("Failed to delete todo:", err);
//     }
//   }

//   useEffect(() => {
//     getTodos();
//   }, []);

//   // ----------------------------------------------------
//   // קוד חדש: חישוב סטטיסטיקה
//   const totalCount = todos.length;
//   // ודאי שכל פריט במערך ה-todos מכיל שדה בשם isComplete
//   const completedCount = todos.filter(todo => todo.isComplete).length;
//   const openCount = totalCount - completedCount;
//   // ----------------------------------------------------

//   return (
//     // ⚠️ הערה: שינינו את ה-ID ל-className="todoapp" כדי להתאים ל-CSS החדש!
//     <section className="todoapp">
//       <header className="header">
//         <h1>todos</h1>
//         <form onSubmit={createTodo}>
//           <input
//             className="new-todo"
//             placeholder="Well, let's take on the day"
//             value={newTodo}
//             onChange={(e) => setNewTodo(e.target.value)}
//           />
//         </form>
//       </header>
//       <section className="main" style={{ display: "block" }}>
//         <ul className="todo-list">
//           {todos.map(todo => (
//             <li className={todo.isComplete ? "completed" : ""} key={todo.id}>
//               <div className="view">
//                 <input
//                   className="toggle"
//                   type="checkbox"
//                   checked={!!todo.isComplete}
//                   onChange={(e) => updateCompleted(todo, e.target.checked)}
//                 />
//                 <label>{todo.name}</label>
//                 <button className="destroy" onClick={() => deleteTodo(todo.id)}></button>
//               </div>
//             </li>
//           ))}
//         </ul>
//       </section>

//       {/* ---------------------------------------------------- */}
//       {/* קוד חדש: תצוגת הסטטיסטיקה (באמצעות ה-CSS החדש) */}
//       <div className="statistics">
//           <div className="stat-item stat-total">
//               <strong>{totalCount}</strong>
//               <span>סה"כ משימות</span>
//           </div>
//           <div className="stat-item stat-completed">
//               <strong>{completedCount}</strong>
//               <span>הושלמו</span>
//           </div>
//           <div className="stat-item stat-open">
//               <strong>{openCount}</strong>
//               <span>פתוחות</span>
//           </div>
//       </div>
//       {/* ---------------------------------------------------- */}
//     </section>
//   );
// }

// export default App;

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
      setNewTodo(""); // לנקות את השורה
      
      // 💡 שיפור: עדכון מקומי של ה-State
      setTodos(prevTodos => [...prevTodos, addedTodo]); 
    } catch (err) {
      console.error("Failed to add todo:", err);
    }
  }

  // 💡 תיקון ושיפור: עדכון סטטוס משימה
  async function updateCompleted(todo, isComplete) {
    try {
      // יוצרים אובייקט חדש עם הסטטוס המעודכן, הכולל את ה-ID וה-NAME המקוריים
      const updatedTodo = { id: todo.id, name: todo.name, isComplete: isComplete }; 
      
      // שולחים את האובייקט המלא ל-API (זה פותר את שגיאת 500!)
      await service.setCompleted(updatedTodo); 
      
      // מעדכנים את ה-State המקומי: מחליפים את המשימה הישנה בחדשה
      setTodos(prevTodos => 
        prevTodos.map(t => (t.id === todo.id ? updatedTodo : t))
      );
    } catch (err) {
      console.error("Failed to update todo:", err);
      // במקרה של כשל, ניתן להציג הודעה או לבצע getTodos() אם רוצים ודאות
    }
  }

  // 💡 שיפור: מחיקת משימה
  async function deleteTodo(id) {
    try {
      await service.deleteTask(id);
      
      // מסננים את המשימה שנמחקה מה-State, במקום לטעון את כל הרשימה מחדש
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    } catch (err) {
      console.error("Failed to delete todo:", err);
      // במקרה של כשל, ניתן לבצע getTodos() אם רוצים ודאות
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
            // חשוב: משתמשים ב-todo.id כשדה המזהה (key)
            <li className={todo.isComplete ? "completed" : ""} key={todo.id}>
              <div className="view">
                {/* הערה: השתמשנו ב-label כדי לעצב את הצ'קבוקס ב-CSS */}
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
