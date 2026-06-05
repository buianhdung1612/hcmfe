import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from './socket';
import { questions } from './questions';

function HostView() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRevivalLocked, setIsRevivalLocked] = useState(false);

  useEffect(() => {
    socket.emit('become_host');

    socket.on('host_accepted', () => {
      console.log('You are the host now.');
    });

    socket.on('host_rejected', (msg) => {
      alert(msg);
      navigate('/');
    });
    
    socket.on('player_joined', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on('player_status_updated', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on('player_revived', ({ playerName }) => {
      console.log(`${playerName} đã hồi sinh!`);
    });

    return () => {
      socket.off('host_accepted');
      socket.off('host_rejected');
      socket.off('player_joined');
      socket.off('player_status_updated');
      socket.off('player_revived');
    };
  }, [navigate]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const startGame = () => {
    socket.emit('start_game');
    setIsGameStarted(true);
    handleNextQuestion();
  };

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setTimeLeft(30);
      socket.emit('next_question', {
        questionIndex: nextIndex,
        questionData: {
           text: questions[nextIndex].text,
        },
        correctAnswer: questions[nextIndex].answer
      });
    } else {
      alert("Đã hết câu hỏi!");
    }
  };

  const killPlayer = (playerId) => {
    socket.emit('kill_player', { playerId });
  };

  const toggleRevivalLock = () => {
    const newStatus = !isRevivalLocked;
    setIsRevivalLocked(newStatus);
    socket.emit('toggle_revival_lock', { isLocked: newStatus });
  };

  if (!isGameStarted) {
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
                <div className="fixed-data-top">GAME SẮP BẮT ĐẦU</div>
                <p className="fixed-desc">Danh sách chờ: {players.length} người</p>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {players.map(p => (
                    <span key={p.id} style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '20px', color: 'white', fontWeight: 'bold' }}>
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="main-button-data">
              <div className="button-top-all-design" onClick={startGame} style={{ cursor: 'pointer' }}>
                <p>Bắt Đầu Trò Chơi</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const currentQ = questions[currentQuestionIndex];

  return (
    <>
      <div className="data-design-svg">
        <div className="right-tree">
          <img src="/assets/images/hero/image-main/Mask.svg" alt="tree-right" />
        </div>
      </div>
      <div className="main" style={{ display: 'block' }}>
      <div className="quiz-time" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
        <span>HOST CONTROL</span>
        <button onClick={toggleRevivalLock} style={{ padding: '8px 15px', background: isRevivalLocked ? '#4CAF50' : '#f44336', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
          {isRevivalLocked ? 'Mở lại Hồi sinh' : 'Kích hoạt Vòng Chung Kết'}
        </button>
      </div>
      <div className="container">
        <div className="header-data">
          <div className="logo-design">
            <a className='logo-data' href='#'>
              <img src="/assets/images/Logo/logo.svg" alt="logo" />
            </a>
          </div>
        </div>
        
        <div className="question-data">
          <p className="time-data">00:<span id="runing-data">{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span></p>
          <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
            <div className="data-design-main" style={{ flex: 1, margin: 0 }}>
              <div className="question-change-number" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p>Trạng thái: <span className="changing" style={{ color: isRevivalLocked ? '#f44336' : '#4CAF50' }}>{isRevivalLocked ? 'VÒNG CHUNG KẾT' : 'VÒNG LOẠI'}</span></p>
              </div>
              <div className="steps" style={{ display: 'block' }}>
                <div className="question-main-auto">
                  <div className="title-question">Câu {currentQuestionIndex + 1}: {currentQ?.text}</div>
                  {timeLeft === 0 && (
                    <h4 style={{ color: '#4CAF50', textAlign: 'center', marginTop: '10px' }}>Đáp án đúng: {currentQ?.answer}</h4>
                  )}
                </div>
              </div>
              <div className="button-deta-design">
                <button className="next-data" id="next" onClick={handleNextQuestion}>
                  Chuyển câu tiếp theo
                </button>
              </div>
            </div>

            <div style={{ width: '380px', background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', marginBottom: '20px', fontWeight: 'bold' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 11C18.2091 11 20 9.20914 20 7C20 4.79086 18.2091 3 16 3C13.7909 3 12 4.79086 12 7C12 9.20914 13.7909 11 16 11Z" fill="#1f2937"/>
                  <path d="M16 13C12.6863 13 10 15.6863 10 19V21H22V19C22 15.6863 19.3137 13 16 13Z" fill="#1f2937"/>
                  <path d="M8 11C9.65685 11 11 9.65685 11 8C11 6.34315 9.65685 5 8 5C6.34315 5 5 6.34315 5 8C5 9.65685 6.34315 11 8 11Z" fill="#9ca3af"/>
                  <path d="M8 13C5.79086 13 4 14.7908 4 17V19H8V18.1C8 16.7112 8.44149 15.4243 9.19163 14.3736C8.82512 14.1352 8.42398 13.9431 8 13.8247V13Z" fill="#9ca3af"/>
                </svg>
                Player List
              </h3>
              <div style={{ maxHeight: '500px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {players.map(p => (
                  <div key={p.id} style={{ border: '1px solid #eaeaea', borderRadius: '15px', padding: '12px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${p.name}`} alt="avatar" style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f5f7f9' }} />
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#333' }}>{p.name}</div>
                        <div style={{ fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.status === 'Alive' ? '#4CAF50' : '#f44336', display: 'inline-block' }}></span>
                          {p.status}
                          {isRevivalLocked && p.lastAnswer && <span style={{ color: '#2196F3', fontSize: '11px', fontWeight: 'bold' }}>(Đã nộp)</span>}
                        </div>
                      </div>
                    </div>
                    {p.status === 'Alive' && !isRevivalLocked && (
                      <button onClick={(e) => { e.stopPropagation(); killPlayer(p.id); }} style={{ background: '#f44336', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: '0.2s' }}>
                        Kill
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default HostView;
