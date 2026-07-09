package com.zoho.connect.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 5000)
    private String content; // Article contents (for MANUAL) or description (for FILE)

    private String type; // "MANUAL", "FILE"
    
    private String fileName; // Real filename
    private String fileType; // extension or icon type
    private Long fileSize; // size in bytes
    private String storedFileName; // filename stored on disk

    @ManyToOne
    @JoinColumn(name = "uploader_id", nullable = false)
    private User uploader;

    private Long recipientId; // Null if public, otherwise only visible to this user and the uploader
    
    private Long parentId; // ID of the parent folder (Document of type FOLDER), null for root

    private LocalDateTime createdAt;
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public String getStoredFileName() { return storedFileName; }
    public void setStoredFileName(String storedFileName) { this.storedFileName = storedFileName; }
    public User getUploader() { return uploader; }
    public void setUploader(User uploader) { this.uploader = uploader; }
    public Long getRecipientId() { return recipientId; }
    public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }

    public Document() {}

    public Document(Long id, String title, String content, String type, String fileName, String fileType, Long fileSize, String storedFileName, User uploader, Long recipientId, Long parentId, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.type = type;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.storedFileName = storedFileName;
        this.uploader = uploader;
        this.recipientId = recipientId;
        this.parentId = parentId;
        this.createdAt = createdAt;
    }

    public static DocumentBuilder builder() { return new DocumentBuilder(); }
    public static class DocumentBuilder {
        private Long id;
        private String title;
        private String content;
        private String type;
        private String fileName;
        private String fileType;
        private Long fileSize;
        private String storedFileName;
        private User uploader;
        private Long recipientId;
        private Long parentId;
        private LocalDateTime createdAt;
        public DocumentBuilder id(Long id) { this.id = id; return this; }
        public DocumentBuilder title(String title) { this.title = title; return this; }
        public DocumentBuilder content(String content) { this.content = content; return this; }
        public DocumentBuilder type(String type) { this.type = type; return this; }
        public DocumentBuilder fileName(String fileName) { this.fileName = fileName; return this; }
        public DocumentBuilder fileType(String fileType) { this.fileType = fileType; return this; }
        public DocumentBuilder fileSize(Long fileSize) { this.fileSize = fileSize; return this; }
        public DocumentBuilder storedFileName(String storedFileName) { this.storedFileName = storedFileName; return this; }
        public DocumentBuilder uploader(User uploader) { this.uploader = uploader; return this; }
        public DocumentBuilder recipientId(Long recipientId) { this.recipientId = recipientId; return this; }
        public DocumentBuilder parentId(Long parentId) { this.parentId = parentId; return this; }
        public DocumentBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Document build() {
            Document obj = new Document();
            obj.id = this.id;
            obj.title = this.title;
            obj.content = this.content;
            obj.type = this.type;
            obj.fileName = this.fileName;
            obj.fileType = this.fileType;
            obj.fileSize = this.fileSize;
            obj.storedFileName = this.storedFileName;
            obj.uploader = this.uploader;
            obj.recipientId = this.recipientId;
            obj.parentId = this.parentId;
            obj.createdAt = this.createdAt;
            return obj;
        }
    }
}
