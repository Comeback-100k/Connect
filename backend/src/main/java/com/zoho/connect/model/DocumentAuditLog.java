package com.zoho.connect.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "document_audit_logs")
public class DocumentAuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long documentId;
    private String documentTitle;
    
    @Column(nullable = false)
    private String action; // UPLOAD, DELETE, MOVE, RENAME, CREATE_FOLDER
    
    private Long userId;
    private String userName;

    private LocalDateTime timestamp;
    
    @Column(length = 1000)
    private String details;

    public DocumentAuditLog() {}

    public DocumentAuditLog(Long documentId, String documentTitle, String action, Long userId, String userName, LocalDateTime timestamp, String details) {
        this.documentId = documentId;
        this.documentTitle = documentTitle;
        this.action = action;
        this.userId = userId;
        this.userName = userName;
        this.timestamp = timestamp;
        this.details = details;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }
    
    public String getDocumentTitle() { return documentTitle; }
    public void setDocumentTitle(String documentTitle) { this.documentTitle = documentTitle; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}
