import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Home from './pages/Home';
import Notes from './pages/Notes';

function App() {

  return (
    <>
            <Router>
          <Routes>
            <Route exact path="/" element={<Home/>} />
            <Route exact path="/notes" element={<Notes/>} />
          </Routes>
        </Router>
    </>
  )
}

export default App
