package com.zoho.connect.repository;

import com.zoho.connect.model.Recognition;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RecognitionRepository extends JpaRepository<Recognition, Long> {
    List<Recognition> findAllByOrderByCreatedAtDesc();
}
