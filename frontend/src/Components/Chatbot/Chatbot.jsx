import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText,
  styled,
  keyframes
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import chatbotIcon from '../Assets/chatIcon.png';
import './Chatbot.css';
// Animation definitions
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeInUp = keyframes`
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled components
const ChatButton = styled(Button)(({ theme }) => ({
  borderRadius: '50%',
  width: 60,
  height: 60,
  minWidth: 0,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  boxShadow: theme.shadows[3],
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    animation: `${pulse} 1.5s infinite`,
  },
  transition: 'all 0.3s ease',
}));

const ChatWindow = styled(Paper)(({ theme }) => ({
  width: 320,
  height: 450,
  display: 'flex',
  flexDirection: 'column',
  boxShadow: theme.shadows[6],
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  animation: `${fadeInUp} 0.3s ease-out forwards`,
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const MessageContainer = styled(Box)({
  flexGrow: 1,
  overflowY: 'auto',
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  background: 'linear-gradient(180deg, #f9f9f9 0%, #ffffff 100%)',
});

const MessageBubble = styled(Paper)(({ theme, isuser }) => ({
  padding: theme.spacing(1.5),
  maxWidth: '80%',
  borderRadius: isuser === 'true' 
    ? '18px 18px 4px 18px' 
    : '18px 18px 18px 4px',
  backgroundColor: isuser === 'true' 
    ? theme.palette.primary.main 
    : theme.palette.grey[100],
  color: isuser === 'true' 
    ? theme.palette.common.white 
    : theme.palette.text.primary,
  wordWrap: 'break-word',
  boxShadow: theme.shadows[1],
  animation: `${fadeIn} 0.3s ease`,
}));

const QuestionsPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

const TypingIndicator = styled(Box)(({ theme }) => ({
  display: 'inline-block',
  '& span': {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: theme.palette.text.secondary,
    margin: '0 2px',
    animation: `${pulse} 1.4s infinite ease-in-out`,
    '&:nth-of-type(2)': {
      animationDelay: '0.2s',
    },
    '&:nth-of-type(3)': {
      animationDelay: '0.4s',
    },
  },
}));

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm here to help. Please select one of the common questions below.", isUser: false }
  ]);
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch predefined questions on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:4000/api/chatbot/questions');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setQuestions(data);
        setInitialized(true);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setMessages(prev => [
          ...prev,
          { text: "Sorry, I'm having trouble loading questions. Please try again later.", isUser: false }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!initialized) {
      fetchQuestions();
    }
  }, [initialized]);

  // Handle question selection
  const handleQuestionClick = async (questionId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:4000/api/chatbot/answer/${questionId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const { answer } = await response.json();
      const selectedQuestion = questions.find(q => q.id === questionId)?.question || "Selected question";
      
      setMessages(prev => [
        ...prev,
        { text: selectedQuestion, isUser: true },
        { text: answer, isUser: false }
      ]);
    } catch (error) {
      console.error('Error fetching answer:', error);
      setMessages(prev => [
        ...prev,
        { text: "Sorry, I couldn't retrieve the answer. Please try again later.", isUser: false }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle chatbot visibility
  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 20, 
      right: 20, 
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 2
    }}>
      {isOpen && (
        <ChatWindow>
          <ChatHeader>
            <Typography variant="subtitle1" fontWeight="bold">Gypsy Support</Typography>
            <IconButton 
              onClick={toggleChatbot} 
              size="small" 
              sx={{ color: 'white' }}
              aria-label="Close chatbot"
            >
              <CloseIcon />
            </IconButton>
          </ChatHeader>

          <MessageContainer>
            {messages.map((msg, i) => (
              <Box 
                key={i} 
                sx={{ 
                  alignSelf: msg.isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '80%'
                }}
              >
                <MessageBubble isuser={msg.isUser.toString()}>
                  <Typography variant="body2">{msg.text}</Typography>
                </MessageBubble>
              </Box>
            ))}
            {isLoading && (
              <Box sx={{ alignSelf: 'flex-start' }}>
                <MessageBubble isuser="false">
                  <TypingIndicator>
                    <span></span>
                    <span></span>
                    <span></span>
                  </TypingIndicator>
                </MessageBubble>
              </Box>
            )}
          </MessageContainer>

          <QuestionsPanel>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Common Questions:
            </Typography>
            <List dense sx={{ maxHeight: 120, overflow: 'auto' }}>
              {questions.map((q) => (
                <ListItem 
                  button 
                  key={q.id} 
                  onClick={() => handleQuestionClick(q.id)}
                  disabled={isLoading}
                  sx={{
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    },
                    '&.Mui-disabled': {
                      opacity: 0.7
                    }
                  }}
                >
                  <ListItemText 
                    primary={q.question} 
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </QuestionsPanel>
        </ChatWindow>
      )}
      
      <ChatButton 
        onClick={toggleChatbot}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <img 
          src={chatbotIcon} 
          alt="Chat" 
          style={{ width: 28, height: 28 }} 
        />
      </ChatButton>
    </Box>
  );
};

export default Chatbot;