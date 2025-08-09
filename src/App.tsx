import { AppRouter } from './router';
<<<<<<< HEAD
import './App.css';

function App() {
  return <AppRouter />;
=======
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
}

export default App;
