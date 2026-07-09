package com.zoho.connect.model;

import jakarta.persistence.*;
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    private String department;
    private String role; // "ROLE_EMPLOYEE", "ROLE_ADMIN"
    private String avatarUrl;
    private String status; // "Active", "On Leave", "Remote"
    private String bio;
    
    @Column(nullable = false, columnDefinition = "boolean default false")
    private Boolean resetRequested = false;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private Boolean resetApproved = false;

    private String resetPasswordTemp;
    private String resetInfo;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public Boolean getResetRequested() { return resetRequested; }
    public void setResetRequested(Boolean resetRequested) { this.resetRequested = resetRequested; }
    public Boolean getResetApproved() { return resetApproved; }
    public void setResetApproved(Boolean resetApproved) { this.resetApproved = resetApproved; }
    public String getResetPasswordTemp() { return resetPasswordTemp; }
    public void setResetPasswordTemp(String resetPasswordTemp) { this.resetPasswordTemp = resetPasswordTemp; }
    public String getResetInfo() { return resetInfo; }
    public void setResetInfo(String resetInfo) { this.resetInfo = resetInfo; }

    public User() {}

    public User(Long id, String email, String password, String name, String department, String role, String avatarUrl, String status, String bio, Boolean resetRequested, Boolean resetApproved, String resetPasswordTemp, String resetInfo) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.name = name;
        this.department = department;
        this.role = role;
        this.avatarUrl = avatarUrl;
        this.status = status;
        this.bio = bio;
        this.resetRequested = resetRequested != null ? resetRequested : false;
        this.resetApproved = resetApproved != null ? resetApproved : false;
        this.resetPasswordTemp = resetPasswordTemp;
        this.resetInfo = resetInfo;
    }

    public static UserBuilder builder() { return new UserBuilder(); }
    public static class UserBuilder {
        private Long id;
        private String email;
        private String password;
        private String name;
        private String department;
        private String role;
        private String avatarUrl;
        private String status;
        private String bio;
        private Boolean resetRequested;
        private Boolean resetApproved;
        private String resetPasswordTemp;
        private String resetInfo;
        public UserBuilder id(Long id) { this.id = id; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder name(String name) { this.name = name; return this; }
        public UserBuilder department(String department) { this.department = department; return this; }
        public UserBuilder role(String role) { this.role = role; return this; }
        public UserBuilder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }
        public UserBuilder status(String status) { this.status = status; return this; }
        public UserBuilder bio(String bio) { this.bio = bio; return this; }
        public UserBuilder resetRequested(Boolean resetRequested) { this.resetRequested = resetRequested; return this; }
        public UserBuilder resetApproved(Boolean resetApproved) { this.resetApproved = resetApproved; return this; }
        public UserBuilder resetPasswordTemp(String resetPasswordTemp) { this.resetPasswordTemp = resetPasswordTemp; return this; }
        public UserBuilder resetInfo(String resetInfo) { this.resetInfo = resetInfo; return this; }

        public User build() {
            User obj = new User();
            obj.id = this.id;
            obj.email = this.email;
            obj.password = this.password;
            obj.name = this.name;
            obj.department = this.department;
            obj.role = this.role;
            obj.avatarUrl = this.avatarUrl;
            obj.status = this.status;
            obj.bio = this.bio;
            obj.resetRequested = this.resetRequested != null ? this.resetRequested : false;
            obj.resetApproved = this.resetApproved != null ? this.resetApproved : false;
            obj.resetPasswordTemp = this.resetPasswordTemp;
            obj.resetInfo = this.resetInfo;
            return obj;
        }
    }
}
