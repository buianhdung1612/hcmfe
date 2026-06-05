import React, { useState, useEffect } from 'react';
import { socket } from './socket';

function PlayerView() {
  const [step, setStep] = useState('login');
  const [playerName, setPlayerName] = useState('');
  
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isRevivalLocked, setIsRevivalLocked] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winners, setWinners] = useState([]);
  const [myName, setMyName] = useState('');
  const [reviveNotification, setReviveNotification] = useState(false);

  useEffect(() => {
    socket.on('joined_success', (data) => {
      setStep('lobby');
      setIsRevivalLocked(data.isRevivalLocked || false);
    });

    socket.on('error', (msg) => alert(msg));

    socket.on('game_started', () => {
      // If we are in lobby, we become alive by default
      setStep(prev => prev === 'lobby' ? 'alive' : prev);
    });

    socket.on('you_are_dead', () => {
      setStep('dead');
      setFeedback(null);
      setCurrentQuestion(null);
    });

    socket.on('revival_locked_status', ({ isLocked }) => {
      setIsRevivalLocked(isLocked);
    });

    socket.on('new_question', ({ questionIndex, questionData, timeLimit }) => {
      setCurrentQuestion(questionData);
      setTimeLeft(timeLimit);
      setFeedback(null);
      setSelectedAnswer(null);
    });

    socket.on('answer_result', ({ isCorrect, streak }) => {
      setStreak(streak);
      setFeedback(isCorrect ? 'correct' : 'wrong');
    });

    socket.on('you_are_revived', () => {
      setStep('alive');
      setStreak(0);
      setReviveNotification(true);
      setTimeout(() => setReviveNotification(false), 3000);
    });

    socket.on('answer_submitted_anonymous', () => {
      setSubmittedAnonymous(true);
    });

    socket.on('question_timeout', () => {
      if (step === 'dead' && !isRevivalLocked) {
        setFeedback('timeout');
        setStreak(0);
      }
    });

    socket.on('host_disconnected', () => {
      alert("Host đã thoát game. Trò chơi kết thúc!");
      window.location.reload();
    });

    socket.on('game_over', ({ winners: w }) => {
      setWinners(w);
      setGameOver(true);
    });

    return () => {
      socket.off('joined_success');
      socket.off('error');
      socket.off('game_started');
      socket.off('you_are_dead');
      socket.off('revival_locked_status');
      socket.off('new_question');
      socket.off('answer_result');
      socket.off('you_are_revived');
      socket.off('question_timeout');
      socket.off('host_disconnected');
      socket.off('game_over');
    };
  }, [step, isRevivalLocked]);

  const joinRoom = () => {
    if (playerName) {
      setMyName(playerName);
      socket.emit('join_game', { playerName });
    }
  };

  const submitAnswer = (answer) => {
    if (feedback || selectedAnswer || timeLeft <= 0) return;
    setSelectedAnswer(answer);
    socket.emit('submit_answer', { answer });
  };

  if (gameOver) {
    const isWinner = winners.includes(myName);
    const nobodyWins = winners.length === 0;

    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isWinner ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #374151 0%, #111827 100%)' }}>
        <div style={{ background: 'white', borderRadius: '24px', padding: '60px 40px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxWidth: '500px', width: '90%' }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>{isWinner ? '🏆' : '💀'}</div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px' }}>
            {nobodyWins ? 'KHÔNG CÓ AI CHIẾN THẮNG!' : isWinner ? 'BẠN ĐÃ THẮNG!' : 'TRÒ CHƠI KẾT THÚC'}
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            {nobodyWins ? 'Tất cả người chơi đã bị loại.' : isWinner ? '🎉 Chúc mừng! Bạn là người chiến thắng!' : 'Người chiến thắng:'}
          </p>
          {winners.map((name, i) => (
            <div key={i} style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', borderRadius: '12px', padding: '12px 24px', fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>
              🏅 {name}
            </div>
          ))}
          <button onClick={() => window.location.href = '/'} style={{ marginTop: '30px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', padding: '14px 32px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            Quay về Trang Chủ
          </button>
        </div>
      </div>
    );
  }

  if (step === 'login' || step === 'lobby') {
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
                <div className="fixed-data-top">{step === 'login' ? 'VÀO GAME' : 'ĐANG CHỜ'}</div>
                <p className="fixed-desc">{step === 'login' ? 'Nhập tên để tham gia' : `Chờ Host bắt đầu game...`}</p>
              </div>
              
              {step === 'login' && (
                <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                  <input 
                    placeholder="Tên của bạn" 
                    value={playerName} 
                    onChange={e => setPlayerName(e.target.value)} 
                    style={{ padding: '15px', width: '300px', borderRadius: '50px', border: '1px solid #ccc', textAlign: 'center', fontSize: '18px', color: '#000' }}
                  />
                </div>
              )}
            </div>
            
            {step === 'login' && (
              <div className="main-button-data" style={{ marginTop: '30px' }}>
                <div className="button-top-all-design" onClick={joinRoom} style={{ cursor: 'pointer' }}>
                  <p>Tham Gia Game</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // Bỏ giao diện BẠN ĐANG SỐNG (màn hình xanh), gộp chung xuống dưới

  // DEAD VIEW or FINAL ROUND (isRevivalLocked)
  return (
    <>
      <div className="data-design-svg">
        <div className="right-tree">
          <img src="/assets/images/hero/image-main/Mask.svg" alt="tree-right" />
        </div>
      </div>
      <div className="main" style={{ display: 'block' }}>
      <div className="quiz-time">QUIZ TIME</div>
      <div className="container">
        <div className="header-data">
          <div className="logo-design">
            <a className='logo-data' href='#'>
              <img src="/assets/images/Logo/logo.svg" alt="logo" />
            </a>
          </div>
        </div>
        
        <div className="question-data">
          {/* Timer hiện trên màn hình Host, Player không cần hiện */}
          <div className="data-design-main">
            <div className="question-change-number">
              {isRevivalLocked ? (
                <p>Trạng Thái: <span className="changing" style={{ color: '#4CAF50' }}>VÒNG CHUNG KẾT</span></p>
              ) : step === 'lobby' ? (
                <p>Trạng Thái: <span className="changing" style={{ color: '#ff9800' }}>SẢNH CHỜ</span></p>
              ) : step === 'alive' ? (
                <p>Trạng Thái: <span className="changing" style={{ color: '#4CAF50' }}>BẠN ĐANG SỐNG</span></p>
              ) : (
                <p>Trạng Thái: <span className="changing" style={{ color: '#f44336' }}>ĐÃ CHẾT</span> | Trả lời nhanh nhất để Hồi sinh!</p>
              )}
            </div>
            
            {step === 'lobby' ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: '#555' }}>
                <h3>Đang chờ Host bắt đầu trò chơi...</h3>
              </div>
            ) : step === 'dead' && !currentQuestion ? (
               <div style={{ textAlign: 'center', padding: '50px 20px', color: '#f44336' }}>
                  <h3>💀 BẠN ĐÃ BỊ LOẠI</h3>
                  {isRevivalLocked ? <p>Vòng Chung Kết - Không có hồi sinh</p> : <p>Chờ câu sau để Hồi sinh!</p>}
               </div>
            ) : !currentQuestion ? (
               <div style={{ textAlign: 'center', padding: '50px 20px', color: '#555' }}>
                  <h3>Đang chờ câu hỏi tiếp theo...</h3>
               </div>
            ) : (
              <div className="steps" style={{ display: 'block' }}>
                <div className="question-main-auto">
                  <div className="title-question">{currentQuestion.text}</div>
                </div>
                
                {/* VÒNG LOẠI - ALIVE: chơi offline */}
                {step === 'alive' && !isRevivalLocked ? (
                  <div style={{ padding: '30px', textAlign: 'center', borderRadius: '15px', border: '2px solid #4CAF50' }}>
                    <h2 style={{ color: '#4CAF50' }}>Hãy chơi Offline theo hiệu lệnh của Host!</h2>
                  </div>

                ) : step === 'dead' && isRevivalLocked ? (
                  /* VÒNG CHUNG KẾT - DEAD: bị loại hoàn toàn */
                  <div style={{ padding: '30px', textAlign: 'center', borderRadius: '15px', border: '2px solid #f44336', background: 'rgba(244,67,54,0.05)' }}>
                    <h2 style={{ color: '#f44336' }}>💀 BẠN ĐÃ BỊ LOẠI</h2>
                    <p style={{ color: '#888' }}>Vòng Chung Kết - Không có hồi sinh</p>
                  </div>


                ) : feedback ? (
                  /* Hiện kết quả */
                  <div style={{ padding: '30px', textAlign: 'center', borderRadius: '15px', border: `2px solid ${feedback === 'correct' ? '#4CAF50' : '#f44336'}` }}>
                    <h2 style={{ color: feedback === 'correct' ? '#4CAF50' : '#f44336' }}>
                      {feedback === 'correct' ? '✅ CHÍNH XÁC!' : feedback === 'wrong' ? '❌ SAI RỒI!' : '⏰ HẾT GIỜ!'}
                    </h2>
                  </div>

                ) : (
                  <div className="row option-design">
                    {['True', 'False'].map(opt => {
                      const isSelected = selectedAnswer === opt;
                      const isCorrect = feedback === 'correct' && isSelected;
                      const isWrong = feedback === 'wrong' && isSelected;
                      return (
                        <div key={opt} className="col-lg-6 col-md-6 col-12">
                          <div
                            className="option-selected"
                            onClick={() => submitAnswer(opt)}
                            style={{
                              cursor: selectedAnswer ? 'default' : 'pointer',
                              textAlign: 'center',
                              border: isCorrect ? '3px solid #4CAF50' : isWrong ? '3px solid #f44336' : isSelected ? '3px solid #2196F3' : undefined,
                              background: isCorrect ? 'rgba(76,175,80,0.15)' : isWrong ? 'rgba(244,67,54,0.15)' : isSelected ? 'rgba(33,150,243,0.1)' : undefined,
                              transform: isSelected ? 'scale(1.03)' : undefined,
                              transition: '0.2s',
                              fontWeight: isSelected ? 'bold' : undefined,
                              fontSize: isSelected ? '20px' : undefined
                            }}
                          >
                            {isCorrect ? '✅ ' : isWrong ? '❌ ' : isSelected ? '👉 ' : ''}{opt}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
      {reviveNotification && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#4CAF50', color: 'white', padding: '15px 30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', zIndex: 1000, fontWeight: 'bold', fontSize: '18px' }}>
          Tuyệt vời! Bạn đã được HỒI SINH! 🎉
        </div>
      )}
    </>
  );
}

export default PlayerView;
