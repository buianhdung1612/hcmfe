import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HostView from './HostView';
import PlayerView from './PlayerView';
import { socket } from './socket';

function Home() {
  const navigate = useNavigate();
  const [hasHost, setHasHost] = useState(false);

  useEffect(() => {
    // Listen for host status from backend
    socket.on('host_status', ({ hasHost }) => {
      setHasHost(hasHost);
    });

    return () => {
      socket.off('host_status');
    };
  }, []);

  const handleHostClick = () => {
    if (hasHost) {
      alert("Đã có người làm Host trong game này. Vui lòng vào phòng với tư cách Player.");
    } else {
      navigate('/host');
    }
  };

  return (
    <>
      <div className="data-design-svg">
        <div className="right-tree">
          <img src="/assets/images/hero/image-main/Mask.svg" alt="tree-right" />
        </div>
      </div>
      <div className="fixed-first-page" style={{ display: 'block' }}>
        <div className="overlay-data">
          <img src="/assets/images/hero/data.png" alt="data" />
        </div>
        <div className="deata-meter">
          <div className="container">
            <div className="deta-mins">
              <div className="fixed-data-top">HYBRID QUIZ</div>
              <p className="fixed-desc">Lựa chọn Vai trò của bạn</p>
            </div>
          </div>
          <div className="main-button-data" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <div className="button-top-all-design" onClick={() => navigate('/player')} style={{ cursor: 'pointer', width: '300px' }}>
              <p>Vào Phòng</p>
            </div>
          </div>
        </div>
      </div>

      <div 
        onClick={handleHostClick} 
        style={{ position: 'fixed', bottom: '20px', right: '20px', opacity: 0.2, cursor: 'pointer', padding: '10px', fontSize: '14px', zIndex: 100 }}
        title="Admin Login"
      >
        🔒
      </div>
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/host" element={<HostView />} />
      <Route path="/player" element={<PlayerView />} />
    </Routes>
  );
}

export default App;
