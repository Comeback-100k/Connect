package com.zoho.connect.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2000)
    private String content;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    private Long recipientId; // Null if it's a Group Message
    private Long groupId;     // Null if it's a Direct Message

    @Column(columnDefinition = "CLOB")
    private String attachmentsJson; // Stores base64 attachments or file info

    private String deliveryStatus = "DELIVERED";
    private boolean readStatus = false;

    private LocalDateTime createdAt;
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }
    public Long getRecipientId() { return recipientId; }
    public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }
    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }
    public String getAttachmentsJson() { return attachmentsJson; }
    public void setAttachmentsJson(String attachmentsJson) { this.attachmentsJson = attachmentsJson; }
    public String getDeliveryStatus() { return deliveryStatus; }
    public void setDeliveryStatus(String deliveryStatus) { this.deliveryStatus = deliveryStatus; }
    public boolean getReadStatus() { return readStatus; }
    public void setReadStatus(boolean readStatus) { this.readStatus = readStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Message() {}

    public Message(Long id, String content, User sender, Long recipientId, Long groupId, String attachmentsJson, String deliveryStatus, boolean readStatus, LocalDateTime createdAt) {
        this.id = id;
        this.content = content;
        this.sender = sender;
        this.recipientId = recipientId;
        this.groupId = groupId;
        this.attachmentsJson = attachmentsJson;
        this.deliveryStatus = deliveryStatus;
        this.readStatus = readStatus;
        this.createdAt = createdAt;
    }

    public static MessageBuilder builder() { return new MessageBuilder(); }
    public static class MessageBuilder {
        private Long id;
        private String content;
        private User sender;
        private Long recipientId;
        private Long groupId;
        private String attachmentsJson;
        private String deliveryStatus = "DELIVERED";
        private boolean readStatus = false;
        private LocalDateTime createdAt;
        public MessageBuilder id(Long id) { this.id = id; return this; }
        public MessageBuilder content(String content) { this.content = content; return this; }
        public MessageBuilder sender(User sender) { this.sender = sender; return this; }
        public MessageBuilder recipientId(Long recipientId) { this.recipientId = recipientId; return this; }
        public MessageBuilder groupId(Long groupId) { this.groupId = groupId; return this; }
        public MessageBuilder attachmentsJson(String attachmentsJson) { this.attachmentsJson = attachmentsJson; return this; }
        public MessageBuilder deliveryStatus(String deliveryStatus) { this.deliveryStatus = deliveryStatus; return this; }
        public MessageBuilder readStatus(boolean readStatus) { this.readStatus = readStatus; return this; }
        public MessageBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Message build() {
            Message obj = new Message();
            obj.id = this.id;
            obj.content = this.content;
            obj.sender = this.sender;
            obj.recipientId = this.recipientId;
            obj.groupId = this.groupId;
            obj.attachmentsJson = this.attachmentsJson;
            obj.deliveryStatus = this.deliveryStatus;
            obj.readStatus = this.readStatus;
            obj.createdAt = this.createdAt;
            return obj;
        }
    }
}
