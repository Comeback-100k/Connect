package com.zoho.connect.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String content;

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    private LocalDateTime createdAt;
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Post getPost() { return post; }
    public void setPost(Post post) { this.post = post; }
    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Comment() {}

    public Comment(Long id, String content, Post post, User author, LocalDateTime createdAt) {
        this.id = id;
        this.content = content;
        this.post = post;
        this.author = author;
        this.createdAt = createdAt;
    }

    public static CommentBuilder builder() { return new CommentBuilder(); }
    public static class CommentBuilder {
        private Long id;
        private String content;
        private Post post;
        private User author;
        private LocalDateTime createdAt;
        public CommentBuilder id(Long id) { this.id = id; return this; }
        public CommentBuilder content(String content) { this.content = content; return this; }
        public CommentBuilder post(Post post) { this.post = post; return this; }
        public CommentBuilder author(User author) { this.author = author; return this; }
        public CommentBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Comment build() {
            Comment obj = new Comment();
            obj.id = this.id;
            obj.content = this.content;
            obj.post = this.post;
            obj.author = this.author;
            obj.createdAt = this.createdAt;
            return obj;
        }
    }
}
