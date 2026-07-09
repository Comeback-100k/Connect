package com.zoho.connect.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "forgot_password_requests")
public class ForgotPasswordRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;
    private String email;
    private String name;
    private LocalDateTime requestedAt;
    private String status; // "Pending", "Completed", "Rejected"

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public ForgotPasswordRequest() {}

    public ForgotPasswordRequest(Long employeeId, String email, String name, LocalDateTime requestedAt, String status) {
        this.employeeId = employeeId;
        this.email = email;
        this.name = name;
        this.requestedAt = requestedAt;
        this.status = status;
    }
}