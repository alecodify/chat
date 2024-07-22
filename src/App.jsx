import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Form } from './screens';
import './App.css'

const ProtectedRoute = ({children}) =>{
  const isLoggedIn = localStorage.getItem('user:token') !== null || true;

  if (!isLoggedIn) {
    return <Navigate to={"users/sign_in"} />
  }

  return children
}

function App() {
  return (
    <Router>
      <div className='bg-[#edf3fc] h-screen flex items-center justify-center'>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }/>
          <Route path="/users/sign_in" element={<Form isSignIn={true} />} />
          <Route path="/users/sign_up" element={<Form isSignIn={false} />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
