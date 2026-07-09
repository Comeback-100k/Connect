package com.zoho.connect.repository;

import com.zoho.connect.model.ForgotPasswordRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ForgotPasswordRequestRepository extends JpaRepository<ForgotPasswordRequest, Long> {
    List<ForgotPasswordRequest> findByEmployeeIdOrderByRequestedAtDesc(Long employeeId);
    List<ForgotPasswordRequest> findByEmailOrderByRequestedAtDesc(String email);
    List<ForgotPasswordRequest> findAllByOrderByRequestedAtDesc();
}