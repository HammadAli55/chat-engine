document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginContainer = document.getElementById('login-container');
    const chatContainer = document.getElementById('chat-container');
    const roomTitle = document.getElementById('room-title');
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const joinBtn = document.getElementById('join-btn');
    const usernameInput = document.getElementById('username');
    const roomInput = document.getElementById('room');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchResults = document.getElementById('search-results');
    const searchResultsList = document.getElementById('search-results-list');
    const closeSearchBtn = document.getElementById('close-search');
    
    // Connect to Socket.io server - explicitly specify the URL
    const socket = io('http://localhost:3000');
    
    // Client state
    let currentUser = '';
    let currentRoom = '';
    
    // Event listeners
    joinBtn.addEventListener('click', joinRoom);
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
    searchBtn.addEventListener('click', searchMessages);
    closeSearchBtn.addEventListener('click', () => {
      searchResults.style.display = 'none';
    });
    
    // Join a room
    function joinRoom() {
      const username = usernameInput.value.trim();
      const room = roomInput.value.trim();
      
      if (!username || !room) {
        alert('Please enter both username and room name');
        return;
      }
      
      currentUser = username;
      currentRoom = room;
      
      // Send join event to server
      socket.emit('join room', { username, room });
      
      // Update UI
      loginContainer.style.display = 'none';
      chatContainer.style.display = 'flex';
      roomTitle.textContent = `Room: ${room}`;
      
      // Focus on message input
      messageInput.focus();
    }
    
    // Send a message
    function sendMessage() {
      const message = messageInput.value.trim();
      
      if (!message) return;
      
      // Send message to server
      socket.emit('chat message', {
        username: currentUser,
        message,
        room: currentRoom
      });
      
      // Clear input
      messageInput.value = '';
      messageInput.focus();
    }
    
    // Search messages
    function searchMessages() {
      const query = searchInput.value.trim();
      
      if (!query) return;
      
      // Send search request to server
      socket.emit('search messages', {
        query,
        room: currentRoom
      });
    }
    
    // Display a message
    function displayMessage(data) {
      const messageElement = document.createElement('div');
      const isCurrentUser = data.username === currentUser;
      const isSystem = data.username === 'System';
      
      // Set message class based on sender
      if (isSystem) {
        messageElement.className = 'message system';
      } else if (isCurrentUser) {
        messageElement.className = 'message sent';
      } else {
        messageElement.className = 'message received';
      }
      
      // Format timestamp
      const timestamp = new Date(data.timestamp).toLocaleTimeString();
      
      // Set message content
      messageElement.innerHTML = `
        ${!isSystem ? `<div class="username">${data.username}</div>` : ''}
        <div class="content">${data.message}</div>
        <div class="timestamp">${timestamp}</div>
      `;
      
      // Add message to container
      messagesContainer.appendChild(messageElement);
      
      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Display search results
    function displaySearchResults(results) {
      // Clear previous results
      searchResultsList.innerHTML = '';
      
      if (results.length === 0) {
        searchResultsList.innerHTML = '<p>No results found</p>';
        searchResults.style.display = 'block';
        return;
      }
      
      // Create elements for each result
      results.forEach(result => {
        const resultElement = document.createElement('div');
        resultElement.className = 'message received';
        
        const timestamp = new Date(result.timestamp).toLocaleString();
        
        resultElement.innerHTML = `
          <div class="username">${result.username}</div>
          <div class="content">${result.message}</div>
          <div class="timestamp">${timestamp}</div>
        `;
        
        searchResultsList.appendChild(resultElement);
      });
      
      // Show search results
      searchResults.style.display = 'block';
    }
    
    // Socket event handlers
    socket.on('connect', () => {
      console.log('Connected to server');
    });
    
    socket.on('chat message', (data) => {
      displayMessage(data);
    });
    
    socket.on('user joined', (data) => {
      displayMessage(data);
    });
    
    socket.on('room history', (messages) => {
      messages.forEach(msg => displayMessage(msg));
    });
    
    socket.on('search results', (results) => {
      displaySearchResults(results);
    });
    
    socket.on('search error', (error) => {
      alert('Search failed: ' + error.message);
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  });