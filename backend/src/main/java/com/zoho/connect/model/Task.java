package com.zoho.connect.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    private String status; // "TODO", "IN_PROGRESS", "REVIEW", "DONE"
    private String priority; // "Low", "Medium", "High"
    
    @Column(name = "is_private")
    private Boolean isPrivate = false;
    
    @Column(name = "is_checklist")
    private Boolean isChecklist = false;
    
    @ManyToOne
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @ManyToOne
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    private LocalDate dueDate;
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public Boolean getIsPrivate() { return isPrivate; }
    public void setIsPrivate(Boolean isPrivate) { this.isPrivate = isPrivate; }
    public Boolean getIsChecklist() { return isChecklist; }
    public void setIsChecklist(Boolean isChecklist) { this.isChecklist = isChecklist; }
    public User getAssignee() { return assignee; }
    public void setAssignee(User assignee) { this.assignee = assignee; }
    public User getCreator() { return creator; }
    public void setCreator(User creator) { this.creator = creator; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public Task() {}

    public Task(Long id, String title, String description, String status, String priority, Boolean isPrivate, Boolean isChecklist, User assignee, User creator, LocalDate dueDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.isPrivate = isPrivate;
        this.isChecklist = isChecklist;
        this.assignee = assignee;
        this.creator = creator;
        this.dueDate = dueDate;
    }

    public static TaskBuilder builder() { return new TaskBuilder(); }
    public static class TaskBuilder {
        private Long id;
        private String title;
        private String description;
        private String status;
        private String priority;
        private Boolean isPrivate;
        private Boolean isChecklist;
        private User assignee;
        private User creator;
        private LocalDate dueDate;
        public TaskBuilder id(Long id) { this.id = id; return this; }
        public TaskBuilder title(String title) { this.title = title; return this; }
        public TaskBuilder description(String description) { this.description = description; return this; }
        public TaskBuilder status(String status) { this.status = status; return this; }
        public TaskBuilder priority(String priority) { this.priority = priority; return this; }
        public TaskBuilder isPrivate(Boolean isPrivate) { this.isPrivate = isPrivate; return this; }
        public TaskBuilder isChecklist(Boolean isChecklist) { this.isChecklist = isChecklist; return this; }
        public TaskBuilder assignee(User assignee) { this.assignee = assignee; return this; }
        public TaskBuilder creator(User creator) { this.creator = creator; return this; }
        public TaskBuilder dueDate(LocalDate dueDate) { this.dueDate = dueDate; return this; }

        public Task build() {
            Task obj = new Task();
            obj.id = this.id;
            obj.title = this.title;
            obj.description = this.description;
            obj.status = this.status;
            obj.priority = this.priority;
            obj.isPrivate = this.isPrivate;
            obj.isChecklist = this.isChecklist;
            obj.assignee = this.assignee;
            obj.creator = this.creator;
            obj.dueDate = this.dueDate;
            return obj;
        }
    }
}
