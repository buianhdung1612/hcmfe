import React, { useState, useEffect } from 'react';
import { socket } from './socket';

function PlayerView() {
  const [step, setStep] = useState('login'); // login, lobby, alive, dead
  const [playerName, setPlayerName] = useState('');
  
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isRevivalLocked, setIsRevivalLocked] = useState(false);
  const [submittedAnonymous, setSubmittedAnonymous] = useState(false);

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
      setSubmittedAnonymous(false);
    });

    socket.on('answer_result', ({ isCorrect, streak }) => {
      setStreak(streak);
      setFeedback(isCorrect ? 'correct' : 'wrong');
    });

    socket.on('you_are_revived', () => {
      setStep('alive');
      setStreak(0);
      alert('Tuyệt vời! Bạn đã được HỒI SINH!');
    });

    socket.on('answer_submitted_anonymous', () => {
      setSubmittedAnonymous(true);
    });

    socket.on('question_timeout', () => {
      if (!isRevivalLocked && step === 'dead') {
        setFeedback('timeout');
        setStreak(0);
      } else if (isRevivalLocked && !submittedAnonymous) {
        setFeedback('timeout');
      }
    });

    socket.on('host_disconnected', () => {
      alert("Host đã thoát game. Trò chơi kết thúc!");
      window.location.reload();
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
      socket.off('answer_submitted_anonymous');
      socket.off('question_timeout');
      socket.off('host_disconnected');
    };
  }, [step, isRevivalLocked, submittedAnonymous]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const joinRoom = () => {
    if (playerName) {
      socket.emit('join_game', { playerName });
    }
  };

  const submitAnswer = (answer) => {
    if (feedback || timeLeft <= 0 || submittedAnonymous) return;
    socket.emit('submit_answer', { answer });
  };

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
          <p className="time-data">00:<span id="runing-data">{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span></p>
          <div className="data-design-main">
            <div className="question-change-number">
              {isRevivalLocked ? (
                <p>Trạng Thái: <span className="changing" style={{ color: '#4CAF50' }}>VÒNG CHUNG KẾT</span></p>
              ) : step === 'alive' ? (
                <p>Trạng Thái: <span className="changing" style={{ color: '#4CAF50' }}>BẠN ĐANG SỐNG</span></p>
              ) : (
                <p>Trạng Thái: <span className="changing" style={{ color: '#f44336' }}>ĐÃ CHẾT</span> | Trả lời nhanh nhất để Hồi sinh!</p>
              )}
            </div>
            
            {!currentQuestion ? (
               <div style={{ textAlign: 'center', padding: '50px 20px', color: '#555' }}>
                  <h3>Đang chờ câu hỏi tiếp theo...</h3>
               </div>
            ) : (
              <div className="steps" style={{ display: 'block' }}>
                <div className="question-main-auto">
                  <div className="title-question">{currentQuestion.text}</div>
                </div>
                
                {step === 'alive' && !isRevivalLocked ? (
                  <div style={{ padding: '30px', textAlign: 'center', borderRadius: '15px', border: '2px solid #4CAF50' }}>
                    <h2 style={{ color: '#4CAF50' }}>Hãy chơi Offline theo hiệu lệnh của Host!</h2>
                  </div>
                ) : submittedAnonymous ? (
                  <div style={{ padding: '30px', textAlign: 'center', borderRadius: '15px', border: '2px solid #2196F3' }}>
                    <h2 style={{ color: '#2196F3' }}>Đã nộp bài! Đợi kết quả từ Host...</h2>
                  </div>
                ) : feedback ? (
                  <div style={{ padding: '30px', textAlign: 'center', borderRadius: '15px', border: `2px solid ${feedback === 'correct' ? '#4CAF50' : '#f44336'}` }}>
                    <h2 style={{ color: feedback === 'correct' ? '#4CAF50' : '#f44336' }}>
                      {feedback === 'correct' ? '✅ CHÍNH XÁC!' : feedback === 'wrong' ? '❌ SAI RỒI!' : '⏰ HẾT GIỜ!'}
                    </h2>
                  </div>
                ) : (
                  <div className="row option-design">
                    <div className="col-lg-6 col-md-6 col-12">
                      <div 
                        className="option-selected"
                        onClick={() => submitAnswer('True')}
                        style={{ cursor: 'pointer', textAlign: 'center' }}
                      >
                        True
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6 col-12">
                      <div 
                        className="option-selected"
                        onClick={() => submitAnswer('False')}
                        style={{ cursor: 'pointer', textAlign: 'center' }}
                      >
                        False
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerView;
