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
          <img src="https://i.ibb.co/qYxZtRj2/Mask.jpg" alt="tree-right" />
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
            {!hasHost && (
              <div className="button-top-all-design" onClick={handleHostClick} style={{ cursor: 'pointer' }}>
                <p>Tạo Phòng (Host)</p>
              </div>
            )}
            <div className="button-top-all-design" onClick={() => navigate('/player')} style={{ cursor: 'pointer' }}>
              <p>Vào Phòng (Player)</p>
            </div>
          </div>
        </div>
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
