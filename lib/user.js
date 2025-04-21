import db from "./db";

export  function createUser(email, password) {
  // Insert the user into the database
  const result = db
    .prepare("INSERT INTO users (email, password) VALUES ( ?, ?)")
    .run(email, password);
  // Close the database connection

  return result.lastInsertRowid;
}



export function getUserByEmail(email) {
  // Query the database for the user by email
  const user = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email);
  return user;
}