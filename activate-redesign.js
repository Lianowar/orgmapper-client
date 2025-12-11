#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.tsx');
const content = fs.readFileSync(appPath, 'utf8');

const updatedContent = content
  .replace(
    'import ChatPage from \'./features/chat/ChatPage\'',
    'import ChatPageRedesign from \'./features/chat/ChatPageRedesign\''
  )
  .replace(
    '<Route path="/i/:token" element={<ChatPage />} />',
    '<Route path="/i/:token" element={<ChatPageRedesign />} />'
  );

fs.writeFileSync(appPath, updatedContent);
console.log('✅ Chat redesign activated! Old design available at /redesign/:token');
