package com.zoho.connect.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "workflow_requests")
public class WorkflowRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // "LEAVE", "EXPENSE", "IT_SUPPORT"
    
    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    private String status; // "PENDING", "APPROVED", "REJECTED"

    @ManyToOne
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @ManyToOne
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    private String adminComments;
    private LocalDateTime createdAt;
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public User getCreator() { return creator; }
    public void setCreator(User creator) { this.creator = creator; }
    public User getReviewer() { return reviewer; }
    public void setReviewer(User reviewer) { this.reviewer = reviewer; }
    public String getAdminComments() { return adminComments; }
    public void setAdminComments(String adminComments) { this.adminComments = adminComments; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public WorkflowRequest() {}

    public WorkflowRequest(Long id, String type, String title, String description, String status, User creator, User reviewer, String adminComments, LocalDateTime createdAt) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.description = description;
        this.status = status;
        this.creator = creator;
        this.reviewer = reviewer;
        this.adminComments = adminComments;
        this.createdAt = createdAt;
    }

    public static WorkflowRequestBuilder builder() { return new WorkflowRequestBuilder(); }
    public static class WorkflowRequestBuilder {
        private Long id;
        private String type;
        private String title;
        private String description;
        private String status;
        private User creator;
        private User reviewer;
        private String adminComments;
        private LocalDateTime createdAt;
        public WorkflowRequestBuilder id(Long id) { this.id = id; return this; }
        public WorkflowRequestBuilder type(String type) { this.type = type; return this; }
        public WorkflowRequestBuilder title(String title) { this.title = title; return this; }
        public WorkflowRequestBuilder description(String description) { this.description = description; return this; }
        public WorkflowRequestBuilder status(String status) { this.status = status; return this; }
        public WorkflowRequestBuilder creator(User creator) { this.creator = creator; return this; }
        public WorkflowRequestBuilder reviewer(User reviewer) { this.reviewer = reviewer; return this; }
        public WorkflowRequestBuilder adminComments(String adminComments) { this.adminComments = adminComments; return this; }
        public WorkflowRequestBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public WorkflowRequest build() {
            WorkflowRequest obj = new WorkflowRequest();
            obj.id = this.id;
            obj.type = this.type;
            obj.title = this.title;
            obj.description = this.description;
            obj.status = this.status;
            obj.creator = this.creator;
            obj.reviewer = this.reviewer;
            obj.adminComments = this.adminComments;
            obj.createdAt = this.createdAt;
            return obj;
        }
    }
}
