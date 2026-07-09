package com.zoho.connect.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recognitions")
public class Recognition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false, length = 2000)
    private String message;

    @Column(length = 2000)
    private String mentionsJson; // JSON array of User IDs

    @Column(nullable = false)
    private String visibility; // PUBLIC, PRIVATE

    private String rewardBadge; // Optional

    @Column(length = 2000)
    private String reactionsJson; // JSON object mapping reactions to user IDs

    private LocalDateTime createdAt;

    public Recognition() {}

    public Recognition(User sender, User receiver, String category, String message, String mentionsJson, String visibility, String rewardBadge, String reactionsJson, LocalDateTime createdAt) {
        this.sender = sender;
        this.receiver = receiver;
        this.category = category;
        this.message = message;
        this.mentionsJson = mentionsJson;
        this.visibility = visibility;
        this.rewardBadge = rewardBadge;
        this.reactionsJson = reactionsJson;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }
    public User getReceiver() { return receiver; }
    public void setReceiver(User receiver) { this.receiver = receiver; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getMentionsJson() { return mentionsJson; }
    public void setMentionsJson(String mentionsJson) { this.mentionsJson = mentionsJson; }
    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }
    public String getRewardBadge() { return rewardBadge; }
    public void setRewardBadge(String rewardBadge) { this.rewardBadge = rewardBadge; }
    public String getReactionsJson() { return reactionsJson; }
    public void setReactionsJson(String reactionsJson) { this.reactionsJson = reactionsJson; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
