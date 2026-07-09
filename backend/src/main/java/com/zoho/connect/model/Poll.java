package com.zoho.connect.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "polls")
public class Poll {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String question;

    @Column(length = 1000, nullable = false)
    private String options; // Comma-separated list of choices

    @Column(length = 2000)
    private String votes; // format: "userId:optionIndex,userId:optionIndex"

    @ManyToOne
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    private LocalDateTime createdAt;

    @Column(length = 50)
    private String visibility;

    @Column(length = 2000)
    private String selectedEmployeeIds;

    @Column(length = 2000)
    private String selectedTeamIds;
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
    public String getOptions() { return options; }
    public void setOptions(String options) { this.options = options; }
    public String getVotes() { return votes; }
    public void setVotes(String votes) { this.votes = votes; }
    public User getCreator() { return creator; }
    public void setCreator(User creator) { this.creator = creator; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }
    public String getSelectedEmployeeIds() { return selectedEmployeeIds; }
    public void setSelectedEmployeeIds(String selectedEmployeeIds) { this.selectedEmployeeIds = selectedEmployeeIds; }
    public String getSelectedTeamIds() { return selectedTeamIds; }
    public void setSelectedTeamIds(String selectedTeamIds) { this.selectedTeamIds = selectedTeamIds; }

    public Poll() {}

    public Poll(Long id, String question, String options, String votes, User creator, LocalDateTime createdAt, String visibility, String selectedEmployeeIds, String selectedTeamIds) {
        this.id = id;
        this.question = question;
        this.options = options;
        this.votes = votes;
        this.creator = creator;
        this.createdAt = createdAt;
        this.visibility = visibility;
        this.selectedEmployeeIds = selectedEmployeeIds;
        this.selectedTeamIds = selectedTeamIds;
    }

    public static PollBuilder builder() { return new PollBuilder(); }
    public static class PollBuilder {
        private Long id;
        private String question;
        private String options;
        private String votes;
        private User creator;
        private LocalDateTime createdAt;
        private String visibility;
        private String selectedEmployeeIds;
        private String selectedTeamIds;
        public PollBuilder id(Long id) { this.id = id; return this; }
        public PollBuilder question(String question) { this.question = question; return this; }
        public PollBuilder options(String options) { this.options = options; return this; }
        public PollBuilder votes(String votes) { this.votes = votes; return this; }
        public PollBuilder creator(User creator) { this.creator = creator; return this; }
        public PollBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public PollBuilder visibility(String visibility) { this.visibility = visibility; return this; }
        public PollBuilder selectedEmployeeIds(String selectedEmployeeIds) { this.selectedEmployeeIds = selectedEmployeeIds; return this; }
        public PollBuilder selectedTeamIds(String selectedTeamIds) { this.selectedTeamIds = selectedTeamIds; return this; }

        public Poll build() {
            Poll obj = new Poll();
            obj.id = this.id;
            obj.question = this.question;
            obj.options = this.options;
            obj.votes = this.votes;
            obj.creator = this.creator;
            obj.createdAt = this.createdAt;
            obj.visibility = this.visibility;
            obj.selectedEmployeeIds = this.selectedEmployeeIds;
            obj.selectedTeamIds = this.selectedTeamIds;
            return obj;
        }
    }
}
