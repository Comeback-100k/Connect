package com.zoho.connect.model;

import jakarta.persistence.*;
@Entity
@Table(name = "groups_table")
public class Group {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;
    
    private boolean isPrivate; // true = private, false = public

    @Column(length = 2000)
    private String members; // Comma-separated user IDs of members

    @Column(length = 2000)
    private String pendingRequests; // Comma-separated user IDs requesting to join a private group
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public boolean getIsPrivate() { return isPrivate; }
    public void setIsPrivate(boolean isPrivate) { this.isPrivate = isPrivate; }
    public String getMembers() { return members; }
    public void setMembers(String members) { this.members = members; }
    public String getPendingRequests() { return pendingRequests; }
    public void setPendingRequests(String pendingRequests) { this.pendingRequests = pendingRequests; }

    public Group() {}

    public Group(Long id, String name, String description, boolean isPrivate, String members, String pendingRequests) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isPrivate = isPrivate;
        this.members = members;
        this.pendingRequests = pendingRequests;
    }

    public static GroupBuilder builder() { return new GroupBuilder(); }
    public static class GroupBuilder {
        private Long id;
        private String name;
        private String description;
        private boolean isPrivate;
        private String members;
        private String pendingRequests;
        public GroupBuilder id(Long id) { this.id = id; return this; }
        public GroupBuilder name(String name) { this.name = name; return this; }
        public GroupBuilder description(String description) { this.description = description; return this; }
        public GroupBuilder isPrivate(boolean isPrivate) { this.isPrivate = isPrivate; return this; }
        public GroupBuilder members(String members) { this.members = members; return this; }
        public GroupBuilder pendingRequests(String pendingRequests) { this.pendingRequests = pendingRequests; return this; }

        public Group build() {
            Group obj = new Group();
            obj.id = this.id;
            obj.name = this.name;
            obj.description = this.description;
            obj.isPrivate = this.isPrivate;
            obj.members = this.members;
            obj.pendingRequests = this.pendingRequests;
            return obj;
        }
    }
}
