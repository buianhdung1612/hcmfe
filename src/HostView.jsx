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
  const [gameOver, setGameOver] = useState(false);
  const [winners, setWinners] = useState([]);

  useEffect(() => {
    const pwd = prompt("Nhập mật khẩu Host:");
    if (!pwd) {
      navigate('/');
      return;
    }
    
    socket.emit('become_host', { password: pwd });

    socket.on('host_accepted', (data) => {
      console.log('You are the host now.');
      if (data && data.isRevivalLocked !== undefined) {
        setIsRevivalLocked(data.isRevivalLocked);
      }
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

    socket.on('revival_locked_status', ({ isLocked }) => {
      setIsRevivalLocked(isLocked);
    });

    socket.on('question_timeout', () => {
      setTimeLeft(0);
    });

    socket.on('timer_tick', ({ timeRemaining }) => {
      setTimeLeft(timeRemaining);
    });

    socket.on('game_over', ({ winners: w }) => {
      setWinners(w);
      setGameOver(true);
    });

    return () => {
      socket.off('host_accepted');
      socket.off('host_rejected');
      socket.off('player_joined');
      socket.off('player_status_updated');
      socket.off('player_revived');
      socket.off('revival_locked_status');
      socket.off('question_timeout');
      socket.off('timer_tick');
      socket.off('game_over');
    };
  }, [navigate]);

  // Removed local countdown – time synced from server via timer_tick

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

  const endGame = () => {
    if (window.confirm('Kết thúc trò chơi? Người còn sống sẽ thắng!')) {
      socket.emit('end_game');
    }
  };

  const skipQuestion = () => {
    socket.emit('skip_question');
    setTimeLeft(0);
  };

  if (gameOver) {
    const nobodyWins = winners.length === 0;

    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ background: 'white', borderRadius: '24px', padding: '60px 40px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxWidth: '500px', width: '90%' }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>{nobodyWins ? '💀' : '🏆'}</div>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px' }}>TRÒ CHƠI KẾT THÚC!</h1>
          <p style={{ color: '#6b7280', marginBottom: '30px', fontSize: '16px' }}>
            {nobodyWins ? 'Tất cả người chơi đã bị loại. KHÔNG CÓ AI CHIẾN THẮNG!' : 'Người chiến thắng:'}
          </p>
          {winners.map((name, i) => (
            <div key={i} style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', borderRadius: '16px', padding: '16px 24px', fontSize: '28px', fontWeight: 'bold', marginBottom: '12px' }}>
              🏅 {name}
            </div>
          ))}
          <button onClick={() => { socket.emit('end_game'); window.location.href = '/'; }} style={{ marginTop: '30px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', padding: '14px 32px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            Quay về Trang Chủ
          </button>
        </div>
      </div>
    );
  }


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
                    <span key={p.id} style={{ background: '#e0e7ff', padding: '5px 15px', borderRadius: '20px', color: '#4f46e5', fontWeight: 'bold' }}>
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
      <div className="quiz-time">HOST CONTROL</div>
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
          <div className="data-design-main">
            <div className="question-change-number">
              <p>Câu hỏi: <span className="changing">{currentQuestionIndex + 1 < 10 ? `0${currentQuestionIndex + 1}` : currentQuestionIndex + 1}</span> out of {questions.length < 10 ? `0${questions.length}` : questions.length}</p>
            </div>
            <div className="steps" style={{ display: 'block' }}>
              <div className="question-main-auto">
                <div className="title-question">Câu {currentQuestionIndex + 1}: {currentQ?.text}</div>
                {timeLeft === 0 && (
                  <div style={{ background: 'white', border: '1px solid #eaeaea', borderRadius: '16px', padding: '40px 20px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', maxWidth: '400px', margin: '20px auto 0 auto' }}>
                    <p style={{ fontSize: '15px', color: '#6b7280', fontWeight: 'bold', marginBottom: '25px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Đáp án đúng
                    </p>
                    {currentQ?.answer === 'True' ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                        <div style={{ width: '56px', height: '56px', background: '#e6f4ea', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 8px rgba(76,175,80,0.1)' }}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 13L9 17L19 7" stroke="#1e8e3e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e8e3e' }}>Đúng (True)</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                        <div style={{ width: '56px', height: '56px', background: '#fce8e6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 8px rgba(244,67,54,0.1)' }}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="#d93025" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#d93025' }}>Sai (False)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="button-deta-design" style={{ display: 'flex', gap: '10px' }}>
              <button className="next-data" id="next" onClick={handleNextQuestion} style={{ flex: 1 }}>
                Chuyển câu tiếp theo
              </button>
              {timeLeft > 0 && (
                <button
                  onClick={skipQuestion}
                  title="Tua nhanh - kết thúc câu ngay"
                  style={{ padding: '10px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px' }}
                >
                  ⏩
                </button>
              )}
            </div>
          </div>

          {/* RIGHT FLOATING SIDEBAR */}
          <div style={{ position: 'fixed', right: '20px', top: '20px', bottom: '20px', width: '420px', background: 'rgba(255, 255, 255, 0.95)', borderRadius: '24px', padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', zIndex: 100, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', backdropFilter: 'blur(10px)' }}>
            
            {/* Stage Management */}
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 2V22M4 4H15C16.1046 4 17 4.89543 17 6C17 7.10457 16.1046 8 15 8H4M15 8L18 10L15 12V8Z" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ flex: 1 }}>Stage Management</span>
                {isRevivalLocked && (
                  <button
                    onClick={endGame}
                    title="Kết thúc trò chơi"
                    style={{ background: '#dc2626', border: 'none', borderRadius: '8px', color: 'white', padding: '4px 12px', cursor: 'pointer', fontSize: '16px' }}
                  >
                    🏁
                  </button>
                )}
              </h3>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <div style={{ flex: 1, border: isRevivalLocked ? '1px solid #e5e7eb' : '2px solid #3b82f6', background: isRevivalLocked ? '#f9fafb' : '#eff6ff', borderRadius: '12px', padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: isRevivalLocked ? '#6b7280' : '#1f2937', fontSize: '14px', whiteSpace: 'nowrap' }}>
                    {isRevivalLocked ? <span style={{ color: '#10b981' }}>✔</span> : <span style={{ width: '16px', height: '16px', background: '#3b82f6', borderRadius: '50%', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>✔</span>} 
                    Qualifying Round
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <span style={{ fontSize: '12px', border: isRevivalLocked ? '1px solid #10b981' : 'none', background: isRevivalLocked ? '#d1fae5' : 'transparent', color: isRevivalLocked ? '#059669' : 'transparent', padding: '2px 8px', borderRadius: '4px' }}>
                      {isRevivalLocked ? 'Completed' : ''}
                    </span>
                  </div>
                </div>

                <div style={{ flex: 1, border: isRevivalLocked ? '2px solid #3b82f6' : '1px solid #e5e7eb', background: isRevivalLocked ? '#eff6ff' : '#f9fafb', borderRadius: '12px', padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: isRevivalLocked ? '#1f2937' : '#6b7280', fontSize: '14px', whiteSpace: 'nowrap' }}>
                    {isRevivalLocked ? <span style={{ width: '16px', height: '16px', background: '#3b82f6', borderRadius: '50%', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>✔</span> : <span>🔒</span>}
                    Final Round
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <span style={{ fontSize: '12px', background: isRevivalLocked ? 'transparent' : '#f3f4f6', border: isRevivalLocked ? 'none' : '1px solid #d1d5db', color: isRevivalLocked ? 'transparent' : '#6b7280', padding: '2px 8px', borderRadius: '4px' }}>
                      {isRevivalLocked ? '' : 'Locked'}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={toggleRevivalLock} 
                disabled={timeLeft > 0}
                style={{ width: '100%', padding: '12px', background: timeLeft > 0 ? '#9ca3af' : (isRevivalLocked ? '#4b5563' : '#3b82f6'), color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: timeLeft > 0 ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: '0.2s' }}
              >
                {isRevivalLocked ? 'Deactivate Final Round' : '▶ Activate Final Round'}
              </button>

              <button
                onClick={endGame}
                disabled={timeLeft > 0}
                style={{ width: '100%', padding: '12px', background: timeLeft > 0 ? '#9ca3af' : '#dc2626', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: timeLeft > 0 ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: '0.2s' }}
              >
                🏁 Kết Thúc Trò ChƠi
              </button>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '0' }} />

            {/* Player List */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 11C18.2091 11 20 9.20914 20 7C20 4.79086 18.2091 3 16 3C13.7909 3 12 4.79086 12 7C12 9.20914 13.7909 11 16 11Z" fill="#1f2937"/>
                    <path d="M16 13C12.6863 13 10 15.6863 10 19V21H22V19C22 15.6863 19.3137 13 16 13Z" fill="#1f2937"/>
                    <path d="M8 11C9.65685 11 11 9.65685 11 8C11 6.34315 9.65685 5 8 5C6.34315 5 5 6.34315 5 8C5 9.65685 6.34315 11 8 11Z" fill="#9ca3af"/>
                    <path d="M8 13C5.79086 13 4 14.7908 4 17V19H8V18.1C8 16.7112 8.44149 15.4243 9.19163 14.3736C8.82512 14.1352 8.42398 13.9431 8 13.8247V13Z" fill="#9ca3af"/>
                  </svg>
                  Player List
                </h3>
                <span style={{ fontSize: '12px', background: '#f3f4f6', color: '#4b5563', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold' }}>
                  {players.length < 10 ? `0${players.length}` : players.length} Players
                </span>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '5px' }}>
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
                      <button
                        onClick={(e) => { e.stopPropagation(); killPlayer(p.id); }}
                        disabled={timeLeft > 0}
                        style={{ background: timeLeft > 0 ? '#9ca3af' : '#f44336', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '8px', cursor: timeLeft > 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '13px', transition: '0.2s' }}
                      >
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
