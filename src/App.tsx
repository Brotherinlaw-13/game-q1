import { Routes, Route } from 'react-router-dom';
import { MainMenu } from './components/MainMenu';
import { CharacterSelect } from './components/CharacterSelect';
import GameScreen from './components/GameScreen';
import { LobbyScreen } from './components/multiplayer/LobbyScreen';

function App() {
  return (
    <div className="w-full h-full bg-game-dark">
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/character-select" element={<CharacterSelect />} />
        <Route path="/lobby" element={<LobbyScreen />} />
        <Route path="/game" element={<GameScreen />} />
      </Routes>
    </div>
  );
}

export default App;
