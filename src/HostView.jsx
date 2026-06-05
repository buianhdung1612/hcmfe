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
          <div className="data-design-main">
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
              
              <div style={{ padding: '20px' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Danh sách Người chơi</h3>
                <div className="row">
                  {players.map(p => (
                    <div className="col-lg-6 col-md-6 col-12" key={p.id} style={{ marginBottom: '15px' }}>
                      <div 
                        className="option-selected" 
                        style={{ 
                          background: p.status === 'Alive' ? '#4CAF50' : '#f44336',
                          color: 'white',
                          border: 'none',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <strong>{p.name}</strong> - {p.status}
                          {isRevivalLocked && p.lastAnswer && <span style={{ marginLeft: '10px', fontSize: '0.8em', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '10px' }}>Đã nộp bài</span>}
                        </div>
                        {p.status === 'Alive' && !isRevivalLocked && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); killPlayer(p.id); }} 
                            style={{ padding: '5px 15px', background: '#000', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                          >
                            Kill
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            <div className="button-deta-design">
              <button className="next-data" id="next" onClick={handleNextQuestion}>
                Chuyển câu tiếp theo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HostView;
