import {BrowserRouter, Routes, Route} from "react-router-dom";
import Frontpage from "./components/Frontpage.js";
import Register from './components/Register.js';
import Login from './components/Login.js';
import Dashboard from "./components/Dashboard.js";


function App() {
  return (
    <BrowserRouter> 
      <Routes>
        <Route path="/" element={<Frontpage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} /> 
        <Route path="/dashboard" element={<Dashboard />} />   
      </Routes>
   </BrowserRouter>
   
  

  );
}

export default App;
