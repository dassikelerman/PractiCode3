// import axios from "axios";

// // כתובת ה־API כברירת מחדל
// axios.defaults.baseURL = process.env.REACT_APP_API_URL;

// // Interceptor לתפיסת שגיאות מהשרת
// axios.interceptors.response.use(
//   response => response,
//   error => {
//     console.error("API ERROR:", error.response?.data || error.message);
//     return Promise.reject(error);
//   }
// );

// export default {
//   // מביא את כל המשימות
//   getTasks: async () => {
//     const result = await axios.get("/items");
//     return result.data;
//   },

//   // מוסיף משימה חדשה עם isComplete false כברירת מחדל
//   addTask: async (name) => {
//     const result = await axios.post("/items", { name, isComplete: false });
//     return result.data;
//   },

//   // מעדכן סטטוס של משימה
//   setCompleted: async (id, isComplete) => {
//     const result = await axios.put(`/items/${id}`, { isComplete });
//     return result.data;
//   },

//   // מחיקת משימה
//   deleteTask: async (id) => {
//     const result = await axios.delete(`/items/${id}`);
//     return result.data;
//   }
// };

import axios from "axios";

// כתובת ה־API כברירת מחדל
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

// Interceptor לתפיסת שגיאות מהשרת
axios.interceptors.response.use(
  response => response,
  error => {
    // מציג שגיאות CORS / Network Error בצורה ברורה
    console.error("API ERROR:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default {
  // מביא את כל המשימות
  getTasks: async () => {
    const result = await axios.get("/items");
    return result.data;
  },

  // מוסיף משימה חדשה
  addTask: async (name) => {
    const result = await axios.post("/items", { name, isComplete: false });
    return result.data;
  },

  // 💡 שיפור: מעדכן סטטוס של משימה באמצעות שליחת אובייקט ה-TODO המלא
  setCompleted: async (updatedTodo) => {
    // שולח את כל האובייקט (כולל name ו-isComplete)
    const result = await axios.put(`/items/${updatedTodo.id}`, updatedTodo);
    return result.data;
  },

  // מחיקת משימה
  deleteTask: async (id) => {
    const result = await axios.delete(`/items/${id}`);
    return result.data;
  }
};
