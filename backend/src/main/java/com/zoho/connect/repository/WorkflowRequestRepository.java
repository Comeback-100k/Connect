package com.zoho.connect.repository;

import com.zoho.connect.model.WorkflowRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WorkflowRequestRepository extends JpaRepository<WorkflowRequest, Long> {
    List<WorkflowRequest> findByCreatorIdOrderByCreatedAtDesc(Long creatorId);
    List<WorkflowRequest> findAllByOrderByCreatedAtDesc();
}
