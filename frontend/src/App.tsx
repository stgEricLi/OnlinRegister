import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navigation from "./components/nav/Navigation";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Order from "./pages/Order";
import Signup from "./pages/Signup";
//import NotFound from "./pages/NotFound";
import Login from "./components/login/Login";
import { ProtectedRoute } from "./components/nav/ProtectedRoute";
import { UserRole } from "./interfaces/IAuth";
import { ErrorToastContainer } from "./components/error/ErrorToast";

import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="px-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            {/* <Route path="/userlist" element={<UserList />} />
            <Route path="/useredit/:userId" element={<UserEdit />} /> */}
            {/* Protected admin routes */}
            <Route
              path="/order"
              element={
                <ProtectedRoute requiredRole={UserRole.Admin}>
                  <Order />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global error toast notifications */}
        <ErrorToastContainer
          position="top-right"
          autoHideDuration={5000}
          maxToasts={3}
        />
      </div>
    </Router>
  );
}

export default App;
