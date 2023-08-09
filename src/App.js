import './App.css';
import Main from './Components/Main/Main';
import TopNavBar from './Components/TopnavBar/TopNavBar';


function App() {
  return (
    <div className="App">
      <TopNavBar/>
      <div className="Main">
        <Main />
      </div>
    </div>
  );
}

export default App;
