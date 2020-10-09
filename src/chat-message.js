import React from 'react';
import { connect } from 'react-redux';

function ChatMessage({ chatMessage }) {
  return (
    <div className="chat-msg-wrapper">
      {chatMessage.map(({ key, data }) => (
        <div key={key}><span className="chat-msg">{data}</span></div>
      ))}
    </div>
  );
}

export default connect(state => ({
  chatMessage: state.chatMessage,
}))(ChatMessage);