import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Form } from './screens';
import './App.css'

const ProtectedRoute = ({children, auth= false}) =>{
  const isLoggedIn = localStorage.getItem('user:token') !== null || false;

  if (!isLoggedIn && auth) {
    return <Navigate to={"users/sign_in"} />
  } else if (isLoggedIn && ['/users/sign_in', '/users/sign_up'].includes(window.location.pathname)) {
    return <Navigate to={"/"} />
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
          <Route path="/users/sign_in" element={
            <ProtectedRoute>
              <Form isSignIn={true} />
            </ProtectedRoute>
            } />
          <Route path="/users/sign_up" element={
            <ProtectedRoute>
              <Form isSignIn={false} />
            </ProtectedRoute>
            } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
