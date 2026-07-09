package com.zoho.connect.repository;

import com.zoho.connect.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByTypeOrderByCreatedAtDesc(String type);
}
