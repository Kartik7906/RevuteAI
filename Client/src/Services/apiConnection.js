// const URL = "https://revuteai.onrender.com/api";
const URL = "http://localhost:8000/api";


// LOGIN
export const login = ({ email, password }) => {
  return fetch(`${URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
};

// REGISTER
export const register = (data) => {
  return fetch(`${URL}/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then(response => {
    if (!response.ok) {
      throw new Error('Failed to register');
    }
    return response.json();
  });
};
