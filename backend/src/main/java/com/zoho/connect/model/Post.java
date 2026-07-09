package com.zoho.connect.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2000)
    private String content;

    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    private String category; // "ANNOUNCEMENT", "GENERAL", "KUDOS"
    
    // Kudos fields
    @ManyToOne
    @JoinColumn(name = "receiver_id")
    private User kudosReceiver;
    private String kudosType; // "Superstar", "Team Player", "Innovator", "Hero"

    private int likesCount;
    
    @Column(length = 2000)
    private String likedBy; // Comma-separated user IDs

    private LocalDateTime createdAt;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String imagesJson; // JSON array of [{ "url": "...", "description": "..." }]
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public User getKudosReceiver() { return kudosReceiver; }
    public void setKudosReceiver(User kudosReceiver) { this.kudosReceiver = kudosReceiver; }
    public String getKudosType() { return kudosType; }
    public void setKudosType(String kudosType) { this.kudosType = kudosType; }
    public int getLikesCount() { return likesCount; }
    public void setLikesCount(int likesCount) { this.likesCount = likesCount; }
    public String getLikedBy() { return likedBy; }
    public void setLikedBy(String likedBy) { this.likedBy = likedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getImagesJson() { return imagesJson; }
    public void setImagesJson(String imagesJson) { this.imagesJson = imagesJson; }

    public Post() {}

    public Post(Long id, String content, User author, String category, User kudosReceiver, String kudosType, int likesCount, String likedBy, LocalDateTime createdAt, String imagesJson) {
        this.id = id;
        this.content = content;
        this.author = author;
        this.category = category;
        this.kudosReceiver = kudosReceiver;
        this.kudosType = kudosType;
        this.likesCount = likesCount;
        this.likedBy = likedBy;
        this.createdAt = createdAt;
        this.imagesJson = imagesJson;
    }

    public static PostBuilder builder() { return new PostBuilder(); }
    public static class PostBuilder {
        private Long id;
        private String content;
        private User author;
        private String category;
        private User kudosReceiver;
        private String kudosType;
        private int likesCount;
        private String likedBy;
        private LocalDateTime createdAt;
        private String imagesJson;
        public PostBuilder id(Long id) { this.id = id; return this; }
        public PostBuilder content(String content) { this.content = content; return this; }
        public PostBuilder author(User author) { this.author = author; return this; }
        public PostBuilder category(String category) { this.category = category; return this; }
        public PostBuilder kudosReceiver(User kudosReceiver) { this.kudosReceiver = kudosReceiver; return this; }
        public PostBuilder kudosType(String kudosType) { this.kudosType = kudosType; return this; }
        public PostBuilder likesCount(int likesCount) { this.likesCount = likesCount; return this; }
        public PostBuilder likedBy(String likedBy) { this.likedBy = likedBy; return this; }
        public PostBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public PostBuilder imagesJson(String imagesJson) { this.imagesJson = imagesJson; return this; }

        public Post build() {
            Post obj = new Post();
            obj.id = this.id;
            obj.content = this.content;
            obj.author = this.author;
            obj.category = this.category;
            obj.kudosReceiver = this.kudosReceiver;
            obj.kudosType = this.kudosType;
            obj.likesCount = this.likesCount;
            obj.likedBy = this.likedBy;
            obj.createdAt = this.createdAt;
            obj.imagesJson = this.imagesJson;
            return obj;
        }
    }
}
