# Chat Engine
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.1 and node JS version v20.11.0

## Overview
This is a real-time chat application backend built with Node.js. It allows:

- Users to join different chat rooms
- Send messages in real-time to everyone in the room
- Search through message history
- Store messages for long-term retrieval

## Key Technologies:
- Node.js/Express: The web server framework
- Socket.IO: For real-time communication between clients
- Redis: For pub/sub messaging and recent message storage
- Elasticsearch: For message indexing and searching

## How It Works - Core Functionality

1. <b>Real-time Communication:</b> 
When a user sends a message, it's:
- Broadcast to all users in the same room immediately
- Stored in Redis for short-term history
- Indexed in Elasticsearch for search capabilities

2. <b>Room Management:</b> Users can join different chat rooms and receive only messages from that room.
3. <b>Message Retrieval:</b> When a user joins a room, they automatically receive recent messages.
4. <b>Search:</b> Users can search for messages by keywords within a specific room.

## Component Breakdown
1. <b>server.js</b> (Main Entry Point)
This file initializes the application:

- Sets up Express server and middleware
- Configures Socket.IO
- Connects to databases (Redis and Elasticsearch)
- Starts the server and handles errors

2. <b>Configuration Files</b> (config/)
- server.js: Server configuration like port and CORS settings
- database.js: Database connection settings and parameters

3. <b>Database Services</b> (services/)

- redis.js:
    - Manages real-time message distribution
    - Stores recent messages (last 100 per room)
    - Handles pub/sub for real-time updates


- elasticsearch.js:
    - Indexes messages for full-text search
    - Provides search functionality
    - Maintains schema for message documents


4. Socket Handlers (socket/chat-handler.js): 
Manages real-time events like:

- User joining a room
- Sending messages
- Searching for messages
- User disconnection

5. API Routes (routes/api.js)
Provides HTTP endpoints for:

- Searching messages via REST API
- Health checks

6. Utilities (utils/logger.js)
Provides consistent logging throughout the application.

## Data Flow
When a user sends a message, here's what happens:
- Client sends a "chat message" event via Socket.IO
- Server receives it in the chat handler
- Message is:
    - Stored in Redis (for recent history)
    - Indexed in Elasticsearch (for search)
    - Published to Redis channel (for real-time distribution)


- Redis subscriber receives the published message
- Message is broadcast to all connected clients in that room
- Other clients receive the message in real-time

## Use Cases
### New User Joins a Room:
- User connects via Socket.IO
- Sends "join room" event with username and room ID
- Server adds user to that room
- Server fetches recent messages from Redis
- Server sends message history to the new user
- Other users in the room are notified


### User Sends a Message:
- User sends "chat message" event with content and room ID
- Message is processed, stored, and distributed
- All users in the room receive it instantly


### User Searches for Messages:
- User sends "search messages" event with query and room ID
- Server searches Elasticsearch
- Results are returned to the requesting user


### REST API Access:
- External systems can search messages via HTTP endpoint
- Results returned as JSON


This architecture is highly scalable - Redis handles real-time messaging which can scale horizontally, while Elasticsearch provides powerful search capabilities across all historical messages.